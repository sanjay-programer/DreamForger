import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv
load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def generate_mastery_roadmap(skill: str):
    prompt = f"""
    You are a learning strategist AI helping users master real-world skills.

    For the skill "{skill}", generate a complete skill-building roadmap with 4 to 6 stages.

    Each stage should be focused on helping the user practically develop the skill. 
    The roadmap should be structured so that by the end of the final stage, the user becomes highly skilled or near mastery.

    Output format (strict JSON, no markdown): 
    {{
      "{skill}": [
        {{
          "stage": "Stage Name",
          "description": "What the user will focus on and improve in this stage.should not be more than 2 sentence strictly"
        }},
        ...
      ]
    }}
    """

    response = model.generate_content(prompt)
    content = response.text.strip()

    # Strip any ```json or ``` wrapping if present
    content = re.sub(r"^```json\s*", "", content)
    content = re.sub(r"\s*```$", "", content)

    try:
        return json.loads(content)
    except Exception as e:
        return {"error": "Failed to parse Gemini output", "raw": content}

