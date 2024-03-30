import { Request, Response } from "express";
import fs from "fs";
import Joi from "joi";
import {
  paginate_results,
  remove_duplicates,
  shuffle_array,
} from "../utils/array_utils";
import { iExercises } from "../types/workout_types";
import {
  filter_by_equipments,
  filter_by_level,
  filter_by_muscle,
  filter_by_search_key,
} from "../utils/filter_utils";

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

// reccomend_workout

const reccom_schema = Joi.object({
  level: Joi.string()
    .valid(...level_types)
    .required(),
  equipments: Joi.array()
    .items(Joi.string().valid(...equipment_types))
    .required(),
  muscles: Joi.array()
    .items(Joi.string().valid(...muscle_groups))
    .required(),
});

const pagination_schema = Joi.object({
  page_size: Joi.number().integer().min(1).optional().default(10),
  page_number: Joi.number().integer().min(1).optional().default(1),
});

async function reccomend_workout(req: Request, res: Response) {
  const { value, error } = reccom_schema.validate(req.body);

  const { value: params } = pagination_schema.validate(req.params);
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
    const level_filter = filter_by_level(workouts, level);
    const equipment_filter = filter_by_equipments(level_filter, equipments);
    const muscle_filter = filter_by_muscle(level_filter, muscles);

    const recommendations = remove_duplicates(
      equipment_filter,
      muscle_filter,
      "id"
    );

    const shuffle_recommendations = shuffle_array(recommendations);

    const paginated_results = paginate_results(shuffle_recommendations, params);

    return res.status(200).json(paginated_results);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong",
    });
  }
}

const search_schema = Joi.object({
  level: Joi.string().valid(...level_types),
  equipments: Joi.array().items(Joi.string().valid(...equipment_types)),
  muscles: Joi.array().items(Joi.string().valid(...muscle_groups)),
  search_key: Joi.string(),
}).min(1);

// search workout
async function search_workouts(req: Request, res: Response) {
  const { value, error } = search_schema.validate(req.body);

  const { value: params } = pagination_schema.validate(req.params);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { level, equipments, muscles, search_key } = value;

  try {
    // reading the data
    const data = fs.readFileSync(
      "public/exercises_data/exercises.json",
      "utf8"
    );
    const exercises: iExercises = JSON.parse(data);

    const workouts = exercises.workouts;

    const level_search = filter_by_level(workouts, level);

    const equipment_search = filter_by_equipments(level_search, equipments);

    const muscle_search = filter_by_muscle(level_search, muscles);

    const search_key_equipment = filter_by_search_key(
      equipment_search,
      search_key
    );

    const search_key_muscle = filter_by_search_key(muscle_search, search_key);

    const clean_results = remove_duplicates(
      search_key_equipment,
      search_key_muscle,
      "id"
    );

    const shuffle_results = shuffle_array(clean_results);

    const paginated_results = paginate_results(shuffle_results, params);

    return res.status(200).json(paginated_results);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong",
    });
  }
}

export default {
  reccomend_workout,
  search_workouts,
};
