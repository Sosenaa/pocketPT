from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection, create_tables


app = Flask(__name__)
CORS(app)

create_tables()

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
        return jsonify({"Message", "This user already exists"})
        
    
    con.execute("INSERT INTO users (username, name, lastname, email, password) VALUES(?, ?, ?, ?, ?)", (username, name, lastName, email, password))
    con.commit()
    print("Registration completes sucessfully ")
    con.close()

    return jsonify({"Message": "Success"}), 200
    

if __name__ == "__main__":
    app.run(debug=True, port=5000)