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


def generate_roadmap_from_skill(skill: str) -> dict:
    """
    Generate a structured skill roadmap for a given skill.

    Returns:
        A dictionary with levels, each containing:
        - title
        - objective
        - tasks (list)
        - proof_idea
    """
    prompt = f"""
You are a skill roadmap planner for the learning platform "Trapped in Screens".

Generate a roadmap to master the skill: "{skill}".
Break the roadmap into the following levels:

1. Foundation
2. Core Skills
3. Applied Practice
4. Advanced Mastery
5. Real-World Projects

For each level, return this structured JSON:
- title: (name of the level)
- objective: (what the learner should achieve)
- tasks: (a bullet list of 3-5 steps the learner must do)
- proof_idea: (a creative way for the learner to prove completion – like a video, screenshot, file, or story)

IMPORTANT:
- Respond ONLY in raw JSON, nothing else.
- Format MUST be valid for Python's json.loads()

Output format:
{{
  "levels": [
    {{
      "title": "1. Foundation",
      "objective": "...",
      "tasks": ["...", "..."],
      "proof_idea": "..."
    }},
    ...
  ]
}}
"""

    try:
        # Get Gemini response
        response = model.generate_content(prompt)
        raw = response.text.strip()

        print("RAW RESPONSE:\n", raw)  # For debugging — remove later

        # Remove any triple-backtick markdown formatting if Gemini adds it
        cleaned = re.sub(r"^```(?:json)?", "", raw)
        cleaned = re.sub(r"```$", "", cleaned).strip()

        # Parse the cleaned JSON
        roadmap = json.loads(cleaned)
        return roadmap

    except Exception as e:
        print("ERROR OCCURRED:", e)
        return {"error": str(e)}

