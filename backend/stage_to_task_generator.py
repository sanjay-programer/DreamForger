import json
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env and get your Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use Gemini Flash model
model = genai.GenerativeModel("gemini-2.0-flash")

import json
import re

def generate_stage_tasks(skill_name: str, stage: str, description: str) -> dict:
    prompt = f"""
    Skill: {skill_name}
    Stage: {stage}
    Description: {description}

    Generate 3 to 6 real-world tasks for this stage. Each task must have:
    - task: title of the action
    - description: 1-2 lines of what to do
    - proof: what to submit to prove it

    Return as clean JSON array only. No markdown. No explanation. Strictly:
    [ {{ "task": "...", "description": "...", "proof": "..." }}, ... ]
    """

    try:
        response = model.generate_content(prompt)
        tasks_raw = response.text.strip()

        # Remove markdown formatting (```json ... ```)
        tasks_clean = re.sub(r"```(?:json)?|```", "", tasks_raw).strip()

        # Parse JSON from the cleaned string
        tasks = json.loads(tasks_clean)

        return {
            "tasks": tasks
        }

    except Exception as e:
        return {
            "error": f"Error generating tasks: {e}",
            "raw_response": response.text if 'response' in locals() else None
        }
