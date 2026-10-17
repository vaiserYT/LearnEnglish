from sqlalchemy.orm import Session
from app.models import Conversation, Message, User, ErrorRecord, UserProgress
from app.services.llm_service import llm_service
from typing import List, Dict
import json
from datetime import datetime


class ConversationService:
    """Service for managing conversations and generating AI responses"""

    @staticmethod
    async def generate_ai_response(
        conversation: Conversation,
        user_message: str,
        user: User,
        db: Session
    ) -> Dict:
        """Generate AI response based on conversation context and user level"""

        # Get conversation history
        messages = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at).all()

        # Build context for LLM
        conversation_history = []
        for msg in messages[-10:]:  # Last 10 messages for context
            conversation_history.append({
                "role": msg.role,
                "content": msg.content
            })

        # Add current user message
        conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Create system prompt based on user level and conversation type
        system_prompt = ConversationService._create_system_prompt(user, conversation)

        # Prepare messages for LLM
        llm_messages = [
            {"role": "system", "content": system_prompt},
            *conversation_history
        ]

        # Generate response
        ai_response = await llm_service.generate_completion(
            llm_messages,
            temperature=0.8,
            max_tokens=500
        )

        # Analyze user message for errors
        corrections = await ConversationService._analyze_errors(
            user_message,
            user.level,
            user.native_language
        )

        return {
            "content": ai_response,
            "corrections": corrections
        }

    @staticmethod
    def _create_system_prompt(user: User, conversation: Conversation) -> str:
        """Create contextual system prompt"""
        level_descriptions = {
            "beginner": "Use simple words and short sentences. Speak slowly and clearly.",
            "elementary": "Use everyday vocabulary. Keep sentences simple but can be slightly longer.",
            "intermediate": "Use natural conversational English. Introduce some idioms and common expressions.",
            "upper_intermediate": "Speak naturally with varied vocabulary. Use idioms and colloquialisms.",
            "advanced": "Engage in sophisticated conversation with advanced vocabulary and nuanced expressions."
        }

        level_desc = level_descriptions.get(user.level.value, level_descriptions["intermediate"])

        prompt = f"""You are a friendly, encouraging English conversation teacher helping a student practice conversational English.

Student Profile:
- Level: {user.level.value}
- Native language: {user.native_language}
- Conversation topic: {conversation.topic or "General conversation"}

Your role:
1. Engage in natural, interesting conversation about {conversation.topic or "various topics"}
2. {level_desc}
3. Be encouraging and supportive
4. Ask follow-up questions to keep the conversation flowing
5. Occasionally introduce new vocabulary or expressions naturally
6. If the student makes significant errors, gently correct them in your response
7. Focus on communication, not grammar lectures

Conversation style:
- Be warm and personable
- Show genuine interest in what the student says
- Keep the conversation flowing naturally
- Occasionally check if they understand: "Does that make sense?" or "Do you know what I mean?"
- Celebrate their progress and efforts

Remember: Your goal is to help them speak more fluently and confidently, not to teach grammar rules.
"""
        return prompt

    @staticmethod
    async def _analyze_errors(message: str, level: str, native_language: str) -> List[Dict]:
        """Analyze user message for errors and provide corrections"""

        prompt = f"""Analyze this English message from a {level} level student (native language: {native_language}).

Message: "{message}"

Identify any significant errors in:
1. Grammar
2. Vocabulary (wrong word choice)
3. Natural expression (unnatural phrasing)

Only report errors that would help them improve. Minor issues are fine for their level.

Format as JSON array:
[
    {{
        "type": "grammar|vocabulary|expression",
        "incorrect": "the incorrect part",
        "correct": "the correction",
        "explanation": "brief explanation"
    }}
]

If there are no significant errors, return an empty array: []
"""

        messages = [
            {"role": "system", "content": "You are an English teacher focused on helping students improve."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await llm_service.generate_completion(messages, temperature=0.3, max_tokens=400)
            corrections = json.loads(response)
            return corrections if isinstance(corrections, list) else []
        except Exception as e:
            print(f"Error analyzing message: {e}")
            return []

    @staticmethod
    async def save_errors_to_db(
        user_id: int,
        corrections: List[Dict],
        context: str,
        db: Session
    ):
        """Save identified errors to database for tracking"""
        for correction in corrections:
            # Check if similar error exists
            existing = db.query(ErrorRecord).filter(
                ErrorRecord.user_id == user_id,
                ErrorRecord.incorrect_text == correction.get("incorrect"),
                ErrorRecord.resolved == False
            ).first()

            if existing:
                existing.times_made += 1
                existing.last_occurred = datetime.utcnow()
                existing.context = context
            else:
                error = ErrorRecord(
                    user_id=user_id,
                    error_type=correction.get("type", "grammar"),
                    incorrect_text=correction.get("incorrect", ""),
                    correct_text=correction.get("correct", ""),
                    explanation=correction.get("explanation", ""),
                    context=context,
                    times_made=1
                )
                db.add(error)

        db.commit()

    @staticmethod
    def update_user_progress(user_id: int, db: Session):
        """Update user progress statistics"""
        progress = db.query(UserProgress).filter(UserProgress.user_id == user_id).first()

        if not progress:
            progress = UserProgress(user_id=user_id)
            db.add(progress)

        # Update message count
        total_messages = db.query(Message).join(Conversation).filter(
            Conversation.user_id == user_id
        ).count()

        progress.total_messages = total_messages
        progress.last_activity = datetime.utcnow()

        db.commit()


conversation_service = ConversationService()
