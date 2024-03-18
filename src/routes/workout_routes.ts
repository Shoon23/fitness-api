import { Router } from "express";
import workout_controller from "../controller/workout_controller";

const workout_routes = Router();

workout_routes.post("/workouts", workout_controller.filter_workout);

export default workout_routes;
