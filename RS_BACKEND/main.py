from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import os
import career_recommender

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

# Initialize FastAPI app
app = FastAPI(title="Career Recommender API")

# Define input model
class UserBackground(BaseModel):
    degree: str
    skills: List[str]
    experience: str
    interests: List[str]
    career_roles: List[str]

@app.post("/generate_roadmaps")
async def generate_roadmaps(user_background: UserBackground):
    try:
        # Convert Pydantic model to dict
        user_background_dict = user_background.dict()

        # Generate roadmaps
        roadmaps = career_recommender.generate_roadmaps(
            user_background=user_background_dict,
            career_roles=user_background_dict["career_roles"],
            api_key=GOOGLE_API_KEY
        )

        if roadmaps and not roadmaps[0].get("error"):
            return {"status": "success", "careerRoadmaps": roadmaps}
        else:
            raise HTTPException(
                status_code=500,
                detail={"error": "Failed to generate roadmaps", "raw": roadmaps[0].get("raw") if roadmaps else None}
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}