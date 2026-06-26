"""
Phase 10 — Email service using Resend
https://resend.com/docs/api-reference/emails/send-email
"""
from __future__ import annotations

import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_BASE = "https://api.resend.com"


async def send_email(
    to: str | list[str],
    subject: str,
    html: str,
    from_email: str | None = None,
) -> bool:
    """
    Send a transactional email via Resend.
    Returns True on success, False on error (non-blocking by design).
    """
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — email sending skipped")
        return False

    recipients = [to] if isinstance(to, str) else to
    payload = {
        "from": from_email or settings.EMAIL_FROM,
        "to": recipients,
        "subject": subject,
        "html": html,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{RESEND_BASE}/emails",
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
            resp.raise_for_status()
            logger.info("Email sent to %s (subject=%s)", recipients, subject)
            return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", recipients, exc)
        return False


# ── Templated emails ──────────────────────────────────────────────────────────

async def send_application_received(recruiter_email: str, candidate_name: str, job_title: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#3b82f6">New Application Received</h2>
      <p><strong>{candidate_name}</strong> has applied to <strong>{job_title}</strong>.</p>
      <p>Log in to <a href="https://hireiq.app/recruiter/dashboard">HireIQ</a> to review their profile.</p>
    </div>
    """
    return await send_email(recruiter_email, f"New Application: {job_title}", html)


async def send_status_update(candidate_email: str, job_title: str, new_status: str) -> bool:
    status_messages = {
        "reviewing": "is being reviewed by the recruiter",
        "shortlisted": "has been shortlisted!",
        "interview": "has been selected for an interview",
        "rejected": "was not selected for this role",
        "hired": "has been accepted — Congratulations!",
    }
    msg = status_messages.get(new_status, f"status has been updated to: {new_status}")
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#3b82f6">Application Update</h2>
      <p>Your application for <strong>{job_title}</strong> {msg}.</p>
      <p>Visit <a href="https://hireiq.app/candidate/dashboard">your dashboard</a> for details.</p>
    </div>
    """
    return await send_email(candidate_email, f"Application Update: {job_title}", html)


async def send_welcome_email(user_email: str, name: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#3b82f6">Welcome to HireIQ, {name}!</h2>
      <p>Your account is ready. Start exploring AI-powered hiring today.</p>
      <a href="https://hireiq.app" style="background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:12px">
        Open HireIQ
      </a>
    </div>
    """
    return await send_email(user_email, "Welcome to HireIQ!", html)
