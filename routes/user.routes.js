import { Router } from "express";
import { getUser, getUsers, updateUser } from "../controllers/user.controllers.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/", getUsers)

userRouter.get("/:id", authorize, getUser)

userRouter.post("/", (req, res) => {
    res.send({title: "Createq a new user"});
});

userRouter.put("/:id", updateUser);

userRouter.delete("/:id", (req, res) => {
    res.send({title: "Delete user"});
});

export default userRouter;
