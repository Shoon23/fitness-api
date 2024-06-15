import { Router } from "express";
import auth_controller from "../controller/auth_controller";
import user_controller from "../controller/user_controller";
const user_routes = Router();

user_routes.put("/preferences/update", user_controller.update_preference);

export default user_routes;
