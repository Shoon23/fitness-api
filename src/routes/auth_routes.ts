import { Router } from "express";
import auth_controller from "../controller/auth_controller";
const auth_routes = Router();

auth_routes.post("/login", auth_controller.login);
auth_routes.post("/register", auth_controller.register);
auth_routes.get("/refresh/:token", auth_controller.refresh_token);

export default auth_routes;
