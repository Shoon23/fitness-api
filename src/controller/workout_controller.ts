import { Request, Response } from "express";
import fs from "fs";
import Joi from "joi";

const level_types = ["beginner", "intermediate", "expert"];

const muscle_groups = [
  "quadriceps",
  "shoulders",
  "abdominals",
  "chest",
  "hamstrings",
  "triceps",
  "biceps",
  "lats",
  "middle back",
  "calves",
  "lower back",
  "forearms",
  "glutes",
  "traps",
  "adductors",
  "abductors",
  "neck",
];

const equipment_types = [
  "barbell",
  "dumbbell",
  "calisthenics",
  "cable",
  "machine",
  "kettlebells",
  "bands",
  "medicine ball",
  "exercise ball",
  "foam roll",
  "e-z curl bar",
];

const filter_schema = Joi.object({
  level: Joi.string().valid(...level_types),
  equipments: Joi.array().items(Joi.string().valid(...equipment_types)),
  muscles: Joi.array().items(Joi.string().valid(...muscle_groups)),
}).min(1);

type iWorkout = {
  name: string;
  force: string;
  level: string;
  mechanic: string;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  id: string;
};

interface iExercises {
  muscle_groups: Array<string>;
  equipment_types: Array<string>;
  workouts: Array<iWorkout>;
}

export default {
  async filter_workout(req: Request, res: Response) {
    const { value, error } = filter_schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { level, equipments, muscles } = value;

    try {
      const data = fs.readFileSync("exercises_data/exercises.json", "utf8");

      const exercises: iExercises = JSON.parse(data);

      const workouts = exercises.workouts;

      const level_filter = workouts.filter(
        (workout) => workout.level === level
      );

      const equipment_filter = level_filter.filter((workouts) => {
        if (!workouts.equipment) return false;

        return equipments.some((equipment: string) =>
          workouts.equipment.includes(equipment)
        );
      });
      const muscle_filter = level_filter.filter((workouts) => {
        return muscles.some((muscle: string) =>
          workouts.primaryMuscles.includes(muscle)
        );
      });

      const recommendations = equipment_filter.concat(muscle_filter);

      return res.status(200).json({
        workouts: recommendations,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Something Went Wrong",
      });
    }
  },
  async create_workout_plan(req: Request, res: Response) {
    try {
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Something Went Wrong",
      });
    }
  },
};
