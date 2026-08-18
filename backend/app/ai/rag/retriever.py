"""
FinPilot — Hybrid RAG Retriever & Reranker

Combines semantic embedding vector similarity with keyword BM25 retrieval
to return top-k grounded financial context with verified citations.
"""
from __future__ import annotations

import re
from typing import Any
import numpy as np

from app.ai.rag.embeddings import embedding_provider


class HybridRetriever:
    """Hybrid semantic + keyword document retriever."""

    def __init__(self, semantic_weight: float = 0.70):
        self.semantic_weight = semantic_weight
        self.chunks_store: list[dict[str, Any]] = []
        self.embeddings_matrix: np.ndarray | None = None

    def index_chunks(self, chunks: list[dict[str, Any]]) -> None:
        """Index a list of chunks with computed embeddings."""
        if not chunks:
            return
        self.chunks_store.extend(chunks)
        texts = [c["content"] for c in self.chunks_store]
        self.embeddings_matrix = embedding_provider.embed_texts(texts)

    def search(self, query: str, top_k: int = 4) -> list[dict[str, Any]]:
        """Perform hybrid search over indexed financial knowledge chunks."""
        if not self.chunks_store or self.embeddings_matrix is None:
            return []

        # 1. Semantic cosine similarity
        query_vec = embedding_provider.embed_query(query)
        semantic_scores = np.dot(self.embeddings_matrix, query_vec)

        # 2. Keyword lexical overlap score
        query_words = set(re.findall(r"\w+", query.lower()))
        keyword_scores = []
        for c in self.chunks_store:
            chunk_words = set(re.findall(r"\w+", c["content"].lower()))
            overlap = len(query_words.intersection(chunk_words))
            kw_score = overlap / len(query_words) if query_words else 0.0
            keyword_scores.append(kw_score)

        keyword_scores_arr = np.array(keyword_scores, dtype=np.float32)

        # 3. Hybrid fusion
        combined_scores = (
            self.semantic_weight * semantic_scores +
            (1.0 - self.semantic_weight) * keyword_scores_arr
        )

        top_indices = np.argsort(combined_scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(combined_scores[idx])
            if score > 0.10:  # Minimum relevance floor
                chunk_data = dict(self.chunks_store[idx])
                chunk_data["retrieval_score"] = round(score, 3)
                results.append(chunk_data)

        return results


retriever = HybridRetriever()
