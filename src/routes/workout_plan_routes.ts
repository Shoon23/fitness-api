import { Router } from "express";
import workout_plan_controller from "../controller/workout_plan_controller";
const workout_plan_routes = Router();

workout_plan_routes.post(
  "/workout_plan/schedule/assign",
  workout_plan_controller.assign_exercise
);
workout_plan_routes.get(
  "/workout_plan/schedule/:workout_day_id",
  workout_plan_controller.get_exercise
);
workout_plan_routes.delete(
  "/workout_plan/schedule/remove/:id",
  workout_plan_controller.remove_exercise
);

workout_plan_routes.put(
  "/workout_plan/schedule/update",
  workout_plan_controller.update_exercise
);

export default workout_plan_routes;
