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
#app.config["SESSION_COOKIE_SAMESITE"] = "None"
#app.config["SESSION_COOKIE_SECURE"] = True

#mobile testing
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

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
    lastname = data.get("lastname")
    email = data.get("email")
    password = data.get("password")
    confirmPassword = data.get("confirmPassword")

    required_fields = [username, name, lastname, email, password, confirmPassword]
    
    if any(field is None or field == "" for field in required_fields):
        print(required_fields)
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
    con.execute("INSERT INTO users (username, name, lastname, email, password) VALUES(?, ?, ?, ?, ?)", (username, name, lastname, email, passwordHash))
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
   
    return jsonify({"message": "Data saved successfully."}),200

@app.route("/api/generateFullPlan", methods=["POST"])
@login_required
def generatePlan():
    print("Workout on full plan")
    trainingPlanGen()
    dietPlanGen()
    return jsonify({"message": "Full plan has been created"}), 201


@app.route("/api/generateDietPlan", methods=["POST"])
@login_required
def generateDietPlan():
    print("Workout on diet plan")
    dietPlanGen()
    return jsonify({"message": "Diet plan has been created"}), 201    


@app.route("/api/generateTrainingPlan", methods=["POST"])
@login_required
def generateTrainingPlan():

    print("Workout on training plan")
    trainingPlanGen()
    return jsonify({"message": "Diet plan has been created"}), 201  

    

def getUserData():
    user_id = session.get("id")
    
    con = get_db_connection()
    user_details = con.execute("""
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
    
    user = { 
        "age": user_details["age"],
        "weight": user_details["weight"],
        "height": user_details["height"],
        "gender": user_details["gender"],
        "goal" :user_details["goal"],
        "trainingEnvironment" : user_details["trainingEnvironment"],
        "activity" : user_details["activity"]
    }
    return (user)
        
    

@app.route("/trainingPlanGen", methods=["POST"])
def trainingPlanGen():
    client = OpenAI()
    print("Working on the training plan")
    
    user_details = getUserData()
    
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
    
    Age: {user_details["age"]}
    Weight:{user_details["weight"]}
    Height: {user_details["height"]}
    Gender: {user_details["gender"]}
    Goal: {user_details["goal"]}
    Training_Environment: {user_details["trainingEnvironment"]}
    Activity: {user_details["activity"]}

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
    
def dietPlanGen():
    client = OpenAI()
    print("Working on your diet plan")

    user_details = getUserData()

    response = client.responses.create(
        model="gpt-4o-mini",
        text={
            "format": {
                "type": "json_object"
            }
        },
        instructions="You are a qualified nutritionist.",
        input=f'''
Create a 7 day professional, science-based diet plan.
Design the diet for this goal: {user_details["goal"]}.

User details:
Age: {user_details["age"]}
Weight: {user_details["weight"]}
Height: {user_details["height"]}
Gender: {user_details["gender"]}
Goal: {user_details["goal"]}
Training Environment: {user_details["trainingEnvironment"]}
Activity: {user_details["activity"]}

Rules:
- Return exactly 7 days.
- Each day should have 4 meals.
- Each meal must include calories, protein, carbs, and fats as numbers.
- Each meal must include realistic ingredients with amounts.
- Keep meals practical and simple.
- Return ONLY raw JSON.
- Do not include markdown, code blocks, explanations, comments, or text outside the JSON.

JSON format:
{{
  "diet_name": "string",
  "diet": [
    {{
      "day_name": "Monday",
      "total_meals": "4 meals",
      "meals": [
        {{
          "meal": "Chicken Rice Bowl",
          "calories": 650,
          "protein": 45,
          "carbs": 70,
          "fats": 18,
          "ingredients": [
            {{ "name": "Chicken breast", "amount": "200g" }},
            {{ "name": "Brown rice", "amount": "100g" }},
            {{ "name": "Broccoli", "amount": "100g" }}
          ]
        }},
        {{
          "meal": "Beef Sweet Potato Bowl",
          "calories": 700,
          "protein": 50,
          "carbs": 65,
          "fats": 22,
          "ingredients": [
            {{ "name": "Lean beef", "amount": "200g" }},
            {{ "name": "Sweet potato", "amount": "250g" }},
            {{ "name": "Spinach", "amount": "100g" }}
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
        return jsonify({"error": "Invalid JSON"}), 500
    
def updateDietPlan(diet):
    if diet:
        user_id = session.get("id")
        con = get_db_connection()
        cursor = con.cursor()

        cursor.execute("""
            INSERT INTO diets (user_id, diet_name)
            VALUES (?, ?)
        """, (
            user_id,
            diet["diet_name"],
        ))

        diet_id = cursor.lastrowid

        for day in diet["diet"]:
            cursor.execute("""
                INSERT INTO diet_days (diet_id, day_name, total_meals)
                VALUES (?, ?, ?)
            """, (
                diet_id,
                day["day_name"],
                day["total_meals"],
            ))

            diet_day_id = cursor.lastrowid

            for meal in day["meals"]:
                cursor.execute("""
                    INSERT INTO meal(
                        diet_day_id,
                        meal_name,
                        calories,
                        protein,
                        carbs,
                        fats
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    diet_day_id,
                    meal["meal"],
                    meal.get("calories", 0),
                    meal.get("protein", 0),
                    meal.get("carbs", 0),
                    meal.get("fats", 0),
                ))

                meal_id = cursor.lastrowid

                for ingredient in meal["ingredients"]:
                    cursor.execute("""
                        INSERT INTO ingredients (meal_id, name, amount)
                        VALUES (?, ?, ?)
                    """, (
                        meal_id,
                        ingredient["name"],
                        ingredient["amount"],
                    ))

        con.commit()
        con.close()

        return jsonify({"message": "Diet plan generated successfully"}), 200

    return jsonify({"message": "No diet plan generated"}), 400 
        
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


@app.route("/api/getDietPlan", methods=["GET"])
@login_required
def getDietPlan():
    user_id = session.get("id")
    con = get_db_connection()
    cursor = con.cursor()
    
    #Getting last diet from DB
    dietPlan = cursor.execute("SELECT  * FROM diets WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,)).fetchone()
    
    if not dietPlan:
        return jsonify({"message": "No plan has been created"}), 404

    result = {
        "diet_name": dietPlan["diet_name"],
        "diet_days": [], 
    }
    

    #getting all diet for all days from DB    
    diet_days = cursor.execute("SELECT * FROM diet_days WHERE diet_id = ? ", (dietPlan["id"],)).fetchall()
    
    for day in diet_days:
        diet_data = {
            "diet_day_id": day["id"],
            "diet_day" : day["day_name"],
            "total_meals": day["total_meals"],
            "meal":[]
        }
        
        #getting meals for each day of the week from DB
        meals = cursor.execute("SELECT * FROM meal WHERE diet_day_id = ? ", (day["id"],)).fetchall()   
        for meal in meals:
            meal_data = {
                "meal_id": meal["id"],
                "meal_name": meal["meal_name"],
                "calories": meal["calories"],
                "protein": meal["protein"],
                "carbs": meal["carbs"],
                "fats": meal["fats"],
                "ingredients": []
            }
            #getting ingredients for each meal
            ingredients = cursor.execute("SELECT * FROM ingredients WHERE meal_id = ?", (meal["id"],)).fetchall()
            for ing in ingredients:
                meal_data["ingredients"].append({
                    "name": ing["name"],
                    "amount": ing["amount"],
                })
            diet_data["meal"].append(meal_data)
        
        result["diet_days"].append(diet_data)

    con.close()
    
    return jsonify(result),200

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
    
@app.route("/api/substituteExercise", methods=["POST"])
@login_required
def substituteExercise():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Missing data"}), 400

    exercise_id = data.get("exercise_id")
    workout_id = data.get("workout_id")

    if not exercise_id or not workout_id:
        return jsonify({"message": "Missing exercise_id or workout_id"}), 400

    user_id = session.get("id")
    con = get_db_connection()
    cursor = con.cursor()

    target_exercise = cursor.execute(
        """
        SELECT id, exercise_name, sets, reps
        FROM exercises
        WHERE id = ?
        """,
        (exercise_id,),
    ).fetchone()

    workout = cursor.execute(
        """
        SELECT id, plan_id, day_name, focus, exercise_duration
        FROM workouts
        WHERE id = ?
        """,
        (workout_id,),
    ).fetchone()

    if not target_exercise or not workout:
        con.close()
        return jsonify({"message": "Exercise or workout not found"}), 404

    current_workout_exercises = cursor.execute(
        """
        SELECT exercise_name, sets, reps
        FROM exercises
        WHERE workout_id = ?
        """,
        (workout_id,),
    ).fetchall()

    full_plan_workouts = cursor.execute(
        """
        SELECT w.day_name, w.focus, e.exercise_name, e.sets, e.reps
        FROM workouts w
        JOIN training_plans tp ON w.plan_id = tp.id
        JOIN exercises e ON e.workout_id = w.id
        WHERE tp.user_id = ?
        AND tp.id = ?
        ORDER BY w.id, e.id
        """,
        (user_id, workout["plan_id"]),
    ).fetchall()

    current_exercise_names = [
        exercise["exercise_name"] for exercise in current_workout_exercises
    ]

    full_plan_context = [
        {
            "day_name": row["day_name"],
            "focus": row["focus"],
            "exercise_name": row["exercise_name"],
            "sets": row["sets"],
            "reps": row["reps"],
        }
        for row in full_plan_workouts
    ]

    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        text={
            "format": {
                "type": "json_object"
            }
        },
        instructions="You are a qualified personal trainer. Replace one exercise while keeping the full training plan balanced.",
        input=f"""
        Replace this exercise with ONE suitable alternative.

        Target exercise:
        Name: {target_exercise["exercise_name"]}
        Sets: {target_exercise["sets"]}
        Reps: {target_exercise["reps"]}

        Current workout:
        Day: {workout["day_name"]}
        Focus: {workout["focus"]}
        Duration: {workout["exercise_duration"]}

        Exercises already in this workout:
        {current_exercise_names}

        Full weekly plan context:
        {full_plan_context}

        Rules:
        - Return only one replacement exercise.
        - Do not return the same exercise.
        - Do not duplicate any exercise already in the current workout.
        - Keep the replacement appropriate for the workout focus.
        - Keep the movement pattern similar where possible.
        - Keep sets and reps suitable.
        - Make sure the full weekly plan still makes sense.
        - Return ONLY raw JSON.

        JSON format:
        {{
          "name": "string",
          "sets": "string",
          "reps": "string",
          "reason": "string"
        }}
        """
    )

    try:
        replacement = json.loads(response.output_text)
    except json.decoder.JSONDecodeError:
        con.close()
        return jsonify({"message": "Failed to create replacement"}), 500

    replacement_name = replacement.get("name")
    replacement_sets = replacement.get("sets")
    replacement_reps = replacement.get("reps")
    reason = replacement.get("reason", "")

    if not replacement_name or not replacement_sets or not replacement_reps:
        con.close()
        return jsonify({"message": "Invalid replacement returned"}), 500

    if replacement_name.lower() in [name.lower() for name in current_exercise_names]:
        con.close()
        return jsonify({"message": "Replacement already exists in this workout"}), 409

    cursor.execute(
        """
        UPDATE exercises
        SET exercise_name = ?, sets = ?, reps = ?
        WHERE id = ?
        """,
        (replacement_name, replacement_sets, replacement_reps, exercise_id),
    )

    con.commit()
    con.close()

    return jsonify({
        "exercise_id": exercise_id,
        "name": replacement_name,
        "sets": replacement_sets,
        "reps": replacement_reps,
        "reason": reason,
    }), 200
    
@app.route("/api/substituteMeal", methods=["POST"])
@login_required
def substituteMeal():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Missing data"}), 400

    meal_id = data.get("meal_id")

    if not meal_id:
        return jsonify({"message": "Missing meal_id"}), 400

    user_id = session.get("id")
    con = get_db_connection()
    cursor = con.cursor()

    target_meal = cursor.execute("""
        SELECT 
            m.id,
            m.meal_name,
            dd.id AS diet_day_id,
            dd.day_name,
            dd.total_meals,
            d.id AS diet_id,
            d.diet_name
        FROM meal m
        JOIN diet_days dd ON m.diet_day_id = dd.id
        JOIN diets d ON dd.diet_id = d.id
        WHERE m.id = ?
        AND d.user_id = ?
    """, (meal_id, user_id)).fetchone()

    if not target_meal:
        con.close()
        return jsonify({"message": "Meal not found"}), 404

    target_ingredients = cursor.execute("""
        SELECT name, amount
        FROM ingredients
        WHERE meal_id = ?
    """, (meal_id,)).fetchall()

    day_meals = cursor.execute("""
        SELECT meal_name
        FROM meal
        WHERE diet_day_id = ?
    """, (target_meal["diet_day_id"],)).fetchall()

    day_meal_names = [meal["meal_name"] for meal in day_meals]

    current_ingredients = [
        {
            "name": ingredient["name"],
            "amount": ingredient["amount"],
        }
        for ingredient in target_ingredients
    ]

    client = OpenAI()

    response = client.responses.create(
        model="gpt-4o-mini",
        text={
            "format": {
                "type": "json_object"
            }
        },
        instructions="You are a qualified nutritionist. Replace one meal while keeping the daily diet balanced.",
        input=f"""
        Replace this meal with ONE suitable alternative.

        Diet name:
        {target_meal["diet_name"]}

        Day:
        {target_meal["day_name"]}

        Meal to replace:
        {target_meal["meal_name"]}

        Current ingredients:
        {current_ingredients}

        Meals already in this day:
        {day_meal_names}

        Rules:
        - Return only one replacement meal.
        - Do not return the same meal.
        - Do not duplicate any meal already in this day.
        - Keep it suitable for the diet goal.
        - Keep ingredients realistic and simple.
        - Return ONLY raw JSON.

        JSON format:
        {{
            "meal_name": "string",
            "ingredients": [
                {{"name": "string", "amount": "string"}},
                {{"name": "string", "amount": "string"}},
                {{"name": "string", "amount": "string"}}
            ],
            "reason": "string"
        }}
        """
    )

    try:
        replacement = json.loads(response.output_text)
    except json.decoder.JSONDecodeError:
        con.close()
        return jsonify({"message": "Failed to create replacement meal"}), 500

    replacement_name = replacement.get("meal_name")
    replacement_ingredients = replacement.get("ingredients", [])
    reason = replacement.get("reason", "")

    if not replacement_name or not replacement_ingredients:
        con.close()
        return jsonify({"message": "Invalid replacement meal"}), 500

    if replacement_name.lower() in [name.lower() for name in day_meal_names]:
        con.close()
        return jsonify({"message": "Replacement already exists in this day"}), 409

    cursor.execute("""
        UPDATE meal
        SET meal_name = ?
        WHERE id = ?
    """, (replacement_name, meal_id))

    cursor.execute("""
        DELETE FROM ingredients
        WHERE meal_id = ?
    """, (meal_id,))

    for ingredient in replacement_ingredients:
        cursor.execute("""
            INSERT INTO ingredients (meal_id, name, amount)
            VALUES (?, ?, ?)
        """, (
            meal_id,
            ingredient.get("name"),
            ingredient.get("amount"),
        ))

    con.commit()
    con.close()

    return jsonify({
        "meal_id": meal_id,
        "meal_name": replacement_name,
        "ingredients": replacement_ingredients,
        "reason": reason,
    }), 200
    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)