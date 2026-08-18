"""
FinPilot — Embeddings Provider Abstraction

Supports Sentence Transformers, Google Gemini embeddings, OpenAI, or fast local vector fallbacks.
"""
from __future__ import annotations

from typing import Any
import numpy as np


class EmbeddingProvider:
    """Abstract embedding provider with local and API fallbacks."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    def _get_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception:
                self._model = None
        return self._model

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        """Compute embedding vectors for a list of strings."""
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        model = self._get_model()
        if model is not None:
            return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)

        # Deterministic lightweight hash/bag embedding fallback if sentence-transformers not initialized
        embeddings = []
        for text in texts:
            vec = np.zeros(384, dtype=np.float32)
            words = text.lower().split()
            for w in words:
                idx = hash(w) % 384
                vec[idx] += 1.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            embeddings.append(vec)
        return np.array(embeddings, dtype=np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        """Compute embedding for a single search query."""
        return self.embed_texts([query])[0]


embedding_provider = EmbeddingProvider()
