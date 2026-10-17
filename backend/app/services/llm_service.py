import httpx
from typing import List, Dict, Optional
from app.config import settings


class LLMService:
    """Unified interface for OpenAI and Claude API"""

    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()

    async def generate_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        """Generate completion using configured LLM provider"""
        if self.provider == "openai":
            return await self._openai_completion(messages, temperature, max_tokens)
        elif self.provider == "claude":
            return await self._claude_completion(messages, temperature, max_tokens)
        else:
            raise ValueError(f"Unknown LLM provider: {self.provider}")

    async def _openai_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int
    ) -> str:
        """OpenAI API completion"""
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.OPENAI_API_BASE}/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _claude_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int
    ) -> str:
        """Claude API completion"""
        headers = {
            "x-api-key": settings.CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }

        # Convert messages format for Claude
        system_message = None
        claude_messages = []

        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                claude_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        payload = {
            "model": settings.CLAUDE_MODEL,
            "messages": claude_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        if system_message:
            payload["system"] = system_message

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.CLAUDE_API_BASE}/v1/messages",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]


llm_service = LLMService()
