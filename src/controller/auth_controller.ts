import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import generate_jwt from "../utils/generate_jwt";
export default {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing Email or Password" });
    }

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

      const access_token = generate_jwt("123");
      const { password: hash_password, ...other } = user;
      res.status(201).json({
        ...other,
        access_token,
      });
    } catch (error) {
      res.status(500).json({ error: "Something Went Wrong" });
    }
  },
  register(req: Request, res: Response) {},
};
