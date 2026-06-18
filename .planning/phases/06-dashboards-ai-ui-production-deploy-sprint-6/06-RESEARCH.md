# Phase 6: Dashboards, AI UI & Production Deploy — Research

**Gathered:** 2026-06-18
**Phase:** 06-dashboards-ai-ui-production-deploy-sprint-6

---

## 1. Recharts Dashboard Responsiveness & Aesthetics
To create a high-end, modern dashboard that fits the "HireIQ" brand (neon accents, glassmorphism, dark mode):

- **Responsiveness**: All Recharts components (`BarChart`, `LineChart`) MUST be wrapped in `<ResponsiveContainer>` so they fluidly match their parent's width.
- **Aspect Ratios**: Instead of hardcoding `height={400}`, setting `aspect={16/9}` or `aspect={3}` ensures charts adapt correctly on mobile devices without squishing.
- **Data Densification**: The recruiter dashboard will show aggregations (e.g., applications per day over the last week) to avoid rendering raw, overwhelming data points.
- **Styling**: We will use custom Recharts `<Tooltip>` components styled with Tailwind CSS (glassmorphic backgrounds, rounded borders) to make them look premium, overriding the default SVG styles.

![Recruiter Dashboard Concept](C:\Users\manas\.gemini\antigravity-ide\brain\ee32bca2-d2ef-4181-be4b-4bf15f57fcdb\recruiter_dashboard_mockup_1781754257101.png)

## 2. AI Chat Interview UI
The AI Interview interface requires an interactive, real-time feel to give candidates the illusion of speaking with an active agent.

- **Split Layout**: Left side contains the scrolling chat log. Right side contains a fixed sidebar showing "Current Progress", "Detected Skill Gaps", and the "Live SBERT Semantic Score".
- **Typing Indicators**: We must add artificial delay/typing bubbles (`...`) before the AI responds to make it feel human-like.
- **Streaming (Optional)**: If the backend supports it, but for our SBERT scoring engine, the response is instantaneous upon candidate submission.

![AI Interview Chat Concept](C:\Users\manas\.gemini\antigravity-ide\brain\ee32bca2-d2ef-4181-be4b-4bf15f57fcdb\ai_interview_chat_mockup_1781754269247.png)

## 3. Production Deployment Architecture (AWS ECS + RDS)
To deploy the full-stack ATS securely and scalably, we will use Terraform to define an AWS footprint:

- **VPC Segmentation**:
  - **Public Subnet**: Holds the Application Load Balancer (ALB) and NAT Gateway.
  - **Private Subnet**: Holds the ECS Fargate tasks (Core API + AI Microservice), RDS PostgreSQL, and ElastiCache Redis.
- **Zero Trust Security Groups**:
  - Load Balancer: Ingress 80/443 from Internet.
  - ECS Tasks: Ingress 8000/8001 only from Load Balancer.
  - RDS/Redis: Ingress 5432/6379 only from ECS Tasks.
- **Secrets Manager**: Essential for storing `DATABASE_URL` and Auth keys safely away from plain text environment variables.

---
**Conclusion:** We are ready to execute the final UI and Deployment plans.
