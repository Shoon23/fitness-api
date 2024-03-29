import { Router } from "express";
import auth_controller from "../controller/auth_controller";
const auth_routes = Router();

auth_routes.post("/login", auth_controller.login);
auth_routes.post("/register", auth_controller.register);

export default auth_routes;
