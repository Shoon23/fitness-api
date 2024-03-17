import express from "express";
import auth_routes from "./routes/auth_routes";
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(auth_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
