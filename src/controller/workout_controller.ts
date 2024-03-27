import { Request, Response } from "express";
import fs from "fs";
import Joi from "joi";
import { paginateResults } from "../utils/paginate";
import { shuffleArray } from "../utils/shuffle_array";

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

const filter_pagination_schema = Joi.object({
  page_size: Joi.number().integer().min(1).optional().default(10),
  page_number: Joi.number().integer().min(1).optional().default(1),
});

export type iWorkout = {
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

    const { value: params } = filter_pagination_schema.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { level, equipments, muscles } = value;

    try {
      // reading the data
      const data = fs.readFileSync(
        "public/exercises_data/exercises.json",
        "utf8"
      );

      const exercises: iExercises = JSON.parse(data);

      const workouts = exercises.workouts;

      // filtering
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

      // remove duplicates
      function removeDuplicates(array1: any[], array2: any[]) {
        // Compare lengths of the two arrays
        if (array1.length > array2.length) {
          // If array1 is longer, create a set from array2 and filter array1
          const set = new Set(array2);
          return array1.filter((item) => !set.has(item));
        } else {
          // If array2 is longer, create a set from array1 and filter array2
          const set = new Set(array1);
          return array2.filter((item) => !set.has(item));
        }
      }
      const recommendations = removeDuplicates(equipment_filter, muscle_filter);

      // pagination
      const shuffle_recommendations = shuffleArray(recommendations);

      const paginatedResults = paginateResults(shuffle_recommendations, params);

      return res.status(200).json(paginatedResults);
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
