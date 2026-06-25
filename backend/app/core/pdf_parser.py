import io
import PyPDF2
import anyio
import structlog
from fastapi import HTTPException, status

logger = structlog.get_logger(__name__)

def extract_pdf_text_from_bytes_sync(pdf_bytes: bytes) -> str:
    """Synchronously extract text from a PDF memory buffer using PyPDF2.

    Args:
        pdf_bytes: The raw bytes of the PDF file.

    Returns:
        str: Extracted raw text.
    """
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text_content = [page.extract_text() for page in reader.pages if page.extract_text()]
        return "\n".join(text_content).strip()
    except Exception as exc:
        logger.error("pdf_extraction_failed", error=str(exc))
        raise ValueError("Failed to extract text from the provided PDF file.") from exc


async def parse_resume_text(pdf_bytes: bytes) -> str:
    """Asynchronously extract text from a PDF memory buffer.

    Offloads the synchronous PyMuPDF execution to a worker thread
    to prevent blocking the FastAPI event loop.

    Args:
        pdf_bytes: The raw bytes of the PDF file.

    Returns:
        str: Extracted raw text.

    Raises:
        HTTPException 400: If the PDF is corrupted or unreadable.
    """
    try:
        text = await anyio.to_thread.run_sync(extract_pdf_text_from_bytes_sync, pdf_bytes)
        if not text:
            raise ValueError("No text could be extracted from this PDF.")
        return text
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or unreadable PDF file.",
        ) from exc
