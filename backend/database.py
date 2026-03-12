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
                    )'''
                    )
     
     con.commit()
     con.close()

if __name__ == "__main__":
     create_tables()

