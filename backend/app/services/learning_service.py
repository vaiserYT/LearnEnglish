from sqlalchemy.orm import Session
from app.models import User, LearningPlan, UserLevel
from app.services.llm_service import llm_service
import json
from typing import List, Dict


class LearningService:
    """Service for managing learning plans and assessments"""

    @staticmethod
    async def assess_user_level(responses: List[str]) -> Dict:
        """Assess user's English level based on their responses"""
        prompt = f"""You are an English language assessment expert. Analyze these responses from a student and determine their level.

Student responses:
{json.dumps(responses, indent=2)}

Assess their level as one of: beginner, elementary, intermediate, upper_intermediate, advanced

Provide:
1. The determined level
2. Brief analysis of their strengths and weaknesses
3. 3-5 specific recommendations for improvement

Format your response as JSON:
{{
    "level": "level_here",
    "analysis": "detailed analysis here",
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendations": ["rec1", "rec2", "rec3"]
}}
"""

        messages = [
            {"role": "system", "content": "You are an expert English language teacher and assessor."},
            {"role": "user", "content": prompt}
        ]

        response = await llm_service.generate_completion(messages, temperature=0.3, max_tokens=800)

        # Parse JSON response
        try:
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "level": "intermediate",
                "analysis": response,
                "strengths": [],
                "weaknesses": [],
                "recommendations": ["Continue practicing daily", "Focus on conversation", "Read English content"]
            }

    @staticmethod
    async def create_learning_plan(user: User, db: Session) -> LearningPlan:
        """Create or update a learning plan for user"""
        existing_plan = db.query(LearningPlan).filter(LearningPlan.user_id == user.id).first()

        # Determine target level
        level_progression = {
            UserLevel.BEGINNER: UserLevel.ELEMENTARY,
            UserLevel.ELEMENTARY: UserLevel.INTERMEDIATE,
            UserLevel.INTERMEDIATE: UserLevel.UPPER_INTERMEDIATE,
            UserLevel.UPPER_INTERMEDIATE: UserLevel.ADVANCED,
            UserLevel.ADVANCED: UserLevel.ADVANCED
        }

        target_level = level_progression.get(user.level, UserLevel.INTERMEDIATE)

        # Generate personalized plan using LLM
        prompt = f"""Create a personalized English learning plan for a student.

Current level: {user.level.value}
Target level: {target_level.value}
Native language: {user.native_language}

The plan should focus on conversational English, not grammar rules. Include:
1. 3-5 focus areas (e.g., pronunciation, everyday vocabulary, listening comprehension)
2. Specific topics to practice (e.g., ordering food, making friends, job interviews)
3. Suggested exercise types

Format as JSON:
{{
    "focus_areas": ["area1", "area2", "area3"],
    "next_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
    "plan_description": "Brief description of the learning approach"
}}
"""

        messages = [
            {"role": "system", "content": "You are an expert English conversation teacher focused on practical communication skills."},
            {"role": "user", "content": prompt}
        ]

        response = await llm_service.generate_completion(messages, temperature=0.7, max_tokens=600)

        try:
            plan_data = json.loads(response)
        except json.JSONDecodeError:
            plan_data = {
                "focus_areas": ["conversation", "vocabulary", "pronunciation"],
                "next_topics": ["introductions", "daily routines", "hobbies", "travel", "food"],
                "plan_description": "Focus on natural conversation and practical English"
            }

        if existing_plan:
            existing_plan.current_level = user.level
            existing_plan.target_level = target_level
            existing_plan.focus_areas = plan_data.get("focus_areas", [])
            existing_plan.next_topics = plan_data.get("next_topics", [])
            existing_plan.plan_text = plan_data.get("plan_description", "")
            db.commit()
            db.refresh(existing_plan)
            return existing_plan
        else:
            plan = LearningPlan(
                user_id=user.id,
                current_level=user.level,
                target_level=target_level,
                focus_areas=plan_data.get("focus_areas", []),
                next_topics=plan_data.get("next_topics", []),
                weak_points=[],
                strong_points=[],
                plan_text=plan_data.get("plan_description", "")
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)
            return plan

    @staticmethod
    async def update_plan_after_conversation(user_id: int, conversation_data: Dict, db: Session):
        """Update learning plan based on conversation performance"""
        plan = db.query(LearningPlan).filter(LearningPlan.user_id == user_id).first()
        if not plan:
            return

        # Analyze conversation for weak and strong points
        prompt = f"""Analyze this conversation session and identify:
1. Strong points (what the student did well)
2. Weak points (areas needing improvement)
3. Updated focus areas

Conversation summary:
- Duration: {conversation_data.get('duration', 0)} seconds
- Messages: {conversation_data.get('message_count', 0)}
- Errors made: {json.dumps(conversation_data.get('errors', []))}

Current focus areas: {json.dumps(plan.focus_areas)}
Current weak points: {json.dumps(plan.weak_points)}

Provide updated recommendations as JSON:
{{
    "strong_points": ["point1", "point2"],
    "weak_points": ["point1", "point2"],
    "updated_focus_areas": ["area1", "area2", "area3"]
}}
"""

        messages = [
            {"role": "system", "content": "You are an English teacher analyzing student performance."},
            {"role": "user", "content": prompt}
        ]

        try:
            response = await llm_service.generate_completion(messages, temperature=0.5, max_tokens=500)
            updates = json.loads(response)

            plan.strong_points = updates.get("strong_points", plan.strong_points)
            plan.weak_points = updates.get("weak_points", plan.weak_points)
            plan.focus_areas = updates.get("updated_focus_areas", plan.focus_areas)

            db.commit()
        except Exception as e:
            print(f"Error updating plan: {e}")


learning_service = LearningService()
