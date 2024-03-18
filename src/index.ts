import express from "express";
import auth_routes from "./routes/auth_routes";
import workout_routes from "./routes/workout_routes";
import verify_access from "./middleware/verify_access";
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(auth_routes);
app.use(verify_access);
app.use(workout_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
