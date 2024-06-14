import Joi from "joi";
import prisma from "../lib/prisma";
import {
  level_types,
  equipment_types,
  muscle_groups,
} from "./workout_controller";
import { Request, Response } from "express";

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

export default {
  update_preference,
  create_preference,
};
