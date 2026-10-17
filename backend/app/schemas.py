from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserLevel(str, Enum):
    BEGINNER = "beginner"
    ELEMENTARY = "elementary"
    INTERMEDIATE = "intermediate"
    UPPER_INTERMEDIATE = "upper_intermediate"
    ADVANCED = "advanced"


class ExerciseType(str, Enum):
    CONVERSATION = "conversation"
    ROLE_PLAY = "role_play"
    STORY_TELLING = "story_telling"
    VOCABULARY = "vocabulary"
    PRONUNCIATION = "pronunciation"
    LISTENING = "listening"


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    native_language: str = "Russian"


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    level: UserLevel
    native_language: str
    created_at: datetime

    class Config:
        from_attributes = True


# Learning Plan Schemas
class LearningPlanResponse(BaseModel):
    id: int
    current_level: UserLevel
    target_level: UserLevel
    focus_areas: List[str]
    weak_points: List[str]
    strong_points: List[str]
    next_topics: List[str]
    plan_text: Optional[str]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Message Schemas
class MessageCreate(BaseModel):
    content: str
    audio_data: Optional[str] = None


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    audio_url: Optional[str]
    corrections: Optional[List[dict]]
    feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Conversation Schemas
class ConversationCreate(BaseModel):
    title: str
    topic: Optional[str] = None
    exercise_type: ExerciseType = ExerciseType.CONVERSATION


class ConversationResponse(BaseModel):
    id: int
    title: str
    topic: Optional[str]
    exercise_type: ExerciseType
    started_at: datetime
    ended_at: Optional[datetime]
    duration_seconds: int
    is_active: bool
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


# Progress Schemas
class UserProgressResponse(BaseModel):
    total_conversations: int
    total_messages: int
    total_hours: float
    vocabulary_size: int
    fluency_score: float
    pronunciation_score: float
    grammar_score: float
    comprehension_score: float
    streak_days: int
    last_activity: datetime

    class Config:
        from_attributes = True


# Assessment Schemas
class AssessmentRequest(BaseModel):
    responses: List[str]


class AssessmentResponse(BaseModel):
    level: UserLevel
    analysis: str
    recommendations: List[str]


# AI Response
class AIMessageResponse(BaseModel):
    message: MessageResponse
    should_update_plan: bool = False
