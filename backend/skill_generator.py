import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash")

def generate_skills_from_dream(dream: str) -> dict:
    prompt = f"""
    A person wants to become a {dream}.
    Generate a list of 6 to 10 very specific and practical skill powers required to become a master in this dream.

    Focus on real, observable skills — especially ones that can be practiced or proven in the real world.
    (For example: knife handling, portion measuring, temperature control, etc. if it's a chef.)

    For each skill, return:
    Skill Name: <short title of the skill>
    Description: <What this skill is, why it's useful. 1-2 lines.>
    Power: <A dramatic, magical-sounding ability unlocked after mastering it — 8 words max.>

    No bullets. No extra lines. No markdown. Use this format exactly:

    Skill Name: <...>
    Description: <...>
    Power: <...>
    (repeat)
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        lines = text.split("\n")
        skills = []
        i = 0

        while i < len(lines):
            if lines[i].startswith("Skill Name:"):
                name = lines[i].replace("Skill Name:", "").strip()
                description = lines[i + 1].replace("Description:", "").strip() if i + 1 < len(lines) else ""
                power = lines[i + 2].replace("Power:", "").strip() if i + 2 < len(lines) else ""

                skills.append({
                    "id": len(skills) + 1,
                    "name": name,
                    "description": description,
                    "power": power
                })

                i += 3
            else:
                i += 1

        return {"skills": skills}

    except Exception as e:
        return {
            "dream": dream,
            "skills": [{
                "id": 1,
                "name": "Error Summoner",
                "description": f"Could not generate skills for dream: {e}",
                "power": "Summon Stack Trace: Reveal the bug's true form 🐛"
            }]
        }

