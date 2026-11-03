import json 
from database import get_db_connection

def save_weekly_plan(user_id, plan):
    plan_json = json.dumps(plan, allow_nan=False)
    con = get_db_connection()
    try:
        with con:
            cursor = con.execute(
                "INSERT INTO weekly_diet_plans (user_id, plan_json) VALUES (?, ?)",
                (user_id, plan_json),
            )
        return cursor.lastrowid
    finally:
        con.close()


def get_latest_weekly_plan(user_id):
    con = get_db_connection()
    try:
        row = con.execute(
            """SELECT id, plan_json, created_at FROM weekly_diet_plans
               WHERE user_id = ? ORDER BY id DESC LIMIT 1""",
            (user_id,),
        ).fetchone()
    finally:
        con.close()
    if row is None:
        return None
    return {
        "id": row["id"], "created_at": row["created_at"],
        "plan": json.loads(row["plan_json"]),
    }

def save_daily_plan(user_id, plan):
    plan_json = json.dumps(plan, allow_nan=False) #dumps - converts calculated plan to python dictionary into text for sqlite
    con = get_db_connection()


    try:
        with con:
            cursor = con.execute(
                """
                INSERT INTO daily_diet_plans (user_id, plan_json)
                VALUES (?, ?)
                """,
                (user_id, plan_json),
            )
            plan_id = cursor.lastrowid

        return plan_id

    finally:
        con.close()


def get_latest_daily_plan(user_id):
    con = get_db_connection()

    try:
        row = con.execute(
            """
            SELECT id, plan_json, created_at
            FROM daily_diet_plans
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (user_id,),
        ).fetchone()

    finally:
        con.close()

    if row is None:
        return None

    return {
        "id": row["id"],
        "created_at": row["created_at"],
        "plan": json.loads(row["plan_json"]),
    }
