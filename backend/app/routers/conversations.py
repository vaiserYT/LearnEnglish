from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Conversation, Message
from app.schemas import ConversationCreate, ConversationResponse, MessageCreate, MessageResponse, AIMessageResponse
from app.routers.users import get_current_user
from app.services.conversation_service import conversation_service
from app.services.learning_service import learning_service
from typing import List
from datetime import datetime

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new conversation"""

    conversation = Conversation(
        user_id=current_user.id,
        title=conversation_data.title,
        topic=conversation_data.topic,
        exercise_type=conversation_data.exercise_type,
        is_active=True
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    # Generate opening message from AI
    opening_prompt = f"Start a friendly conversation about {conversation.topic or 'general topics'}. Introduce yourself and ask an engaging opening question."

    ai_response = await conversation_service.generate_ai_response(
        conversation,
        opening_prompt,
        current_user,
        db
    )

    # Save AI's opening message
    ai_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response["content"]
    )
    db.add(ai_message)
    db.commit()

    # Reload to get messages
    db.refresh(conversation)

    return conversation


@router.get("", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Get user's conversations"""

    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.started_at.desc()).limit(limit).all()

    return conversations


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific conversation with messages"""

    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    return conversation


@router.post("/{conversation_id}/messages", response_model=AIMessageResponse)
async def send_message(
    conversation_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in conversation and get AI response"""

    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=message_data.content
    )
    db.add(user_message)
    db.commit()

    # Generate AI response
    ai_response = await conversation_service.generate_ai_response(
        conversation,
        message_data.content,
        current_user,
        db
    )

    # Save AI message
    ai_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_response["content"],
        corrections=ai_response.get("corrections")
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    # Save errors if any
    if ai_response.get("corrections"):
        await conversation_service.save_errors_to_db(
            current_user.id,
            ai_response["corrections"],
            message_data.content,
            db
        )

    # Update progress
    conversation_service.update_user_progress(current_user.id, db)

    return AIMessageResponse(
        message=MessageResponse.model_validate(ai_message),
        should_update_plan=len(ai_response.get("corrections", [])) > 0
    )


@router.post("/{conversation_id}/end")
async def end_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """End a conversation and update learning plan"""

    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # End conversation
    conversation.is_active = False
    conversation.ended_at = datetime.utcnow()

    if conversation.started_at:
        duration = (datetime.utcnow() - conversation.started_at).total_seconds()
        conversation.duration_seconds = int(duration)

    # Get conversation data for analysis
    message_count = db.query(Message).filter(Message.conversation_id == conversation_id).count()

    conversation_data = {
        "duration": conversation.duration_seconds,
        "message_count": message_count,
        "errors": []  # Could collect errors here
    }

    # Update learning plan
    await learning_service.update_plan_after_conversation(
        current_user.id,
        conversation_data,
        db
    )

    db.commit()

    return {"message": "Conversation ended successfully"}
