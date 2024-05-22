import { NextFunction, Request, Response } from "express";
import { verify_access_jwt } from "../utils/jwt_utils";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const token = authorization?.split(" ")[1];

  if (!authorization || !token) {
    return res.status(401).json({
      message: "Missing Access Token",
    });
  }
  // preferences/update
  try {
    verify_access_jwt(token);
    next();
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
};
