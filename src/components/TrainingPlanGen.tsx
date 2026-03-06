import { useLocation } from "react-router-dom";
import OpenAI from "openai";
import { useEffect, useState } from "react";

const TrainingPlanGen = () => {
  const location = useLocation();
  const userData = location.state;
  const [output, setOutput] = useState("");

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

      setOutput(response.output_text);
    };
    handlePlan();
  }, []);

  return (
    <>
      <div>
        <h1>Hi {userData.name}</h1>
        <p>
          We are working on a training plan that is perfectly suited for you!
        </p>
        <p>{output}</p>
      </div>
    </>
  );
};

export default TrainingPlanGen;
