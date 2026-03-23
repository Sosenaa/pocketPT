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
        return jsonify({"Message", "User already exists"}), 400
        
    
    con.execute("INSERT INTO users (username, name, lastname, email, password) VALUES(?, ?, ?, ?, ?)", (username, name, lastName, email, password))
    con.commit()
    print("Registration completes sucessfully ")
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

    if not user:
        return jsonify({"error": "User not found"}),400

    if user["password"] != password:
        return jsonify({"error": "Login or Password incorrect"}), 400

    session["username"] = user["username"]
    session["id"] = user["id"]
    return jsonify({"Message": "Successful Login"}), 200

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop(session.get("user_id"), None)
    session.clear()
    return({"message": "Logged out successfully"}),200
    


@app.route("/api/userDetails", methods=["POST"])
@login_required
def userDetails():
    data = request.get_json()
    user_id = session.get("id")

    if not data:
        return jsonify({"message": "Data missing"}), 400
    

    name = data.get("name")
    age = data.get("age")
    weight = data.get("weight")
    height = data.get("height")
    gender = data.get("gender")
    goal = data.get("goal")
    activity = data.get("activity")

    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute('''INSERT INTO user_details 
                (name, age, weight, height, gender, goal, activity, user_id) 
                VALUES(?,?,?,?,?,?,?,?)''',
                (name, age,weight,height,gender,goal,activity,user_id))
    con.commit()
    con.close()

    trainingPlanGen(age, weight, height, gender, goal, activity)
    return jsonify({"message": "Data saved sucessfully"})


def trainingPlanGen(age, weight, height, gender, goal, activity):
    client = OpenAI()
    print("Here will have training plan generated")
    
    #get chat gpt reponse

    response = client.responses.create(
    model="gpt-4o-mini",
    text={"format":{
        "type": "json_object"
    }},
    instructions="You are a qualified Personal trainer",
    input=f'''
    Create a profesional training plan for this user.

    Age: {age}
    Weight:{weight}
    Height: {height}
    Gender: {gender}
    Goal: {goal}
    Activity: {activity}

    Return only valid JSON.
    
    {{
        "plan_name": "Muscle gain",
        "workouts":[
        {{
            "day_name": "Day 1",
            "focus": "Upper Body",
            "exercise_duration": "75 Min",
            "exercises": [
                {{"name": "Bench press", "sets": "4", "reps": "10"}},
                {{"name" : "Shoulder press", "sets": "3", "reps": "12"}},
                {{"name" : "Pull ups", "sets": "4", "reps": "15"}},
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
                {{"name" : "Jog", "sets": "1", "reps": "25 minutes"}},
            ]
        }},

        ]
    }}

    '''
    )

    plan = json.loads(response.output_text)

    for workout in plan["workouts"]:
        print(f""" 
              Day: {workout["day_name"]}, 
              Focus: {workout["focus"]}, 
              Duration: {workout["exercise_duration"]} """)


        for exercise in workout["exercises"]:
            print(f"""  
                  Name: {exercise["name"]}, 
                  Sets: {exercise["sets"]}, 
                  Reps: {exercise["reps"]}
                  """)

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

        return jsonify({"Message": "Successful Login"}), 200




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

    #get all workout that belong to this plan
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
                "name": exercise["exercise_name"],
                "sets" : exercise["sets"],
                "reps" : exercise["reps"],
            })

        result["workouts"].append(workout_data)

    con.close()

    return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)