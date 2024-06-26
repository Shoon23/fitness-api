import express from "express";
import auth_routes from "./routes/auth_routes";
import workout_routes from "./routes/workout_routes";
import workout_plan_routes from "./routes/workout_plan_routes";
import verify_access from "./middleware/verify_access";
import cors from "cors";
import user_routes from "./routes/user_routes";
const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());

app.use(express.static("public/exercises_data/exercises_img"));
app.use(express.static("public/info_img"));

app.use(express.json());

app.get("/aso", (req, res) => {
  res.json({
    message: "workoing",
  });
});

app.use(auth_routes);
app.use(verify_access);
app.use(user_routes);
app.use(workout_routes);
app.use(workout_plan_routes);

app.listen(PORT, () => {
  console.log(`Server is running`);
});
