import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { generate_jwt } from "../utils/jwt_utils";
import Joi from "joi";

const Days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const login_schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]")).required(),
});

// login controller
async function login(req: Request, res: Response) {
  const { value, error } = login_schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = value;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
        first_name: true,
        last_name: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User Cannot Found",
      });
    }

    const isPasswrod = await bcrypt.compare(password, user.password);

    if (!isPasswrod) {
      return res.status(401).json({
        message: "Wrong Password",
      });
    }

    const workout_plan = await prisma.workoutPlan.findFirst({
      where: {
        user_id: user.id,
      },
      select: {
        id: true,
        workouts: {
          select: {
            id: true,
            day: true,
          },
        },
      },
    });
    const access_token = generate_jwt(user.id);
    const { password: hash_password, ...other } = user;

    res.status(200).json({
      ...other,
      access_token,
      workout_plan,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

// register controller
const register_schema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]")).required(),
});
async function register(req: Request, res: Response) {
  const { value, error } = register_schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { first_name, last_name, email, password } = value;
  const salt_rounds = 10;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(409).json({
        message: "User Already Exists",
      });
    }

    const hash_password = await bcrypt.hash(password, salt_rounds);

    await prisma.$transaction(async (prisma) => {
      // creating user
      const create_user = await prisma.user.create({
        data: {
          first_name,
          last_name,
          email,
          password: hash_password,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      });

      // Create workout plan
      const create_workout_plan = await prisma.workoutPlan.create({
        data: {
          user_id: create_user.id,
        },
        select: {
          id: true,
        },
      });
      const workouts = [];
      // create workout weeks
      for (const day of Days) {
        const workout = await prisma.workout.create({
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
      // gen token and send details
      const access_token = generate_jwt(create_user.id);
      return res.status(201).json({
        ...create_user,
        access_token,
        workout_plan: { ...create_workout_plan, workouts },
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something Went Wrong",
    });
  }
}

export default {
  login,
  register,
};
