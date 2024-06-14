import jwt from "jsonwebtoken";

const generate_access_jwt = (id: String) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_ACCESS as string, {
    expiresIn: "1h",
  });
};

const generate_refresh_jwt = (id: String) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_REFRESH as string);
};

const verify_access_jwt = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET_ACCESS as string);
};

const verify_refresh_jwt = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET_REFRESH as string);
};

export {
  verify_refresh_jwt,
  generate_access_jwt,
  verify_access_jwt,
  generate_refresh_jwt,
};
