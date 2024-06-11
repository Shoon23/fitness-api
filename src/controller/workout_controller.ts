import { Request, Response } from "express";
import fs from "fs";
import Joi from "joi";
import {
  paginate_results,
  remove_duplicates,
  shuffle_array,
} from "../utils/array_utils";
import { iExercises, iWorkout } from "../types/workout_types";
import {
  filter_by_equipments,
  filter_by_level,
  filter_by_muscle,
  filter_by_search_key,
} from "../utils/filter_utils";

export const level_types = ["beginner", "intermediate", "expert"];

export const muscle_groups = [
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

export const equipment_types = [
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

const pagination_schema = Joi.object({
  page_size: Joi.number().integer().min(1).optional().default(10),
  page_number: Joi.number().integer().min(1).optional().default(1),
  is_shuffle: Joi.boolean().optional().default(true),
});

// reccomend_workout

const reccom_schema = Joi.object({
  levels: Joi.array()
    .items(Joi.string().valid(...level_types))
    .required(),
  equipments: Joi.array()
    .items(Joi.string().valid(...equipment_types))
    .required(),
  muscles: Joi.array()
    .items(Joi.string().valid(...muscle_groups))
    .required(),
});

async function reccomend_workout(req: Request, res: Response) {
  const { value, error } = reccom_schema.validate(req.body);

  const { value: query_string } = pagination_schema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { levels, equipments, muscles } = value;

  try {
    // reading the data
    const data = fs.readFileSync(
      "public/exercises_data/exercises.json",
      "utf8"
    );

    const exercises: iExercises = JSON.parse(data);

    const workouts = exercises.workouts;

    // filtering
    const level_filter = filter_by_level(workouts, levels);
    const muscle_filter = filter_by_muscle(level_filter, muscles);

    const equipment_filter = filter_by_equipments(muscle_filter, equipments);

    let shuffle_recommendations: iWorkout[] = [];
    if (query_string?.is_shuffle) {
      shuffle_recommendations = shuffle_array(equipment_filter);
    }
    const paginated_results = paginate_results(
      query_string?.is_shuffle ? shuffle_recommendations : equipment_filter,
      query_string
    );

    return res.status(200).json(paginated_results);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Something Went Wrong",
    });
  }
}

const search_schema = Joi.object({
  levels: Joi.array().items(Joi.string().valid(...level_types)),
  equipments: Joi.array().items(Joi.string().valid(...equipment_types)),
  muscles: Joi.array().items(Joi.string().valid(...muscle_groups)),
  search_key: Joi.string().allow(""),
});

// search workout
async function search_workouts(req: Request, res: Response) {
  const { value, error } = search_schema.validate(req.body);

  const { value: query_string } = pagination_schema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { equipments, muscles, search_key } = value;

  try {
    // reading the data
    const data = fs.readFileSync(
      "public/exercises_data/exercises.json",
      "utf8"
    );

    const exercises: iExercises = JSON.parse(data);

    const workouts = exercises.workouts;

    if (
      (!equipments || equipments.length === 0) &&
      (!muscles || muscles.length === 0) &&
      !search_key
    ) {
      const paginated_results = paginate_results(workouts, query_string);

      return res.status(200).json(paginated_results);
    }

    // filter based on the equipments if its
    let equipment_search: iWorkout[] = [];
    if (equipments && equipments.length > 0) {
      equipment_search = filter_by_equipments(workouts, equipments);
    }

    // filter based on the muscles if its

    let muscle_search: iWorkout[] = [];
    if (muscles && muscles.length > 0) {
      muscle_search = filter_by_muscle(workouts, muscles);
    }

    let search_key_equipment: any = [];
    let search_key_muscle: any = [];
    let search_key_result: any = [];
    if (search_key) {
      // filter based on equipment and search key
      if (equipment_search.length > 0) {
        search_key_equipment = filter_by_search_key(
          equipment_search,
          search_key
        );
      }
      // filter based on muscles and search key

      if (muscle_search.length > 0) {
        search_key_muscle = filter_by_search_key(muscle_search, search_key);
      }
      // search key only

      if (equipment_search.length <= 0 && muscle_search.length <= 0) {
        search_key_result = filter_by_search_key(workouts, search_key);
      }
    }
    let clean_results: iWorkout[] = [];

    // both muscle and equipment or  search key and muscle ,and equipment and search key
    if (
      (search_key_equipment.length > 0 && search_key_muscle.length > 0) ||
      (equipment_search.length > 0 && muscle_search.length > 0)
    ) {
      const to_clean_equipment =
        search_key_equipment.length > 0
          ? search_key_equipment
          : equipment_search;
      const to_clean_muscle =
        search_key_muscle > 0 ? search_key_muscle : muscle_search;

      clean_results = remove_duplicates(
        to_clean_equipment,
        to_clean_muscle,
        "id"
      );
    }

    let final_filter: iWorkout[] = [];

    // all filter options applied or only both equipmet and muscle
    if (clean_results.length > 0) {
      final_filter = clean_results;
    }
    // equipment filter only
    else if (
      equipment_search.length > 0 &&
      muscle_search.length <= 0 &&
      !search_key
    ) {
      final_filter = equipment_search;
    }
    // muscle filter only
    else if (
      muscle_search.length > 0 &&
      equipment_search.length <= 0 &&
      !search_key
    ) {
      final_filter = muscle_search;
    }
    // search key only
    else if (
      search_key &&
      equipment_search.length <= 0 &&
      muscle_search.length <= 0
    ) {
      final_filter = search_key_result;
    }
    // muscle and search key
    else if (
      muscle_search.length > 0 &&
      search_key &&
      equipment_search.length <= 0
    ) {
      final_filter = search_key_muscle;
    }
    // equipment and search key
    else if (
      equipment_search.length > 0 &&
      search_key &&
      muscle_search.length <= 0
    ) {
      final_filter = search_key_equipment;
    }

    const paginated_results = paginate_results(final_filter, query_string);

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
