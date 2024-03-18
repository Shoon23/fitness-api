import jwt from "jsonwebtoken";

const generate_jwt = (id: String) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string);
};

const verify_jwt = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

export { generate_jwt, verify_jwt };
