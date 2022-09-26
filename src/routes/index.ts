import { Router, Request, Response } from "express";
import bycript from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { User } from "../models/User";
import { checkToken } from "../middlewares/checkToken";

const userRouter = Router();

userRouter.post("/auth/register", async (req: Request, res: Response) => {
  const { name, email, password, confirm_password } = req.body;

  if (!name) {
    return res.status(422).json({ message: "Name is required" });
  }

  if (!email) {
    return res.status(422).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(422).json({ message: "Password is required" });
  }

  if (password !== confirm_password) {
    return res.status(422).json({ message: "Passwords is not equals" });
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    return res.status(422).json({ message: "User already exists" });
  }

  const salt = await bycript.genSalt(12);
  const passwordHash = await bycript.hash(password, salt);

  const user = new User({
    name,
    password: passwordHash,
    email,
  });

  try {
    const userSaved = await user.save();

    res.location(`/users/${userSaved._id}`);

    return res.status(201).json({ id: userSaved._id, name, email });
  } catch (error) {
    return res.status(500).json({ message: "Internal Error" });
  }
});

userRouter.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(422).json({ message: "Password is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const checkPassword = await bycript.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ message: "Invalid password" });
  }

  try {
    const secret = process.env.SECRET as string;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    return res.status(200).json({
      message: "User authenticated",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Error" });
  }
});

// private router
userRouter.get(
  "/users/:id",
  checkToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Not found" });
      }

      const user = await User.findById(id, "-password");

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Internal Error" });
    }
  }
);
export { userRouter };
