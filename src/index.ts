require("dotenv").config();

import express, { Request, Response } from "express";

import { connection } from "./database";
import { userRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(userRouter);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Welcome" });
});

connection
  .then(() => {
    console.log("Database connected");
    app.listen(3333);
  })
  .catch((err) => console.log(err));
