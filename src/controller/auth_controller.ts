import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import {
  generate_access_jwt,
  generate_refresh_jwt,
  verify_refresh_jwt,
} from "../utils/jwt_utils";
import Joi, { preferences } from "joi";
import {
  equipment_types,
  level_types,
  muscle_groups,
} from "./workout_controller";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

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
        password: true,
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        preference: {
          select: {
            id: true,
            equipments: {
              select: {
                id: true,
                name: true,
              },
            },
            levels: {
              select: {
                id: true,
                name: true,
              },
            },
            muscles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const workout_plan = await prisma.workoutPlan.findFirst({
      where: {
        user_id: user?.id,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        workouts: {
          select: {
            id: true,
            day: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User Not Yet Registered",
      });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({
        message: "Wrong Password",
      });
    }

    const access_token = generate_access_jwt(user.id);
    const refresh_token = generate_refresh_jwt(user.id);

    const { password: hash_password, preference, ...other } = user;

    res.status(200).json({
      ...other,
      access_token,
      refresh_token,
      workout_plan: workout_plan,
      preferences: {
        id: preference?.id,
        levels: preference?.levels.map((lvl) => lvl.name),
        equipments: preference?.equipments.map((eq) => eq.name),
        muscles: preference?.muscles.map((m) => m.name),
      },
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
    // gen token and send details

    const access_token = generate_access_jwt(create_user.id);
    const refresh_token = generate_refresh_jwt(create_user.id);

    return res.status(201).json({
      ...create_user,
      access_token,
      refresh_token,
      workout_plan: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something Went Wrong",
    });
  }
}

// create Prefrence

const pref_schema = Joi.object({
  levels: Joi.array()
    .items(Joi.string().valid(...level_types))
    .required(),
  equipments: Joi.array()
    .items(Joi.string().valid(...equipment_types))
    .required(),
  muscles: Joi.array()
    .items(Joi.string().valid(...muscle_groups))
    .required(),
  user_id: Joi.string().required(),
});
const create_preference = async (req: Request, res: Response) => {
  const { value, error } = pref_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    await prisma.$transaction(async (prisma) => {
      const create_pref = await prisma.preference.create({
        data: {
          user_id: value.user_id,
        },
      });

      await prisma.preferLevel.createMany({
        data: value.levels.map((level: string) => ({
          name: level,
          preference_id: create_pref.id,
        })),
      });

      await prisma.preferMuscle.createMany({
        data: value.muscles.map((muscle: string) => ({
          name: muscle,
          preference_id: create_pref.id,
        })),
      });
      await prisma.preferEquipment.createMany({
        data: value.equipments.map((equip: string) => ({
          name: equip,
          preference_id: create_pref.id,
        })),
      });

      const levels = await prisma.preferLevel.findMany({
        where: {
          preference_id: create_pref.id,
        },
        select: {
          name: true,
        },
      });
      const equipments = await prisma.preferEquipment.findMany({
        where: {
          preference_id: create_pref.id,
        },
        select: {
          name: true,
        },
      });

      const muscles = await prisma.preferMuscle.findMany({
        where: {
          preference_id: create_pref.id,
        },
        select: {
          name: true,
        },
      });
      return res.status(200).json({
        id: create_pref.id,
        levels: levels.map((lvl) => lvl.name),
        equipments: equipments.map((eq) => eq.name),
        muscles: muscles.map((m) => m.name),
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

const refresh_token_schema = Joi.object({
  token: Joi.string().required(),
});

async function refresh_token(req: Request, res: Response) {
  const { value, error } = refresh_token_schema.validate(req.params);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const decoded_token = verify_refresh_jwt(value.token) as {
      id: string;
      iat: number;
    };

    const user_info = await prisma.user.findUnique({
      where: {
        id: decoded_token.id,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        preference: {
          select: {
            id: true,
            equipments: {
              select: {
                id: true,
                name: true,
              },
            },
            levels: {
              select: {
                id: true,
                name: true,
              },
            },
            muscles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user_info) {
      return res.status(404).json({ message: "User not found" });
    }

    const workout_plan = await prisma.workoutPlan.findFirst({
      where: {
        user_id: user_info.id,
        is_active: true,
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
    });

    const access_token = generate_access_jwt(user_info.id);
    const { preference, ...rest } = user_info;

    res.status(200).json({
      ...rest,
      access_token,
      workout_plan: workout_plan,
      preferences: {
        id: preference?.id,
        levels: preference?.levels.map((lvl) => lvl.name),
        equipments: preference?.equipments.map((eq) => eq.name),
        muscles: preference?.muscles.map((m) => m.name),
      },
    });
  } catch (error) {
    if (
      error instanceof TokenExpiredError ||
      error instanceof JsonWebTokenError
    ) {
      res.status(401).json({
        error: "Token is expired or invalid",
      });
    } else {
      res.status(500).json({ message: "Something Went Wrong!" });
    }
  }
}
const update_preference_schema = Joi.object({
  levels: Joi.array().items(Joi.string().valid(...level_types)),
  equipments: Joi.array().items(Joi.string().valid(...equipment_types)),
  muscles: Joi.array().items(Joi.string().valid(...muscle_groups)),
  id: Joi.string().required(),
}).or("levels", "equipments", "muscles");

async function update_preference(req: Request, res: Response) {
  const { value, error } = update_preference_schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { levels, muscles, equipments, id } = value;
  try {
    await prisma.$transaction(async (prisma) => {
      if (levels && levels.length > 0) {
        await prisma.preferLevel.deleteMany({
          where: {
            preference_id: id,
          },
        });
        await prisma.preferLevel.createMany({
          data: levels.map((lv: string) => ({ name: lv, preference_id: id })),
        });
      }

      if (equipments && equipments.length > 0) {
        await prisma.preferEquipment.deleteMany({
          where: {
            preference_id: id,
          },
        });
        await prisma.preferEquipment.createMany({
          data: equipments.map((eq: string) => ({
            name: eq,
            preference_id: id,
          })),
        });
      }

      if (muscles && muscles.length > 0) {
        await prisma.preferMuscle.deleteMany({
          where: {
            preference_id: id,
          },
        });
        await prisma.preferMuscle.createMany({
          data: muscles.map((m: string) => ({ name: m, preference_id: id })),
        });
      }

      res.status(201).send("success");
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
  create_preference,
  update_preference,
  refresh_token,
};
