from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from skill_generator import generate_skills_from_dream
from fastapi.middleware.cors import CORSMiddleware
from mentor_chat_generator import mentor_chat
import psycopg2
from Database import get_connection
from skill_stage_generator import generate_mastery_roadmap
from stage_to_task_generator import generate_stage_tasks
import json
from datetime import datetime
from roadmap_generator import router as roadmap_router

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roadmap_router)

#Registering | signing up

#Registering auth pa
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

#for Registering email and password
@app.post("/register")
def register_user(user: RegisterRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO auth (email, password)
        VALUES (%s, %s)
        RETURNING user_id;
        """

        cursor.execute(insert_query, (user.email, user.password))
        user_id = cursor.fetchone()[0]
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "user_id": user_id, "message": "User registered successfully!"}

    except psycopg2.errors.UniqueViolation:
        raise HTTPException(status_code=400, detail="Email already registered.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {e}")

#Siging in
class SignInRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/signin")
def sign_in_user(user: SignInRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        select_query = """
        SELECT user_id, password FROM auth WHERE email = %s;
        """
        cursor.execute(select_query, (user.email,))
        result = cursor.fetchone()

        cursor.close()
        conn.close()

        if result is None:
            return {
                "success": False,
                "message": "Email not found. Please register first."
            }

        user_id, db_password = result

        if user.password != db_password:
            return {
                "success": False,
                "message": "Incorrect password."
            }

        return {
            "success": True,
            "user_id": user_id,
            "message": "Login successful!"
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"An error occurred: {str(e)}"
        }


#Basic info schema
class UserBasicInfoRequest(BaseModel):
    user_id: int
    name: str
    age: int
    education: str
    location: str

#Posting Basic information
@app.post("/user/basic-info")
def insert_basic_info(user: UserBasicInfoRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO "user" (user_id, name, age, education, location)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            name = EXCLUDED.name, 
            age = EXCLUDED.age, 
            education = EXCLUDED.education,
            location = EXCLUDED.location;
        """
        cursor.execute(insert_query, (user.user_id, user.name, user.age, user.education, user.location))
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "message": "Basic user info inserted/updated successfully!"}
    except Exception as e:
        return {"success": False, "message": f"Failed to insert basic info: {e}"}


#Insertin dreams into user table
class UserDreamRequest(BaseModel):
    user_id: int
    dream: str

@app.post("/user/dream")
def insert_user_dream(user: UserDreamRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        update_query = """
        UPDATE "user" 
        SET dream = %s 
        WHERE user_id = %s;
        """
        cursor.execute(update_query, (user.dream, user.user_id))
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "message": "User dream inserted/updated successfully!"}
    except Exception as e:
        return {"success": False, "message": f"Failed to insert dream: {e}"}


#Adding the personality
class PersonalityRequest(BaseModel):
    user_id: int
    social_energy: int
    approach: int
    decission_making: int
    work_style: int

@app.post("/user/personality")
def insert_personality(personality: PersonalityRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO personality (user_id, social_energy, approach, decission_making, work_style)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (user_id)
        DO UPDATE SET 
            social_energy = EXCLUDED.social_energy,
            approach = EXCLUDED.approach,
            decission_making = EXCLUDED.decission_making,
            work_style = EXCLUDED.work_style;
        """

        cursor.execute(insert_query, (
            personality.user_id,
            personality.social_energy,
            personality.approach,
            personality.decission_making,
            personality.work_style
        ))
        conn.commit()

        cursor.close()
        conn.close()

        return {"success": True, "message": "Personality data inserted/updated successfully!"}
    except Exception as e:
        return {"success": False, "message": f"Failed to insert personality data: {e}"}


#Fetching values from user table
class UserIdRequest(BaseModel):
    user_id: int

@app.post("/user/details")
def get_user_details(request: UserIdRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        select_query = """
        SELECT name, age, education, dream, location
        FROM "user"
        WHERE user_id = %s;
        """
        cursor.execute(select_query, (request.user_id,))
        user_data = cursor.fetchone()

        cursor.close()
        conn.close()

        if user_data is None:
            return {"success": False, "message": "User not found!"}

        return {
            "success": True,
            "data": {
                "name": user_data[0],
                "age": user_data[1],
                "education": user_data[2],
                "dream": user_data[3],
                "location": user_data[4]
            }
        }
    except Exception as e:
        return {"success": False, "message": f"Failed to fetch user details: {e}"}

#Genearting skill for your dream
class DreamInput(BaseModel):
    dream: str

@app.post("/generate-skills")
async def get_skills(dream_input: DreamInput):
    dream = dream_input.dream
    if not dream:
        raise HTTPException(status_code=400, detail="Dream cannot be empty.")

    skills = generate_skills_from_dream(dream)
    return {"response": skills}

#Generating roadmap for your  skill
class SkillInput(BaseModel):
    skill: str

#Mentor Bot
class MentorRequest(BaseModel):
    user_id: int
    dream: str
    location: str
    message: str

class ChatHistoryItem(BaseModel):
    role: str
    message: str

class MentorResponse(BaseModel):
    reply: str
    chat_history: list[ChatHistoryItem]


@app.post("/mentor", response_model=MentorResponse)
async def handle_mentor_chat(req: MentorRequest):
    try:
        result = mentor_chat(req.user_id, req.dream, req.location, req.message)
        return MentorResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#Generating the roadmap for your skill(stage,description .. generation )
class SkillInput(BaseModel):
    skill: str

@app.post("/generate-skill-mastery-roadmap")
def generate_roadmap(data: SkillInput):
    result = generate_mastery_roadmap(data.skill)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result

#Generating Task for roadmap
class StageInput(BaseModel):
    skill: str
    stage: str
    description: str

@app.post("/generate-tasks")
async def get_tasks(stage_input: StageInput):
    tasks_response = generate_stage_tasks(
        stage_input.skill,
        stage_input.stage,
        stage_input.description
    )
    return {"response": tasks_response}

#Activating a skill
class ActivatedSkillInput(BaseModel):
    user_id: int
    skill_name: str
    status: str  # "ongoing" or "completed"

class SkillInput(BaseModel):
    user_id: int
    skill_name: str
    status: str

#1. Add or append a skill
@app.post("/activate_skill")
def add_or_append_skill(data: SkillInput):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT activated_skills FROM user_progress WHERE user_id = %s", (data.user_id,))
        result = cur.fetchone()

        if result and result[0]:
            activated_skills = result[0] if isinstance(result[0], dict) else json.loads(result[0])
            activated_skills[data.skill_name] = data.status
        else:
            activated_skills = {data.skill_name: data.status}

        cur.execute("""
            INSERT INTO user_progress (user_id, activated_skills, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET activated_skills = %s, updated_at = NOW();
        """, (data.user_id, json.dumps(activated_skills), json.dumps(activated_skills)))

        conn.commit()
        return {"message": f"Skill '{data.skill_name}' updated for user {data.user_id}.", "skills": activated_skills}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error inserting/updating data: {str(e)}")

    finally:
        cur.close()
        conn.close()

#updating a value in activated skill
class StatusUpdateInput(BaseModel):
    user_id: int
    skill_name: str
    new_status: str

@app.post("/update_skill_status")
def update_skill_status_api(data: StatusUpdateInput):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT activated_skills FROM user_progress WHERE user_id = %s", (data.user_id,))
        result = cur.fetchone()

        if not result or result[0] is None:
            raise HTTPException(status_code=404, detail=f"No activated skills found for user {data.user_id}.")

        activated_skills = result[0] if isinstance(result[0], dict) else json.loads(result[0])

        if data.skill_name not in activated_skills:
            raise HTTPException(status_code=404, detail=f"Skill '{data.skill_name}' not found for user {data.user_id}.")

        activated_skills[data.skill_name] = data.new_status

        cur.execute("""
            UPDATE user_progress
            SET activated_skills = %s, updated_at = NOW()
            WHERE user_id = %s
        """, (json.dumps(activated_skills), data.user_id))

        conn.commit()
        return {"message": f"Skill '{data.skill_name}' updated to '{data.new_status}' for user {data.user_id}."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")

    finally:
        cur.close()
        conn.close()

#getting all the activated skills.
class UserIDRequest(BaseModel):
    user_id: int

@app.post("/get_user_progress")
def get_user_progress(data: UserIDRequest):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM user_progress WHERE user_id = %s", (data.user_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail=f"No user_progress data found for user_id {data.user_id}")

        colnames = [desc[0] for desc in cur.description]
        record = {}

        for col, val in zip(colnames, row):
            if isinstance(val, str):
                try:
                    val = json.loads(val)
                except:
                    pass
            if isinstance(val, datetime):
                val = val.isoformat()
            record[col] = val

        return {"message": f"Progress data found for user_id {data.user_id}.", "data": record}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")

    finally:
        cur.close()
        conn.close()

# Endpoint to Insert or Append a Skill Roadmap (developing_skills)

class StageItem(BaseModel):
    stage: str
    description: str
    progress: str

class RoadmapInput(BaseModel):
    user_id: int
    skill_name: str
    roadmap: List[StageItem]

@app.post("/adding_skill_roadmap")
def add_developing_skill(data: RoadmapInput):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT developing_skills FROM user_progress WHERE user_id = %s", (data.user_id,))
        result = cur.fetchone()

        if result and result[0]:
            developing_skills = result[0] if isinstance(result[0], dict) else json.loads(result[0])
            developing_skills[data.skill_name] = [item.dict() for item in data.roadmap]
        else:
            developing_skills = {data.skill_name: [item.dict() for item in data.roadmap]}

        cur.execute("""
            INSERT INTO user_progress (user_id, developing_skills, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET developing_skills = %s, updated_at = NOW();
        """, (data.user_id, json.dumps(developing_skills), json.dumps(developing_skills)))

        conn.commit()
        return {"message": f"Roadmap for '{data.skill_name}' updated for user {data.user_id}."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()

# Endpoint to Update a Specific Stage's Progress in a Skill

class ProgressUpdateInput(BaseModel):
    user_id: int
    skill_name: str
    stage_name: str
    new_progress: str

@app.post("/update_stage_progress")
def update_stage_progress(data: ProgressUpdateInput):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT developing_skills FROM user_progress WHERE user_id = %s", (data.user_id,))
        result = cur.fetchone()

        if not result or not result[0]:
            raise HTTPException(status_code=404, detail="No developing_skills found for this user.")

        developing_skills = result[0] if isinstance(result[0], dict) else json.loads(result[0])

        if data.skill_name not in developing_skills:
            raise HTTPException(status_code=404, detail="Skill not found in developing_skills.")

        updated = False
        for stage in developing_skills[data.skill_name]:
            if stage["stage"] == data.stage_name:
                stage["progress"] = data.new_progress
                updated = True
                break

        if not updated:
            raise HTTPException(status_code=404, detail="Stage not found under specified skill.")

        cur.execute("""
            UPDATE user_progress
            SET developing_skills = %s, updated_at = NOW()
            WHERE user_id = %s
        """, (json.dumps(developing_skills), data.user_id))

        conn.commit()
        return {"message": f"Progress updated for stage '{data.stage_name}' in skill '{data.skill_name}'."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()

#Endpoint to Add/Append Ongoing Tasks

class TaskItem(BaseModel):
    task: str
    description: str
    proof: str
    status: str

class OngoingTaskInput(BaseModel):
    user_id: int
    skill_name: str
    stage_name: str
    tasks: List[TaskItem]

@app.post("/add_ongoing_tasks")
def add_ongoing_tasks(data: OngoingTaskInput):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT ongoing_tasks FROM user_progress WHERE user_id = %s", (data.user_id,))
        result = cur.fetchone()

        # Fetch or initialize
        if result and result[0]:
            ongoing_tasks = result[0] if isinstance(result[0], dict) else json.loads(result[0])
        else:
            ongoing_tasks = {}

        # Insert logic
        if data.skill_name not in ongoing_tasks:
            ongoing_tasks[data.skill_name] = {}

        if data.stage_name not in ongoing_tasks[data.skill_name]:
            ongoing_tasks[data.skill_name][data.stage_name] = []

        # Append new tasks (avoiding duplicates if necessary)
        existing_task_names = {t['task'] for t in ongoing_tasks[data.skill_name][data.stage_name]}
        for task in data.tasks:
            if task.task not in existing_task_names:
                ongoing_tasks[data.skill_name][data.stage_name].append(task.dict())

        # Save back to DB
        cur.execute("""
            INSERT INTO user_progress (user_id, ongoing_tasks, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET ongoing_tasks = %s, updated_at = NOW();
        """, (data.user_id, json.dumps(ongoing_tasks), json.dumps(ongoing_tasks)))

        conn.commit()
        return {"message": "Tasks added/updated successfully!"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    finally:
        cur.close()
        conn.close()

#updating ongoing task status

class UpdateTaskStatusInput(BaseModel):
    user_id: int
    skill_name: str
    stage_name: str
    task_name: str
    new_status: str  # Only updating this!

@app.post("/update_ongoing_task_status")
def update_task_status(data: UpdateTaskStatusInput):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT ongoing_tasks FROM user_progress WHERE user_id = %s", (data.user_id,))
        result = cur.fetchone()

        if not result or not result[0]:
            raise HTTPException(status_code=404, detail="No ongoing tasks found.")

        ongoing_tasks = result[0] if isinstance(result[0], dict) else json.loads(result[0])

        try:
            task_list = ongoing_tasks[data.skill_name][data.stage_name]
        except KeyError:
            raise HTTPException(status_code=404, detail="Skill or stage not found.")

        task_found = False
        for task in task_list:
            if task["task"] == data.task_name:
                task["status"] = data.new_status
                task_found = True
                break

        if not task_found:
            raise HTTPException(status_code=404, detail="Task not found.")

        cur.execute("""
            UPDATE user_progress
            SET ongoing_tasks = %s, updated_at = NOW()
            WHERE user_id = %s
        """, (json.dumps(ongoing_tasks), data.user_id))

        conn.commit()
        return {"message": "Task status updated successfully."}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f" {str(e)}")

    finally:
        cur.close()
        conn.close()

#function to register user for xp account

class UserRegister(BaseModel):
    user_id: int

@app.post("/register_user_xp")
def register_user(data: UserRegister):
    conn = get_connection()
    cur = conn.cursor()

    # Check if user already exists
    cur.execute("SELECT user_id FROM user_xp WHERE user_id = %s", (data.user_id,))
    result = cur.fetchone()

    if result:
        cur.close()
        conn.close()
        return {"message": "User already registered."}

    # Insert new user with default XP
    cur.execute("INSERT INTO user_xp (user_id) VALUES (%s)", (data.user_id,))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "User registered successfully with 100 XP."}


class XPUpdate(BaseModel):
    user_id: int
    increment: int

@app.post("/increment_xp")
def increment_xp(data: XPUpdate):
    conn = get_connection()
    cur = conn.cursor()

    # Check if user exists
    cur.execute("SELECT xp_gained FROM user_xp WHERE user_id = %s", (data.user_id,))
    result = cur.fetchone()

    if result:
        new_xp = result[0] + data.increment
        cur.execute("UPDATE user_xp SET xp_gained = %s WHERE user_id = %s", (new_xp, data.user_id))
    else:
        # If not exists, insert with initial XP + increment
        cur.execute("INSERT INTO user_xp (user_id, xp_gained) VALUES (%s, %s)", (data.user_id, 100 + data.increment))

    conn.commit()
    cur.close()
    conn.close()
    return {"message": "XP updated successfully."}


class XPFetch(BaseModel):
    user_id: int

@app.post("/get_xp")
def get_xp(data: XPFetch):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT xp_gained FROM user_xp WHERE user_id = %s", (data.user_id,))
    result = cur.fetchone()

    cur.close()
    conn.close()

    if result:
        return {"user_id": data.user_id, "xp_gained": result[0]}
    else:
        raise HTTPException(status_code=404, detail="User not found.")

#To increment the quest completed

class QuestUpdate(BaseModel):
    user_id: int
    increment: int

@app.post("/increment_quests")
def increment_quests(data: QuestUpdate):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT quest_completed FROM user_xp WHERE user_id = %s", (data.user_id,))
    result = cur.fetchone()

    if result:
        new_quests = result[0] + data.increment
        cur.execute("UPDATE user_xp SET quest_completed = %s WHERE user_id = %s", (new_quests, data.user_id))
    else:
        raise HTTPException(status_code=404, detail="User not found.")

    conn.commit()
    cur.close()
    conn.close()

    return {"message": f"Updated quests for user {data.user_id}. New total: {new_quests}"}

#To fetch the quest fetched

class QuestFetch(BaseModel):
    user_id: int

@app.post("/get_quests")
def get_quests(data: QuestFetch):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT quest_completed FROM user_xp WHERE user_id = %s", (data.user_id,))
    result = cur.fetchone()

    cur.close()
    conn.close()

    if result:
        return {"user_id": data.user_id, "quest_completed": result[0]}
    else:
        raise HTTPException(status_code=404, detail="User not found.")

#Buddies Page

class DreamSearch(BaseModel):
    dream: str

class NameSearch(BaseModel):
    name: str

@app.get("/buddies")
def get_all_buddies():
    conn = get_connection()
    cur = conn.cursor()
    query = """
        SELECT u.user_id, u.name, u.age, u.dream, u.location, 
               up.activated_skills
        FROM "user" u
        LEFT JOIN user_progress up ON u.user_id = up.user_id
        LIMIT 20;
    """
    cur.execute(query)
    results = cur.fetchall()
    cur.close()

    if not results:
        raise HTTPException(status_code=404, detail="No users found.")

    buddies = []
    for row in results:
        buddies.append({
            "user_id": row[0],
            "name": row[1],
            "age": row[2],
            "dream": row[3],
            "location": row[4],
            "activated_skills": row[5]
        })

    return {"buddies": buddies}

@app.post("/buddies/by-dream")
def get_buddies_by_dream(data: DreamSearch):
    conn=get_connection()
    cur = conn.cursor()
    query = """
        SELECT u.user_id, u.name, u.age, u.dream, u.location, 
               up.activated_skills
        FROM "user" u
        LEFT JOIN user_progress up ON u.user_id = up.user_id
        WHERE LOWER(u.dream) = LOWER(%s)
        LIMIT 20;
    """
    cur.execute(query, (data.dream,))
    results = cur.fetchall()
    cur.close()

    if not results:
        raise HTTPException(status_code=404, detail="No users found with this dream.")

    buddies = []
    for row in results:
        buddies.append({
            "user_id": row[0],
            "name": row[1],
            "age": row[2],
            "dream": row[3],
            "location": row[4],
            "activated_skills": row[5]
        })

    return {"buddies": buddies}

@app.post("/buddies/by-name")
def get_buddy_by_name(data: NameSearch):
    conn=get_connection()
    cur = conn.cursor()
    query = """
        SELECT u.user_id, u.name, u.age, u.dream, u.location, 
               up.activated_skills
        FROM "user" u
        LEFT JOIN user_progress up ON u.user_id = up.user_id
        WHERE LOWER(u.name) = LOWER(%s)
        LIMIT 20;
    """
    cur.execute(query, (data.name,))
    results = cur.fetchall()
    cur.close()

    if not results:
        raise HTTPException(status_code=404, detail="No user found with this name.")

    buddies = []
    for row in results:
        buddies.append({
            "user_id": row[0],
            "name": row[1],
            "age": row[2],
            "dream": row[3],
            "location": row[4],
            "activated_skills": row[5]
        })

    return {"buddies": buddies}

class DreamLocationSearch(BaseModel):
    dream: str
    location: str

@app.post("/buddies/by-dream-location")
def get_buddies_by_dream_and_location(data: DreamLocationSearch):
    conn = get_connection()
    cur = conn.cursor()
    query = """
        SELECT u.user_id, u.name, u.age, u.dream, u.location, 
               up.activated_skills
        FROM "user" u
        LEFT JOIN user_progress up ON u.user_id = up.user_id
        WHERE LOWER(u.dream) = LOWER(%s)
        AND LOWER(u.location) = LOWER(%s)
        LIMIT 20;
    """
    cur.execute(query, (data.dream, data.location))
    results = cur.fetchall()
    cur.close()

    if not results:
        raise HTTPException(status_code=404, detail="No users found for this dream and location.")

    buddies = []
    for row in results:
        buddies.append({
            "user_id": row[0],
            "name": row[1],
            "age": row[2],
            "dream": row[3],
            "location": row[4],
            "activated_skills": row[5]
        })

    return {"buddies": buddies}
