"""Offline integration checks. All writes use a temporary database."""
import math
import sqlite3
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from catalog_loader import (
    generate_catalogue_week, load_catalogue, validate_portion, validate_targets,
)
from nutrition_targets import calculate_nutrition_targets

TARGETS = {"energy_kcal": 2000, "protein_g": 130, "fat_g": 70, "carbohydrates_g": 210}


class WeeklyCatalogueTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        workspace = Path(__file__).resolve().parent
        cls.directory = tempfile.TemporaryDirectory(dir=workspace, prefix=".diet-tests-")
        assert Path(cls.directory.name).resolve().parent == workspace
        import database
        cls.connection_patch = patch.object(database, "get_db_connection", side_effect=cls.connection)
        cls.connection_patch.start()
        import app as app_module
        cls.module = app_module
        cls.app = app_module.app
        cls.app.config.update(TESTING=True, SECRET_KEY="offline-test-only")
        cls.app.logger.disabled = True

    @classmethod
    def tearDownClass(cls):
        cls.app.logger.disabled = False
        cls.connection_patch.stop()
        cls.directory.cleanup()

    @classmethod
    def connection(cls):
        connection = sqlite3.connect(Path(cls.directory.name) / "test.db")
        connection.row_factory = sqlite3.Row
        return connection

    def signed_in_client(self, user_id):
        client = self.app.test_client()
        with client.session_transaction() as session:
            session["id"] = user_id
        return client

    def test_save_reload_and_user_isolation(self):
        client = self.signed_in_client(1)
        self.assertEqual(client.get("/api/weeklyDietPlan").status_code, 404)
        response = client.post("/api/weeklyDietPlan", json={"targets": TARGETS})
        self.assertEqual(response.status_code, 201)
        saved = response.get_json()
        reloaded = client.get("/api/weeklyDietPlan").get_json()
        self.assertEqual(reloaded["id"], saved["id"])
        self.assertEqual(reloaded["plan"], saved["plan"])
        self.assertEqual(self.signed_in_client(2).get("/api/weeklyDietPlan").status_code, 404)

    def test_authentication(self):
        client = self.app.test_client()
        self.assertEqual(client.get("/api/weeklyDietPlan").status_code, 401)
        self.assertEqual(client.post("/api/weeklyDietPlan", json={"targets": TARGETS}).status_code, 401)

    def test_bad_targets_do_not_create_plan(self):
        client = self.signed_in_client(3)
        self.assertEqual(client.post("/api/weeklyDietPlan").status_code, 422)
        invalid = [None, {}, {**TARGETS, "fat_g": 0}, {**TARGETS, "protein_g": True},
                   {**TARGETS, "energy_kcal": float("nan")}, {**TARGETS, "fat_g": "70"}]
        for targets in invalid:
            with self.subTest(targets=targets):
                with self.assertRaises(ValueError):
                    validate_targets(targets)
                self.assertEqual(client.post("/api/weeklyDietPlan", json={"targets": targets}).status_code, 422)
        self.assertEqual(client.get("/api/weeklyDietPlan").status_code, 404)

    def test_day_totals_bounds_and_shopping_weights(self):
        week = generate_catalogue_week(TARGETS)
        self.assertEqual(len(week["days"]), 7)
        self.assertEqual(len({d["day_name"] for d in week["days"]}), 7)
        self.assertEqual(week["status"], "draft")
        _, templates = load_catalogue()
        templates = {meal["catalogue_id"]: meal for meal in templates}
        shopping = {}
        for day in week["days"]:
            self.assertEqual(len(day["meals"]), 3)
            for meal in day["meals"]:
                limits = {i["food_key"]: i for i in templates[meal["catalogue_id"]]["ingredients"]}
                for ingredient in meal["ingredients"]:
                    key = ingredient["food_key"]
                    grams = ingredient["portion"]["portion_grams"]
                    validate_portion(limits[key], grams)
                    shopping[key] = shopping.get(key, 0) + grams
                for nutrient in TARGETS:
                    self.assertAlmostEqual(meal["totals"][nutrient], math.fsum(i["portion"][nutrient] for i in meal["ingredients"]))
            for nutrient in TARGETS:
                self.assertAlmostEqual(day["totals"][nutrient], math.fsum(m["totals"][nutrient] for m in day["meals"]))
        for nutrient in TARGETS:
            self.assertAlmostEqual(week["totals"][nutrient], math.fsum(d["totals"][nutrient] for d in week["days"]))
        self.assertEqual(shopping, {i["food_key"]: i["grams"] for i in week["shopping_list"]})
        self.assertTrue(week["days"][0]["within_target_tolerance"])
        week["days"][0]["meals"][0]["ingredients"][0]["portion"]["portion_grams"] = -1
        self.assertGreater(week["days"][1]["meals"][0]["ingredients"][0]["portion"]["portion_grams"], 0)

    def test_impossible_targets_are_not_claimed_as_met(self):
        week = generate_catalogue_week({key: 10000 for key in TARGETS})
        self.assertFalse(week["days"][0]["within_target_tolerance"])

    def test_existing_generation_routes_and_combined_flow(self):
        client = self.signed_in_client(4)
        for endpoint in ("/api/dailyDietPlan", "/api/generateDietPlan"):
            result = client.post(endpoint, json={"targets": TARGETS})
            self.assertEqual(result.status_code, 201)
            self.assertEqual(len(result.get_json()["plan"]["days"]), 7)
        with patch.object(self.module, "trainingPlanGen", return_value=({"ok": True}, 201)) as training:
            result = client.post("/api/generateFullPlan", json={"targets": TARGETS})
            self.assertEqual(result.status_code, 201)
            training.assert_called_once()
        with patch.object(self.module, "trainingPlanGen") as training:
            result = client.post("/api/generateFullPlan", json={"targets": {**TARGETS, "fat_g": 0}})
            self.assertEqual(result.status_code, 422)
            training.assert_not_called()

    def test_equation_goal_and_activity_effects(self):
        profile = {"age": "30", "weight": "80", "height": "180", "gender": "male",
                   "activity": "low_activity", "goal": "maintain_weight"}
        maintenance = calculate_nutrition_targets(profile)
        self.assertEqual(maintenance["resting_kcal"], 1780)
        self.assertEqual(maintenance["targets"]["energy_kcal"], 2136)
        loss = calculate_nutrition_targets({**profile, "goal": "lose_weight"})
        gain = calculate_nutrition_targets({**profile, "goal": "gain_muscle"})
        self.assertEqual(loss["targets"]["energy_kcal"], 1816)
        self.assertEqual(gain["targets"]["energy_kcal"], 2350)
        female = calculate_nutrition_targets({**profile, "gender": "female"})
        self.assertEqual(female["resting_kcal"], 1614)
        active = calculate_nutrition_targets({**profile, "activity": "high_activity"})
        self.assertGreater(active["targets"]["energy_kcal"], maintenance["targets"]["energy_kcal"])
        for result in (maintenance, loss, gain, female, active):
            macros = result["targets"]
            self.assertAlmostEqual(macros["protein_g"] * 4 + macros["fat_g"] * 9 + macros["carbohydrates_g"] * 4,
                                   macros["energy_kcal"], delta=1)

    def test_invalid_body_details(self):
        profile = {"age": 30, "weight": 80, "height": 180, "gender": "male",
                   "activity": "low_activity", "goal": "maintain_weight"}
        invalid = [None, {}, {**profile, "age": 16}, {**profile, "weight": True},
                   {**profile, "height": float("inf")}, {**profile, "weight": "bad"},
                   {**profile, "gender": ""}, {**profile, "activity": "unknown"},
                   {**profile, "goal": "unknown"},
                   {**profile, "goal": "lose_weight", "weight": 45, "height": 180}]
        for details in invalid:
            with self.subTest(details=details):
                with self.assertRaises(ValueError):
                    calculate_nutrition_targets(details)

    def test_automatic_targets_use_latest_saved_profile(self):
        con = self.connection()
        try:
            with con:
                for weight in (90, 80):
                    con.execute("""INSERT INTO user_details
                        (user_id, age, weight, height, gender, goal, trainingEnvironment, activity)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                        (5, 30, weight, 180, "male", "lose_weight", "full_gym", "low_activity"))
        finally:
            con.close()
        client = self.signed_in_client(5)
        preview = client.get("/api/nutritionTargets")
        self.assertEqual(preview.status_code, 200)
        estimate = preview.get_json()
        self.assertEqual(estimate["profile"]["weight"], 80)
        self.assertEqual(estimate["targets"]["energy_kcal"], 1816)
        result = client.post("/api/weeklyDietPlan", json={"target_mode": "automatic"})
        self.assertEqual(result.status_code, 201)
        saved = client.get("/api/weeklyDietPlan").get_json()["plan"]
        self.assertEqual(saved["targets"], estimate["targets"])
        self.assertEqual(saved["target_calculation"], estimate)
        manual = client.post("/api/weeklyDietPlan", json={"target_mode": "manual", "targets": TARGETS})
        self.assertEqual(manual.get_json()["plan"]["targets"], TARGETS)
        self.assertEqual(manual.get_json()["plan"]["target_calculation"]["mode"], "manual")
        with patch.object(self.module, "trainingPlanGen", return_value=({"ok": True}, 201)) as training:
            combined = client.post("/api/generateFullPlan", json={"target_mode": "automatic"})
            self.assertEqual(combined.status_code, 201)
            self.assertEqual(combined.get_json()["plan"]["targets"], estimate["targets"])
            training.assert_called_once()

    def test_missing_profile_is_actionable_and_not_another_users(self):
        client = self.signed_in_client(6)
        response = client.get("/api/nutritionTargets")
        self.assertEqual(response.status_code, 422)
        self.assertIn("personal details", response.get_json()["error"])
        self.assertEqual(client.post("/api/weeklyDietPlan", json={"target_mode": "automatic"}).status_code, 422)
        self.assertEqual(client.get("/api/weeklyDietPlan").status_code, 404)
        self.assertEqual(self.app.test_client().get("/api/nutritionTargets").status_code, 401)


if __name__ == "__main__":
    unittest.main()
