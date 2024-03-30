import { Request, Response } from "express";
import Joi from "joi";
import prisma from "../lib/prisma";
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
  workout_id: Joi.string().required(),
  reps: Joi.number().positive().min(1).required(),
  sets: Joi.number().positive().min(1).required(),
  details_id: Joi.string().required(),
});

async function assign_exercise(req: Request, res: Response) {
  const { value, error } = assign_exercise_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const get_workout_schedule = await prisma.workout.findFirst({
      where: {
        day: value.day,
        id: value.workout_id,
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
        workout_id: get_workout_schedule.id,
        reps: value.reps,
        set: value.sets,
        details: value.details_id,
      },
    });

    return res.status(201).json(add_exercise);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

async function remove_exercise(req: Request, res: Response) {
  try {
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

export default { assign_exercise };
