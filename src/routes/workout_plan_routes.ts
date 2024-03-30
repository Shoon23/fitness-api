import { Router } from "express";
import workout_plan_controller from "../controller/workout_plan_controller";
const workout_plan_routes = Router();

workout_plan_routes.post(
  "workout_plan/schedule/assign",
  workout_plan_controller.assign_exercise
);
workout_plan_routes.delete("workout_plan/schedule/remove");

export default workout_plan_routes;
