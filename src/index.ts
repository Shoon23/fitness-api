import express from "express";
import auth_routes from "./routes/auth_routes";
import workout_routes from "./routes/workout_routes";
import workout_plan_routes from "./routes/workout_plan_routes";
import verify_access from "./middleware/verify_access";
import cors from "cors";
const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.static("public/exercises_data/exercises_img"));
app.use(express.json());

app.use(auth_routes);
// app.use(verify_access);
app.use(workout_routes);
app.use(workout_plan_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
