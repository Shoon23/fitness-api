import { NextFunction, Request, Response } from "express";
import { verify_jwt } from "../utils/jwt_utils";

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const token = authorization?.split(" ")[1];

  if (!authorization || !token) {
    return res.status(401).json({
      message: "Missing Access Token",
    });
  }

  try {
    const isValid = verify_jwt(token);
    if (!isValid) {
      return res.status(401).json({
        message: "Invalid Access Token",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong!" });
  }
};
