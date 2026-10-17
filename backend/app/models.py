from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, JSON, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserLevel(str, enum.Enum):
    BEGINNER = "beginner"
    ELEMENTARY = "elementary"
    INTERMEDIATE = "intermediate"
    UPPER_INTERMEDIATE = "upper_intermediate"
    ADVANCED = "advanced"


class ExerciseType(str, enum.Enum):
    CONVERSATION = "conversation"
    ROLE_PLAY = "role_play"
    STORY_TELLING = "story_telling"
    VOCABULARY = "vocabulary"
    PRONUNCIATION = "pronunciation"
    LISTENING = "listening"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    level = Column(Enum(UserLevel), default=UserLevel.BEGINNER)
    native_language = Column(String, default="Russian")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    learning_plan = relationship("LearningPlan", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    learned_expressions = relationship("LearnedExpression", back_populates="user", cascade="all, delete-orphan")
    error_records = relationship("ErrorRecord", back_populates="user", cascade="all, delete-orphan")


class LearningPlan(Base):
    __tablename__ = "learning_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    current_level = Column(Enum(UserLevel), nullable=False)
    target_level = Column(Enum(UserLevel), nullable=False)
    focus_areas = Column(JSON, default=list)  # ["pronunciation", "vocabulary", "grammar"]
    weak_points = Column(JSON, default=list)  # ["past_tense", "prepositions"]
    strong_points = Column(JSON, default=list)
    next_topics = Column(JSON, default=list)
    plan_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="learning_plan")
    exercises = relationship("Exercise", back_populates="learning_plan", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    learning_plan_id = Column(Integer, ForeignKey("learning_plans.id"), nullable=False)
    type = Column(Enum(ExerciseType), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    content = Column(JSON)  # Exercise-specific content
    difficulty = Column(Integer, default=1)  # 1-5
    completed = Column(Boolean, default=False)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    learning_plan = relationship("LearningPlan", back_populates="exercises")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    topic = Column(String)
    exercise_type = Column(Enum(ExerciseType), default=ExerciseType.CONVERSATION)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    audio_url = Column(String, nullable=True)
    corrections = Column(JSON, nullable=True)  # List of corrections
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_conversations = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    total_hours = Column(Float, default=0.0)
    vocabulary_size = Column(Integer, default=0)
    fluency_score = Column(Float, default=0.0)  # 0-100
    pronunciation_score = Column(Float, default=0.0)  # 0-100
    grammar_score = Column(Float, default=0.0)  # 0-100
    comprehension_score = Column(Float, default=0.0)  # 0-100
    streak_days = Column(Integer, default=0)
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="progress")


class LearnedExpression(Base):
    __tablename__ = "learned_expressions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expression = Column(String, nullable=False)
    translation = Column(String)
    context = Column(Text)
    example_sentence = Column(Text)
    mastery_level = Column(Integer, default=0)  # 0-5
    times_used = Column(Integer, default=0)
    last_used = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="learned_expressions")


class ErrorRecord(Base):
    __tablename__ = "error_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    error_type = Column(String, nullable=False)  # "grammar", "vocabulary", "pronunciation"
    incorrect_text = Column(Text, nullable=False)
    correct_text = Column(Text, nullable=False)
    explanation = Column(Text)
    context = Column(Text)
    times_made = Column(Integer, default=1)
    last_occurred = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)

    user = relationship("User", back_populates="error_records")
