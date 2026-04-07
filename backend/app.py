from flask import Flask, jsonify, request, session
from flask_cors import CORS
from .database import get_db_connection, create_tables
import os
from dotenv import load_dotenv
from functools import wraps
from openai import OpenAI
import json

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

@app.route("/")
def home():
    return "Backend is alive"

create_tables()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"Message", "Invalid data"}), 400 
    
    username = data.get("username")
    name = data.get("name")
    lastName = data.get("lastName")
    email = data.get("email")
    password = data.get("password")
    confirmPassword = data.get("confirmPassword")

    if password != confirmPassword:
        return jsonify({"Message": "Incorrect password"}), 400
    
    con = get_db_connection()
    
    #check if user already exists?
    userExist = con.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if userExist :
        con.close()
        return jsonify({"message", "This User already exists"}), 400
        
    #Add new user to database
    con.execute("INSERT INTO users (username, name, lastname, email, password) VALUES(?, ?, ?, ?, ?)", (username, name, lastName, email, password))
    con.commit()
    con.close()

    return jsonify({"Message": "Successful Registration"}), 200
    

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"Messsage": "Data missing"}), 400
    
    username = data.get("username")
    password = data.get("password")

    con = get_db_connection()
    
    user = con.execute("SELECT id, username, password FROM users WHERE username = ?",  (username,)).fetchone()
    con.close()

    #Check if the user exists ?
    if not user:
        return jsonify({"error": "User not found"}),400

    if user["password"] != password:
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
    name = data.get("name")
    age = data.get("age")
    weight = data.get("weight")
    height = data.get("height")
    gender = data.get("gender")
    goal = data.get("goal")
    activity = data.get("activity")

    required_fields = [name,age,weight,height, gender,goal,activity]

    #Ensure all fields are completed
    if any(field is None or field == "" for field in required_fields):
        return jsonify({"message": "All fields are required."}), 400
    
    #Writing form data into the database
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute('''INSERT INTO user_details 
                (name, age, weight, height, gender, goal, activity, user_id) 
                VALUES(?,?,?,?,?,?,?,?)''',
                (name, age,weight,height,gender,goal,activity,user_id))
    con.commit()
    con.close()

    #Triger plan generation after submiting the form
    trainingPlanGen(age, weight, height, gender, goal, activity)
    return jsonify({"message": "Data saved successfully."}),200


def trainingPlanGen(age, weight, height, gender, goal, activity):
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
            "day_name": "Day 2",
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
        
    
    except json.decoder.JSONDecodeError:
        print("Invalid Json")
        return jsonify({"error": "failed to generate JSON format"}), 500



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
    
    #Get all exercises for each workout
    for workout in workouts:
        exercises = cursor.execute("SELECT * FROM exercises WHERE workout_id = ? ", (workout["id"],)).fetchall()
    
    #building aworkout object
        workout_data = {
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
    exerciseId = data.get("exerciseIndex")
    newWeight = data.get("weight")
    newReps = data.get("reps")
    
    if not userId or not exerciseId or not newWeight or not newReps:
        print("missing data")
        return jsonify({"message": "Missing data"}), 400
    
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("INSERT INTO exercise_logs (exercise_id, user_id, weight, reps) VALUES (?,?,?,?)", (exerciseId, userId, newWeight, newReps))
    con.commit()
    con.close()
    return jsonify({"message": "Log added successfully "}), 201
    


if __name__ == "__main__":
    app.run(debug=True, port=5000)