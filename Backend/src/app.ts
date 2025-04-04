import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Mount all routes
app.use("/", routes);

export default app;
