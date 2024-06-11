import { Request, Response } from "express";
import Joi from "joi";
import prisma from "../lib/prisma";
import fs from "fs";

import { iExercises } from "../types/workout_types";
const Days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const assign_exercise_schema = Joi.object({
  day: Joi.string()
    .valid(...Days)
    .required(),
  workout_day_id: Joi.string().required(),
  reps: Joi.number().positive().min(1).required(),
  sets: Joi.number().positive().min(1).required(),
  detail_id: Joi.string().required(),
});
async function assign_exercise(req: Request, res: Response) {
  const { value, error } = assign_exercise_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const get_workout_schedule = await prisma.workoutDay.findFirst({
      where: {
        day: value.day,
        id: value.workout_day_id,
      },
      select: {
        id: true,
      },
    });

    if (!get_workout_schedule) {
      return res.status(404).json({ message: "Missing Schedule" });
    }

    const add_exercise = await prisma.exercise.create({
      data: {
        workout_day_id: get_workout_schedule.id,
        reps: value.reps,
        sets: value.sets,
        detail_id: value.detail_id,
      },
    });

    return res.status(201).json(add_exercise);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

const get_exercise_schema = Joi.object({
  workout_day_id: Joi.string().required(),
});
async function get_exercise(req: Request, res: Response) {
  const { value, error } = get_exercise_schema.validate(req.params);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const get_workout_day = await prisma.workoutDay.findFirst({
      where: {
        id: value.workout_day_id,
      },
      include: {
        exercises: true,
      },
    });
    if (!get_workout_day) {
      return res.status(404).json({ message: "Missing Exercise" });
    }
    const data = fs.readFileSync(
      "public/exercises_data/exercises.json",
      "utf8"
    );

    const exercisesList: iExercises = JSON.parse(data);

    const results: any = [];
    get_workout_day.exercises.forEach((exercise) => {
      const workout = exercisesList.workouts.find(
        (workout) =>
          workout.id.toLowerCase() === exercise.detail_id.toLowerCase()
      );

      if (workout) {
        const { detail_id, ...rest } = exercise;
        results.push({
          ...rest,
          details: workout,
        });
      }
    });
    const { exercises, ...rest } = get_workout_day;

    res.status(200).json({ ...rest, exercises: results });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

const remove_exercise_schema = Joi.object({
  id: Joi.string().required(),
});
async function remove_exercise(req: Request, res: Response) {
  const { value, error } = remove_exercise_schema.validate(req.params);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    await prisma.exercise.delete({
      where: {
        id: value.id,
      },
    });
    res.status(204).send("success");
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

const update_exercise_schema = Joi.object({
  exercise_id: Joi.string().required(),
  sets: Joi.number().optional(),
  reps: Joi.number().optional(),
}).or("sets", "reps");
async function update_exercise(req: Request, res: Response) {
  const { value, error } = update_exercise_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { exercise_id, ...detail } = value;
  try {
    const updated_exercise = await prisma.exercise.update({
      where: {
        id: value.exercise_id,
      },
      data: detail,
    });

    res.status(200).json(updated_exercise);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// create  workout plan
const create_workout_plan_schema = Joi.object({
  user_id: Joi.string().required(),
  name: Joi.string().required(),
});
async function create_workout_plan(req: Request, res: Response) {
  const { value, error } = create_workout_plan_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    await prisma.$transaction(async (prisma) => {
      // Create workout plan
      const create_workout_plan = await prisma.workoutPlan.create({
        data: {
          user_id: value.user_id,
          name: value.name,
        },
        select: {
          id: true,
          name: true,
          is_active: true,
        },
      });
      const workouts: any = [];
      // create workout weeks
      for (const day of Days) {
        const workout = await prisma.workoutDay.create({
          data: {
            day: day as any,
            workout_plan_id: create_workout_plan.id,
          },
          select: {
            id: true,
            day: true,
          },
        });

        workouts.push(workout);
      }

      return res.status(201).json({
        workout_plan: { ...create_workout_plan, workouts },
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// delete workoutplan
const delete_workout_plan_schema = Joi.object({
  id: Joi.string().required(),
});
async function delete_workout_plan(req: Request, res: Response) {
  const { value, error } = delete_workout_plan_schema.validate(req.params);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    await prisma.workoutPlan.delete({
      where: {
        id: value.id,
      },
    });

    res.status(204).send("success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// update workoutplan
const update_workout_plan_schema = Joi.object({
  workout_plan_id: Joi.string().required(),
  name: Joi.string().required(),
});
async function update_workout_plan(req: Request, res: Response) {
  const { value, error } = update_workout_plan_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    await prisma.workoutPlan.update({
      where: {
        id: value.workout_plan_id,
      },
      data: {
        name: value.name,
      },
    });

    res.status(200).send("success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// get workoutplan
const get_workout_plans_schema = Joi.object({
  id: Joi.string().required(),
});
const pagination_schema = Joi.object({
  page_size: Joi.number().integer().min(1).optional().default(10),
  page_number: Joi.number().integer().min(0).optional().default(0),
});

async function get_workout_plans(req: Request, res: Response) {
  // Validate params
  const { value: paramsValue, error: paramsError } =
    get_workout_plans_schema.validate(req.params);
  if (paramsError) {
    return res.status(400).json({ message: paramsError.details[0].message });
  }

  const { value: queryValue, error: queryError } = pagination_schema.validate(
    req.query
  );
  if (queryError) {
    return res.status(400).json({ message: queryError.details[0].message });
  }

  try {
    const workout_plan = await prisma.workoutPlan.findMany({
      take: queryValue.page_size,
      skip: queryValue.page_number * queryValue.page_size,
      where: {
        user_id: paramsValue.id,
      },
      select: {
        id: true,
        name: true,
        is_active: true,
        workouts: {
          select: {
            id: true,
            day: true,
          },
        },
      },
      orderBy: [
        {
          created_at: "desc",
        },
      ],
    });

    return res.status(200).json(workout_plan);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// activate workoutplan
const active_workout_plan_schema = Joi.object({
  new_wp_id: Joi.string().required(),
  old_wp_id: Joi.string(),
});
async function active_workout_plan(req: Request, res: Response) {
  const { value, error } = active_workout_plan_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    await prisma.$transaction(async (prisma) => {
      if (value?.old_wp_id) {
        await prisma.workoutPlan.update({
          where: {
            id: value.old_wp_id,
          },
          data: {
            is_active: false,
          },
        });
      }

      await prisma.workoutPlan.update({
        where: {
          id: value.new_wp_id,
        },
        data: {
          is_active: true,
        },
      });

      res.status(200).send("success");
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

export default {
  assign_exercise,
  get_exercise,
  remove_exercise,
  update_exercise,
  create_workout_plan,
  update_workout_plan,
  delete_workout_plan,
  get_workout_plans,
  active_workout_plan,
};
