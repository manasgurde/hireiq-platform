import asyncio
import os
import sys

# Add the backend folder to sys.path to allow importing app modules
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.core.database import AsyncSessionLocal
from app.models.job import Job
from app.models.application import Application
from app.models.user import User
from sqlalchemy import select
from sqlalchemy.orm import joinedload

async def main():
    async with AsyncSessionLocal() as db:
        # Get users
        res = await db.execute(select(User))
        users = res.scalars().all()
        print("Users:")
        for u in users:
            print(f" - {u.id} | {u.email} | {u.role}")

        # Get jobs
        res = await db.execute(select(Job))
        jobs = res.scalars().all()
        print("\nJobs:")
        for j in jobs:
            print(f" - {j.id} | {j.title} | recruiter_id: {j.recruiter_id}")

        # Get applications
        res = await db.execute(select(Application).options(joinedload(Application.job)))
        apps = res.scalars().all()
        print("\nApplications:")
        for a in apps:
            print(f" - {a.id} | job_id: {a.job_id} | candidate_id: {a.candidate_id}")
            if a.job:
                print(f"   job title: {a.job.title} | job recruiter_id: {a.job.recruiter_id}")
            else:
                print("   job is None")

if __name__ == "__main__":
    asyncio.run(main())
