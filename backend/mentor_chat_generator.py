import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env and get your Gemini API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Store chat objects instead of just history
user_conversations = {}

#This is mentor chat function helping to create mentor bot

def mentor_chat(user_id: int, dream: str, location: str, message: str):
    if user_id not in user_conversations:
        model = genai.GenerativeModel("gemini-1.5-flash")
        convo = model.start_chat()
        user_conversations[user_id] = convo
    else:
        convo = user_conversations[user_id]

    prompt = f"""
You're a friendly, casual AI mentor chatbot.

The student's dream is **{dream}**, they're based in **{location}**, and they just said: **'{message}'**

Your job is to reply naturally, like in a conversation.
👉 Keep your response short (3-4 lines max).
👉 Don't give all advice at once.
👉 Suggest one helpful thing based on their message, and ask a follow-up question to keep the chat going.
👉 Be supportive, positive, and engaging.

Example:
Mentor: Hey! That's awesome. Have you looked for a cricket ground nearby? Which part of Mysore are you in?

Now, give your reply.
"""

    response = convo.send_message(prompt)

    # Convert history into structured JSON list
    history_list = []
    for msg in convo.history:
        if msg.role in ["user", "model"]:
            text_content = msg.parts[0].text if msg.parts else ""
            history_list.append({
                "role": msg.role,
                "message": text_content.strip()
            })

    return {
        "reply": response.text.strip(),
        "chat_history": history_list
    }