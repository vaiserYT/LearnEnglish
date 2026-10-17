from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LearningPlan, UserProgress
from app.schemas import UserResponse, LearningPlanResponse, AssessmentRequest, AssessmentResponse, UserLevel
from app.services.learning_service import learning_service
from app.auth import verify_token
from typing import Optional

router = APIRouter(prefix="/users", tags=["users"])


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Get current authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.post("/assess", response_model=AssessmentResponse)
async def assess_user_level(
    assessment: AssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assess user's English level based on their responses"""

    result = await learning_service.assess_user_level(assessment.responses)

    # Update user level
    current_user.level = UserLevel(result["level"])
    db.commit()

    # Create initial learning plan
    await learning_service.create_learning_plan(current_user, db)

    # Create progress record
    if not current_user.progress:
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        db.commit()

    return AssessmentResponse(
        level=UserLevel(result["level"]),
        analysis=result.get("analysis", ""),
        recommendations=result.get("recommendations", [])
    )


@router.get("/learning-plan", response_model=LearningPlanResponse)
async def get_learning_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's learning plan"""

    plan = db.query(LearningPlan).filter(LearningPlan.user_id == current_user.id).first()

    if not plan:
        # Create initial plan
        plan = await learning_service.create_learning_plan(current_user, db)

    return plan


@router.post("/learning-plan/refresh", response_model=LearningPlanResponse)
async def refresh_learning_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate learning plan based on current progress"""

    plan = await learning_service.create_learning_plan(current_user, db)
    return plan
