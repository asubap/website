import router from "./routes/index";
import express from "express";

const app = express();
app.use(express.json());

app.use("/api", router);

export default app;