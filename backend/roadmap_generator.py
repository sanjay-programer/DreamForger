import google.generativeai as genai
from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
import re
from dotenv import load_dotenv
load_dotenv()

router=APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# 🎯 Function to generate professional roadmap as JSON
def generate_roadmap(dream,location):
    prompt = f"""
    You are a highly professional career roadmap AI assistant.

    A user from {location} dreams of becoming a {dream}.

    Your task:
    - Generate a professional step-by-step career roadmap.
    - Include specific realistic phases, like joining academies, playing in local tournaments, applying to exams, etc. — as per actual industry standards for that dream.
    - If opportunities are unavailable in {location}, recommend the nearest city or suggest moving to a city with better opportunities , do mention any famous brands or places where they can join to get their dream.
    - Break down the roadmap into clear phases, with phase names and details.

    ⚠️ Output format: Provide the result strictly in this JSON structure WITHOUT any markdown code block:

    {{
        "dream": "{dream}",
        "location": "{location}",
        "phases": [
            {{
                "phase 1": "Title",
                "description": "Detailed description of this step."
            }},
            ...
        ]
    }}

    Do NOT wrap the output inside code blocks like ```json.
    Only return pure JSON text.
    """

    response = model.generate_content(prompt)

    # Get raw text response
    raw_response = response.text.strip()

    # Clean any accidental markdown wrappers if present
    cleaned_response = re.sub(r"```json|```", "", raw_response).strip()

    # Convert to JSON
    try:
        roadmap_json = json.loads(cleaned_response)
        return roadmap_json
    except json.JSONDecodeError:
        return {"error": "Could not parse AI response to JSON. Cleaned response was:", "response": cleaned_response}


class RoadmapRequest(BaseModel):
    dream: str
    location: str

# 🚀 FastAPI endpoint
@router.post("/generate_roadmap")
def create_roadmap(request: RoadmapRequest):
    result = generate_roadmap(request.dream,request.location)
    return result
