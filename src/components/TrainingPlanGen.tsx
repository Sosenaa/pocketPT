import { useLocation } from "react-router-dom";
import OpenAI from "openai";
import { useEffect, useState } from "react";

type Exercise = {
  name: string;
  sets: number;
  reps: number[];
};

type TrainingPlan = {
  day: string;
  focus: string;
  training_duration: string;
  exercises: Exercise[];
};

type TrainingWeek = {
  days: TrainingPlan[];
};

const TrainingPlanGen = () => {
  const location = useLocation();
  const userData = location.state;
  const [plan, setPlan] = useState<TrainingWeek | null>(null);

  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  useEffect(() => {
    const handlePlan = async () => {
      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: `
      Generate training 7 day plan for client 
      name:${userData.name} 
      age:${userData.age} 
      goal:${userData.goal}
      weight:${userData.weight}
      height:${userData.height}
      gender:${userData.gender}
      activity:${userData.activity}

      Return ONLY valid JSON.
      Do not use markdown. Do not wrap in triple backticks.
      No explanations. No extra text.

      Return only valid JSON.
      No explanations.
      No extra text
      
      Forma Example: 
      {
        "days": [
        {  
            "day": "Day 1",
            "focus": "Upper body",
            "training_duration": "70 min",
            "exercises": [
              {
                "name": "Bench press",
                "sets": 4,
                "reps": [12,15,15,12]
              }
            ]
        }
        ]
      }`,
      });

      let parsedPlan: TrainingWeek;

      try {
        parsedPlan = JSON.parse(response.output_text) as TrainingWeek;
      } catch (err) {
        console.error("Invalid JSON:", response.output_text);
        return;
      }

      setPlan(parsedPlan);
    };
    handlePlan();
  }, []);

  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow p-4">
              <h1>Hi {userData.name}</h1>

              <div className="border-2">
                {plan &&
                  plan.days.map((d, index) => (
                    <div key={index}>
                      <table
                        className="w-100 table-bordered"
                        style={{ tableLayout: "fixed" }}
                      >
                        <thead className="">
                          <tr className="">
                            <th style={{ width: "10%" }}>{d.day}</th>
                            <th style={{ width: "40%" }}>Exercise</th>
                            <th style={{ width: "30%" }}>Reps</th>
                            <th style={{ width: "10%" }}>Sets</th>
                          </tr>
                        </thead>

                        <tbody>
                          {d.exercises.map((n, index) => (
                            <tr key={index} className="">
                              <td></td>
                              <td>{n.name}</td>
                              <td>{n.reps.join(" / ")}</td>
                              <td>{n.sets}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrainingPlanGen;
