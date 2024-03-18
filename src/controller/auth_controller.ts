import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { generate_jwt } from "../utils/jwt_utils";
import Joi from "joi";

const login_schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]")).required(),
});

const register_schema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]")).required(),
});

export default {
  async login(req: Request, res: Response) {
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

      const access_token = generate_jwt(user.id);
      const { password: hash_password, ...other } = user;

      res.status(200).json({
        ...other,
        access_token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something Went Wrong" });
    }
  },
  async register(req: Request, res: Response) {
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

      const access_token = generate_jwt(create_user.id);
      return res.status(201).json({
        ...create_user,
        access_token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Something Went Wrong",
      });
    }
  },
};
