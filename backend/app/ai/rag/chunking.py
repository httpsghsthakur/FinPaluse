"""
FinPilot — Configurable Document Chunking

Splits documents into overlapping chunks with rich metadata:
- document_id, section, page, paragraph, source, filing_date
"""
from __future__ import annotations

import re
from typing import Any


class DocumentChunker:
    """Configurable document text chunker with metadata retention."""

    def __init__(self, chunk_size_words: int = 400, overlap_words: int = 100):
        self.chunk_size_words = chunk_size_words
        self.overlap_words = overlap_words

    def chunk_document(
        self,
        document_id: str,
        text: str,
        doc_metadata: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """Split document text into indexed chunks."""
        meta = doc_metadata or {}
        # Clean text
        normalized = re.sub(r"\s+", " ", text).strip()
        words = normalized.split(" ")

        chunks: list[dict[str, Any]] = []
        start_idx = 0
        chunk_idx = 0

        while start_idx < len(words):
            end_idx = min(len(words), start_idx + self.chunk_size_words)
            chunk_words = words[start_idx:end_idx]
            chunk_text = " ".join(chunk_words)

            chunks.append({
                "id": f"{document_id}_chunk_{chunk_idx}",
                "document_id": document_id,
                "chunk_index": chunk_idx,
                "content": chunk_text,
                "token_count": len(chunk_words),
                "section": meta.get("section", "Main"),
                "page": meta.get("page", 1),
                "document_type": meta.get("document_type", "financial_doc"),
                "company": meta.get("company"),
                "ticker": meta.get("ticker"),
                "source": meta.get("source", "user_upload"),
                "filing_type": meta.get("filing_type"),
                "filing_date": meta.get("filing_date"),
            })

            chunk_idx += 1
            start_idx += self.chunk_size_words - self.overlap_words
            if end_idx >= len(words):
                break

        return chunks


document_chunker = DocumentChunker()
