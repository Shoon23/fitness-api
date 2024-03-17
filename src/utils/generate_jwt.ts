import jwt from "jsonwebtoken";

export default (id: String) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "24hr",
  });
};
