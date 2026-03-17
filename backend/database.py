import sqlite3 

def get_db_connection():
     con = sqlite3.connect("users.db")
     con.row_factory = sqlite3.Row
     return con

def create_tables():
     con = get_db_connection()
     cursor = con.cursor()
     cursor.execute('''
     CREATE TABLE IF NOT EXISTS users(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    lastname TEXT NOT NULL,
                    email TEXT NOT NULL,
                    password TEXT NOT NULL
                    )
                    ''')
     cursor.execute('''
     CREATE TABLE IF NOT EXISTS user_details(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    age INTEGER NOT NULL,
                    weight INTEGER NOT NULL,
                    height INTEGER NOT NULL,
                    gender TEXT NOT NULL,
                    goal TEXT NOT NULL,
                    activity TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
''')
     
     #Training plans (Allow users to have multiple plans)
     cursor.execute('''
     CREATE TABLE IF NOT EXISTS training_plans(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    plan_name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )     
''')
     
     #Workouts (Each plan should contain workout day)
     cursor.execute('''
     CREATE TABLE IF NOT EXISTS workouts(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    plan_id INTEGER NOT NULL,
                    day_name TEXT NOT NULL, 
                    FOREIGN KEY (plan_id) REFERENCES training_plans (id) ON DELETE CASCADE
                    ) 
''')
     #Exercises (Exercises should belong to a workout)
     cursor.execute('''
     CREATE TABLE IF NOT EXISTS exercises(
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    workout_id INTEGER NOT NULL,
                    exercise_name TEXT NOT NULL,
                    sets TEXT NOT NULL,
                    reps TEXT NOT NULL,
                    FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
                    )
''')
     
     #Training plan 

     con.commit()
     con.close()

if __name__ == "__main__":
     create_tables()

