from flask import Flask, jsonify, request, session
from flask_cors import CORS
from .database import get_db_connection, create_tables
import os
from dotenv import load_dotenv
from functools import wraps
from openai import OpenAI
import json
from werkzeug.security import generate_password_hash, check_password_hash

 
load_dotenv()

app = Flask(__name__)
app.secret_key=os.getenv("FLASK_SECRET_KEY")
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
CORS(app ,supports_credentials=True, 
     resources={ 
        r"/api/*":{
            "origins":[
                "http://localhost:5173",
                "https://pocket-pt-kappa.vercel.app",
                r"https://pocket-.*-sosenaas-projects\.vercel\.app",
            ]
        }
    }
)

@app.route("/api/health")
def health():
    return {"status": "ok"}, 200

create_tables()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route("/api/checkAuth", methods=["GET"])
@login_required
def checkAuth():
    return jsonify({"authenticated": True}), 200
    


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid data"}), 400 
    
    username = data.get("username","")
    name = data.get("name")
    lastName = data.get("lastName")
    email = data.get("email")
    password = data.get("password")
    confirmPassword = data.get("confirmPassword")

    required_fields = [username, name, lastName, email, password, confirmPassword]
    
    if any(field is None or field == "" for field in required_fields):
        return jsonify({"message": "User data missing"}),400
    

    if password != confirmPassword:
        return jsonify({"message": "Password does not match"}), 400
    
    username = username.lower().strip()
    passwordHash = generate_password_hash(password)
    
    con = get_db_connection()
    #check if user already exists?
    userExist = con.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if userExist :
        con.close()
        return jsonify({"message": "This User already exists"}), 400
        
    #Add new user to database
    con.execute("INSERT INTO users (username, name, lastname, email, password) VALUES(?, ?, ?, ?, ?)", (username, name, lastName, email, passwordHash))
    con.commit()
    con.close()

    return jsonify({"message": "Successful Registration"}), 201
    

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"Messsage": "Data missing"}), 400
    
    username = data.get("username")
    password = data.get("password")
    username = username.lower().strip()

    con = get_db_connection()
    
        
    user = con.execute("SELECT id, username, password FROM users WHERE username = ?",  (username,)).fetchone()
    con.close()

    #Check if the user exists ?
    if not user:
        return jsonify({"error": "User not found"}),400

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid username or password."}), 400

    #Create a flask session
    session["username"] = user["username"]
    session["id"] = user["id"]
    return jsonify({"message": "Successfully logged in."}), 200

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop(session.get("user_id"), None)
    session.clear()
    return({"message": "Successfully logged out"}),200
    


@app.route("/api/userDetails", methods=["POST"])
@login_required
def userDetails():
    data = request.get_json()
    user_id = session.get("id")

    if not data:
        return jsonify({"message": "Data missing"}), 400
    
    #Fetching data from the form
    age = data.get("age")
    weight = data.get("weight")
    height = data.get("height")
    gender = data.get("gender")
    goal = data.get("goal")
    trainingEnvironment = data.get("trainingEnvironment")
    activity = data.get("activity")
    

    required_fields = [age,weight,height, gender,goal, trainingEnvironment ,activity]

    #Ensure all fields are completed
    if any(field is None or field == "" for field in required_fields):
        return jsonify({"message": "All fields are required."}), 400
    
    #Writing form data into the database
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute('''INSERT INTO user_details 
                (age, weight, height, gender, goal, trainingEnvironment, activity, user_id) 
                VALUES(?,?,?,?,?,?,?,?)''',
                (age,weight,height,gender,goal, trainingEnvironment, activity, user_id))
    con.commit()
    con.close()

    #Triger plan generation after submiting the form
    trainingPlanGen(age, weight, height, gender, goal,trainingEnvironment, activity)
    dietPlanGen(age, weight, height, gender, goal,trainingEnvironment, activity)
    return jsonify({"message": "Data saved successfully."}),200


def trainingPlanGen(age, weight, height, gender, goal, trainingEnvironment, activity):
    client = OpenAI()
    print("Working on the training plan")
    
    #get chat gpt reponse
    response = client.responses.create(
    model="gpt-4o-mini",
    text={"format":{
        "type": "json_object"
    }},
    instructions="You are a qualified Personal trainer",
    input=f'''
    Create a professional, science-based gym training plan.
    Ensure the program is balanced across all major muscle groups, 
    while considering general training preferences often observed in males and females.
    
    Age: {age}
    Weight:{weight}
    Height: {height}
    Gender: {gender}
    Goal: {goal}
    Training_Environment: {trainingEnvironment}
    Activity: {activity}

    Return ONLY raw JSON. 
    Do not include markdown, 
    code blocks, 
    explanations, 
    comments, 
    or any text outside the JSON structure.

    {{
        "plan_name": "string",
        "workouts":[
        {{
            "day_name": "string",
            "focus": "string",
            "exercise_duration": "string",
            "exercises": [
                {{"name": "string", "sets": "string", "reps": "string"}},
                {{"name" : "string", "sets": "string", "reps": "string"}},
                {{"name" : "string", "sets": "string", "reps": "string"}}
            ]
        }},

        {{
            "day_name": "Monday",
            "focus": "Lower body",
            "exercise_duration": "75 Min",
            "exercises": [
                {{"name": "Squats", "sets": "4", "reps":"10"}},
                {{"name" : "Leg press", "sets": "5", "reps": "12"}},
                {{"name" : "Leg extension", "sets": "5", "reps": "12"}},
                {{"name" : "Jog", "sets": "1", "reps": "25 minutes"}}
            ]
        }}

        ]
    }}

    '''
    )

    try:
        plan = json.loads(response.output_text)
        print("Valid Json")
        print(type(plan))
        return updateTrainingPlan(plan)  
    
    except json.decoder.JSONDecodeError:
        print("Invalid Json")
        return jsonify({"error": "failed to generate JSON format"}), 500
    
def dietPlanGen(age, weight, height, gender, goal, trainingEnvironment, activity):
    client = OpenAI()
    print("Working on your diet plan")
    
    data = request.get_json()
    user_id = session.get("id")

    if not data:
        return jsonify({"message": "Data missing"}), 400
    
    #Fetching data from the form
    age = data.get("age")
    weight = data.get("weight")
    height = data.get("height")
    gender = data.get("gender")
    goal = data.get("goal")
    trainingEnvironment = data.get("trainingEnvironment")
    activity = data.get("activity")
    
    
    response = client.responses.create(
        model="gpt-4o-mini",
    text={
        "format":{
        "type": "json_object"
    }},
    instructions="You are a qualified nutritionist",
    input=f'''
    Create 7 day professional, science-based diet.
    Design diet to {goal}.
    Ensure amount, calories add up to the plan.
    Meal rotation
    Ensure total calories EXACTLY match macros using:
    (protein * 4) + (carbs * 4) + (fat * 9) = total calories.
    
    
    
    Age: {age}
    Weight:{weight}
    Height: {height}
    Gender: {gender}
    Goal: {goal}
    Training_Environment: {trainingEnvironment}
    Activity: {activity}

    Return ONLY raw JSON. 
    Do not include markdown, 
    code blocks, 
    explanations, 
    comments, 
    or any text outside the JSON structure.
    
    Example....
    {{
        "diet_name":"string",
        "diet": [
        {{
                "day_name": "Monday",
                "macros": 
                    {{"Protein": "200g", "Carbohydrates": "200g", "Fat": "65g", "Calories": "2180" }},
                "total_meals": "4 meals",
                "meals": [
                    {{
                        "meal":"string",
                        "ingredients": [
                            {{ "name": "Chicken", "amount": "250g" }},
                            {{ "name": "Brown Rice", "amount": "100g"}},
                            {{ "name": "Broccoli", "amount": "100g" }}
                        ]
                    }},
                    {{
                        "meal": "Beef Sweet Potato Bowl",
                        "ingredients": [
                            {{ "name": "Lean Beef", "amount": "200g"}},
                            {{ "name": "Sweet Potatoes", "amount": "200g" }},
                            {{"name": "Spinach", "amount": "100g" }}
                        ]             
                    }}
                ]
        }}   
        ]
    }}

    '''
    )
    try:
        diet = json.loads(response.output_text)
        return updateDietPlan(diet)
    
    except json.decoder.JSONDecodeError:
        print("Invalid JSON")
        return jsonify({"error": "Invalid JSON"})
    
def updateDietPlan(diet):
    if diet:
        #user_id = session.get("id")
        #con = get_db_connection()
        #cursor = con.cursor()
        #cursor.execute("INSERT INTO diets (user_id, diet_name), VALUES (?,?)", (user_id, diet["diet_name"]))

        #diet_id = cursor.lastrowid
        for d in diet["diet"]:
            print(d["day_name"]) 
            print(d["macros"])
            print(d["total_meals"])
            
            
            for meal in d["meals"]:
                print(meal["meal"])
                
                for ing in meal["ingredients"]:
                    print(ing["name"])
                    print(ing["amount"])    
        
        
        
def updateTrainingPlan(plan):
    if plan:
            user_id = session.get("id")
            con = get_db_connection()
            cursor = con.cursor()
            cursor.execute("INSERT INTO training_plans (user_id, plan_name) VALUES (?,?)", (user_id, plan["plan_name"]))

            plan_id = cursor.lastrowid

            for workout in plan["workouts"]:
                cursor.execute("INSERT INTO workouts (plan_id, day_name, focus, exercise_duration) VALUES (?,?,?,?)",
                                (plan_id, workout["day_name"], workout["focus"], workout["exercise_duration"]))
                    
                workout_id = cursor.lastrowid

                for exercise in workout["exercises"]:
                    cursor.execute("INSERT INTO exercises (workout_id, exercise_name, sets, reps) VALUES (?,?,?,?)",
                                (workout_id, exercise["name"], exercise["sets"], exercise["reps"]))

            con.commit()
            con.close()

            return jsonify({"message": "Training plan generated successfully"}), 200


    

@app.route("/api/regenerateWorkout", methods=["POST"])
@login_required
def regenerateWorkout():
    con = get_db_connection()
    cursor = con.cursor()
    user_id = session.get("id")
    
    user_details = cursor.execute("""
        SELECT 
            ud.age, 
            ud.weight, 
            ud.height, 
            ud.gender, 
            ud.goal, 
            ud.trainingEnvironment, 
            ud.activity
        FROM user_details ud
        WHERE user_id = ?""", (user_id,)).fetchone()
    con.close()
    
    age = user_details["age"]
    weight = user_details["weight"]
    height = user_details["height"]
    gender = user_details["gender"]
    goal = user_details["goal"]
    trainingEnvironment = user_details["trainingEnvironment"]
    activity = user_details["activity"]
  
    #Re-generate training plan. 
    print(age, weight, height, gender, goal, trainingEnvironment, activity)
    #Get latest plan
    trainingPlanGen(age, weight, height, gender, goal, trainingEnvironment, activity)
    
    return jsonify({"message": "success"}), 201


@app.route("/api/getTrainingPlan", methods=["GET"])
@login_required
def getTrainingPlan():
    user_id = session.get("id")

    con = get_db_connection()
    cursor = con.cursor()

    #Get plan
    plan = cursor.execute("SELECT * FROM training_plans WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,)).fetchone()

    if not plan:
        return jsonify({"message": "There are no plans"}), 404

    #get all workouts that belong to this plan
    workouts = cursor.execute("SELECT * FROM workouts WHERE plan_id = ? ",(plan["id"],)).fetchall()

    result = {
        "plan_name": plan["plan_name"],
        "workouts" : []
              }
    
    #Get all exercises for each workout.... Refactor SQL query..  remove *
    for workout in workouts:
        exercises = cursor.execute("SELECT * FROM exercises WHERE workout_id = ? ", (workout["id"],)).fetchall()
    
    #building a workout object
        workout_data = {
            "id": workout["id"],
            "day_name": workout["day_name"],
            "focus" : workout["focus"],
            "exercise_duration" : workout["exercise_duration"],
            "exercises":[]
        }

        for exercise in exercises:
            workout_data["exercises"].append({
                "exercise_id": exercise["id"],
                "name": exercise["exercise_name"],
                "sets" : exercise["sets"],
                "reps" : exercise["reps"],
            })

        result["workouts"].append(workout_data)

    con.close()

    return jsonify(result), 200


@app.route("/api/createLog", methods=["POST"])
@login_required
def createLog():
    data = request.get_json()
    if not data:
        return ({"message": "Data missing"}), 400
    print("this works")
    userId = session.get("id")
    exerciseId = data.get("exerciseId")
    newWeight = data.get("weight")
    newReps = data.get("reps")
    
    if userId is None or exerciseId is None or newWeight is None or newReps is None:
        print("missing data")
        return jsonify({"message": "Missing data"}), 400
    
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("INSERT INTO exercise_logs (exercise_id, user_id, weight, reps) VALUES (?,?,?,?)", (exerciseId, userId, newWeight, newReps))
    con.commit()
    con.close()
    return jsonify({"message": "Log added successfully "}), 201

@app.route("/api/getLatestLogs", methods=["GET"])
@login_required
def getLatestLogs():
    user_id = session.get("id")
    con = get_db_connection()
    cursor = con.cursor()
    
    rows = cursor.execute("""
        SELECT el.exercise_id, el.weight, el.reps, el.created_at
        FROM exercise_logs el
        INNER JOIN (
            SELECT exercise_id, MAX(id) as max_id
            FROM exercise_logs
            WHERE user_id = ?
            GROUP BY exercise_id
        ) latest
        ON el.id = latest.max_id
    """, (user_id,)).fetchall()

    con.close()  


    result = {}
    for row in rows:
        result[row["exercise_id"]] = {
            "weight": row["weight"],
            "reps": row["reps"],
            "created_at": row["created_at"]
        }

    return jsonify(result), 200


@app.route("/api/workoutComplete", methods=["POST"])
@login_required
def workoutComplete():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Missing data"}),400
    
    user_id = session.get("id")
    workout_id = data.get("workout_id")
    con = get_db_connection()
    cursor = con.cursor()
    
    already_exists = cursor.execute("""
        SELECT 1
        FROM completed_workouts
        WHERE workout_id = ? 
        AND user_id = ?
        AND date(create_at) = date('now') 
        LIMIT 1
        """, (workout_id, user_id)).fetchone()
    if already_exists:
        return({"message": "This workout is already completed."}), 409
    
    cursor.execute("""
    INSERT INTO completed_workouts (workout_id, user_id ) 
    VALUES (?,?)""", (workout_id, user_id))
    con.commit()
    con.close()
    
    return jsonify({"message": "Workout complete"}),201
    
    
@app.route("/api/getCompletedThisMonth", methods=["POST"])
@login_required
def getCompletedThisMonth():
    con = get_db_connection()
    cursor = con.cursor()
    user_id = session.get("id")
    
    completedWorkouts = cursor.execute("""
    SELECT create_at 
    FROM completed_workouts 
    WHERE user_id = ?
    AND strftime('%Y-%m', create_at) = strftime('%Y-%m', 'now')""", 
    (user_id,)).fetchall()
    
    workoutsNum = 0
    for cw in completedWorkouts:
        workoutsNum = workoutsNum + 1
            
    con.close()
    return jsonify({"result": workoutsNum}),200

@app.route("/api/getWeeklyVolume", methods=["GET"])
@login_required
def getWeeklyVolume():
    user_id = session.get("id")
    con = get_db_connection()
    cursor = con.cursor()

    
    #incase reps are stored as seconds - 30 seconds = 1. 
    result = cursor.execute("""
    SELECT SUM(
        CAST(sets AS INTEGER) * 
        
        CASE 
            WHEN reps LIKE '%seconds%' THEN 1
            ELSE CAST(reps AS INTEGER)
        END
    )
    
    FROM exercises
    WHERE workout_id IN (

        SELECT workout_id
        FROM completed_workouts
        WHERE user_id = ?
        AND strftime('%Y-%W', create_at) = strftime('%Y-%W', 'now')

    )
    """, (user_id,)).fetchone()

    weeklyVolume = result[0] or 0
    
    return jsonify({"result": weeklyVolume}), 200
    
    
if __name__ == "__main__":
    app.run(debug=True, port=5000)