from flask import Flask, jsonify, request, session
from flask_cors import CORS
from database import get_db_connection, create_tables


app = Flask(__name__)
CORS(app)

create_tables()

@app.route("/")
def index():
    if 'username' in session:
        return f'Logged in as {session["username"]}'
    return 'You are not logged in'

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
        return jsonify({"Message", "This user already exists"}), 400
        
    
    con.execute("INSERT INTO users (username, name, lastname, email, password) VALUES(?, ?, ?, ?, ?)", (username, name, lastName, email, password))
    con.commit()
    print("Registration completes sucessfully ")
    con.close()

    return jsonify({"Message": "Success"}), 200
    

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"Messsage": "data missing"}), 400
    
    username = data.get("username")
    password = data.get("password")

    con = get_db_connection()
    user = con.execute("SELECT id, username, password FROM users WHERE username = ?",  (username,)).fetchone()
    con.close()

    if not user:
        return jsonify({"error": "User not found"}),400

    if user["password"] != password:
        return jsonify({"error": "Login or Password incorrect"}), 400

    return jsonify({"Message": "Welcome Back"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)