from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserProgress
from app.schemas import UserProgressResponse
from app.routers.users import get_current_user
from app.models import User

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=UserProgressResponse)
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's learning progress statistics"""

    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()

    if not progress:
        # Create initial progress record
        progress = UserProgress(user_id=current_user.id)
        db.add(progress)
        db.commit()
        db.refresh(progress)

    return progress
