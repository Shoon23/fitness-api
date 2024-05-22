import { Router } from "express";
import workout_controller from "../controller/workout_controller";

const workout_routes = Router();

workout_routes.post(
  "/workouts/recommendation",
  workout_controller.reccomend_workout
);
workout_routes.post("/workouts", workout_controller.search_workouts);

export default workout_routes;
