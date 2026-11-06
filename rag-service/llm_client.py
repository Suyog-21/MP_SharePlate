"""
Universal OpenAI-compatible LLM client for the SharePlate RAG service.

Works with ANY source LLM provider that implements the OpenAI-style
`POST {base_url}/chat/completions` endpoint:
  - Grok (xAI)           (https://api.x.ai/v1)
  - Groq                 (https://api.groq.com/openai/v1)
  - OpenAI               (https://api.openai.com/v1)
  - OpenRouter / Together / Ollama / any self-hosted LLM

Features:
  1. Automatic provider detection from API key prefix (gsk_, xai-, sk-)
  2. Automatic URL / model correction when keys & URLs are mismatched
  3. Dynamic model fallback if the configured model is unavailable (404)
  4. Safe, user-friendly error formatting without leaking secrets
"""

import os
from typing import List, Optional, Tuple
from dotenv import load_dotenv
import httpx

# Ensure .env is loaded even if imported standalone
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(_ENV_PATH)


class LLMError(Exception):
    """
    Raised for any problem talking to the LLM provider.

    `user_message` is safe to show to the end user (no secrets).
    `status_code` is the HTTP status FastAPI should respond with.
    """

    def __init__(self, user_message: str, status_code: int = 502):
        super().__init__(user_message)
        self.user_message = user_message
        self.status_code = status_code


# ---------------------------------------------------------------------------
# Provider defaults & fallbacks
# ---------------------------------------------------------------------------

_PROVIDER_MAP = {
    "gsk_": {
        "label": "Groq",
        "base_url": "https://api.groq.com/openai/v1",
        "default_model": "openai/gpt-oss-120b",
        "fallbacks": ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"],
    },
    "xai-": {
        "label": "xAI (Grok)",
        "base_url": "https://api.x.ai/v1",
        "default_model": "grok-2-latest",
        "fallbacks": ["grok-2-latest", "grok-beta", "grok-2"],
    },
    "sk-": {
        "label": "OpenAI",
        "base_url": "https://api.openai.com/v1",
        "default_model": "gpt-4o-mini",
        "fallbacks": ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
    },
}

_PLACEHOLDER_KEYS = {
    "YOUR_XAI_API_KEY",
    "YOUR_API_KEY",
    "YOUR_GROQ_API_KEY",
    "YOUR_OPENAI_API_KEY",
}


def _detect_provider_from_key(api_key: str) -> Optional[dict]:
    """Return provider defaults based on key prefix."""
    for prefix, config in _PROVIDER_MAP.items():
        if api_key.startswith(prefix):
            return config
    return None


def _provider_label(base_url: str) -> str:
    lower = base_url.lower()
    if "groq.com" in lower:
        return "Groq"
    if "x.ai" in lower:
        return "xAI (Grok)"
    if "openai.com" in lower:
        return "OpenAI"
    if "openrouter.ai" in lower:
        return "OpenRouter"
    return "Custom OpenAI-compatible LLM"


def _resolve_config() -> Tuple[str, str, str, List[str]]:
    """
    Resolve (base_url, api_key, model, fallbacks).
    Corrects common mismatches (e.g. Groq key with xAI URL).
    """
    api_key = (os.getenv("LLM_API_KEY") or "").strip()
    env_base_url = (os.getenv("LLM_BASE_URL") or "").strip().rstrip("/")
    env_model = (os.getenv("LLM_CHAT_MODEL") or "").strip()

    if not api_key or api_key.upper() in _PLACEHOLDER_KEYS:
        raise LLMError(
            "LLM_API_KEY is not configured. Add a valid API key (Grok, Groq, OpenAI, etc.) to rag-service/.env.",
            500,
        )

    detected = _detect_provider_from_key(api_key)
    fallbacks: List[str] = []

    if detected:
        fallbacks.extend(detected.get("fallbacks", []))

    # Base URL resolution
    if env_base_url:
        # Check for obvious key vs URL mismatch:
        # E.g., user has a Groq key (gsk_...) but URL says x.ai
        if api_key.startswith("gsk_") and "x.ai" in env_base_url:
            print("[RAG] Auto-correcting base_url: Groq API key detected, switching to https://api.groq.com/openai/v1")
            base_url = "https://api.groq.com/openai/v1"
        elif api_key.startswith("xai-") and "groq.com" in env_base_url:
            print("[RAG] Auto-correcting base_url: xAI Grok API key detected, switching to https://api.x.ai/v1")
            base_url = "https://api.x.ai/v1"
        else:
            base_url = env_base_url
    elif detected:
        base_url = detected["base_url"]
    else:
        raise LLMError(
            "LLM_BASE_URL is not configured and could not be auto-detected. Add it to rag-service/.env.",
            500,
        )

    # Model resolution
    # Ignore placeholder or non-existent model defaults
    if env_model and env_model not in ("grok-4.7", "grok-4.3", "YOUR_MODEL"):
        model = env_model
    elif detected:
        model = detected["default_model"]
    else:
        model = "gpt-4o-mini"

    # Always ensure the chosen model is tried first
    all_models = [model] + [m for m in fallbacks if m != model]

    return base_url, api_key, model, all_models


def _sanitize_provider_error(response: httpx.Response) -> str:
    """Pull readable error message without leaking headers or secrets."""
    try:
        data = response.json()
    except Exception:
        text = (response.text or "").strip()
        return text[:300] if text else "(no error body returned)"

    message = None
    if isinstance(data, dict):
        error_field = data.get("error")
        if isinstance(error_field, dict):
            message = error_field.get("message")
        elif isinstance(error_field, str):
            message = error_field
        if not message:
            message = data.get("message")

    if not message:
        message = str(data)

    return str(message)[:300]


def _discover_available_models(base_url: str, api_key: str) -> List[str]:
    """Attempt to query GET /models to discover supported chat models."""
    try:
        url = f"{base_url}/models"
        res = httpx.get(url, headers={"Authorization": f"Bearer {api_key}"}, timeout=8.0)
        if res.status_code == 200:
            data = res.json().get("data", [])
            model_ids = [m["id"] for m in data if isinstance(m, dict) and "id" in m]
            # Filter for plausible chat models (avoid whisper, tts, embeddings, guardrails)
            chat_models = [
                m for m in model_ids
                if not any(ex in m for ex in ("whisper", "guard", "embed", "tts", "moderation", "audio"))
            ]
            return chat_models
    except Exception as exc:
        print(f"[RAG] Model discovery error: {exc}")
    return []


def _call_completions(
    base_url: str,
    api_key: str,
    model: str,
    messages: list,
    temperature: float = 0.2,
) -> Tuple[Optional[str], Optional[httpx.Response]]:
    """Execute a single completions call. Returns (content, response_obj)."""
    url = f"{base_url}/chat/completions"
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=40.0)
    except httpx.RequestError as exc:
        raise LLMError(
            f"Could not reach LLM provider ({_provider_label(base_url)}). Check connection or LLM_BASE_URL.",
            502,
        )

    if response.status_code == 200:
        try:
            data = response.json()
        except Exception:
            raise LLMError("LLM provider returned invalid JSON.", 502)

        choices = data.get("choices") if isinstance(data, dict) else None
        if not choices or not isinstance(choices, list):
            raise LLMError("LLM provider response missing 'choices'.", 502)

        message_obj = choices[0].get("message") if isinstance(choices[0], dict) else None
        content = message_obj.get("content") if isinstance(message_obj, dict) else None

        if content is None:
            raise LLMError("LLM response missing message content.", 502)

        return content, response

    return None, response


def call_llm(messages: list, temperature: float = 0.2) -> str:
    """
    Call the configured OpenAI-compatible chat completions endpoint.

    Auto-retries with fallbacks or discovered models if the initial model
    returns 404 (model not found).
    """
    base_url, api_key, primary_model, candidate_models = _resolve_config()

    # Try candidate models
    last_response: Optional[httpx.Response] = None
    tried_models = set()

    for model in candidate_models:
        if model in tried_models:
            continue
        tried_models.add(model)

        content, response = _call_completions(base_url, api_key, model, messages, temperature)
        if content is not None:
            return content

        last_response = response
        if response and response.status_code == 404:
            # Model not found on account, try next fallback
            print(f"[RAG] Model '{model}' returned 404 on {_provider_label(base_url)}. Trying fallback...")
            continue
        else:
            # Not a 404 (e.g. 401 auth failed, 429 rate limit, 500 server error)
            break

    # If all candidate models gave 404, try querying /models dynamically
    if last_response and last_response.status_code == 404:
        print("[RAG] Attempting dynamic model discovery...")
        discovered = _discover_available_models(base_url, api_key)
        for model in discovered:
            if model in tried_models:
                continue
            tried_models.add(model)
            print(f"[RAG] Trying discovered model '{model}'...")
            content, response = _call_completions(base_url, api_key, model, messages, temperature)
            if content is not None:
                return content
            last_response = response
            if response and response.status_code != 404:
                break

    # If we reached here, handle the final error
    if last_response is not None:
        status = last_response.status_code
        sanitized = _sanitize_provider_error(last_response)
        label = _provider_label(base_url)

        print(
            f"[RAG] LLM error from {label}.\n"
            f"  Base URL: {base_url}\n"
            f"  Model: {primary_model}\n"
            f"  HTTP status: {status}\n"
            f"  Error: {sanitized}"
        )

        if status == 401:
            raise LLMError(f"LLM authentication failed for {label}. Check LLM_API_KEY in rag-service/.env.", 401)
        if status == 403:
            raise LLMError(f"LLM access forbidden for {label}. Check API key permissions.", 403)
        if status == 404:
            raise LLMError(
                f"LLM model '{primary_model}' was not found on {label}. Please update LLM_CHAT_MODEL in rag-service/.env.",
                404,
            )
        if status == 429:
            raise LLMError(f"{label} rate limit reached. Please wait a moment and try again.", 429)
        if status >= 500:
            raise LLMError(f"{label} returned server error ({status}). Try again shortly.", 502)

        raise LLMError(f"{label} rejected the request ({status}): {sanitized}", status)

    raise LLMError("Failed to communicate with LLM provider.", 502)
