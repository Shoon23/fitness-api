import { Router } from "express";
import auth_controller from "../controller/auth_controller";
const auth_routes = Router();

auth_routes.get("/login", auth_controller.login);
auth_routes.post("/register");

export default auth_routes;
