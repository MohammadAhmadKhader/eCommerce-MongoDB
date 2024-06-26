import * as usersRouter from "../controllers/usersController"
import oAuthRouter from "./oAuthRoute"
import express from "express"
import { validateForgotPassword, validateResetPasswordViaCode, validateUserChangeInformation,
     validateUserChangePassword, validateUserRegistration, validateUserSignIn } from "../middlewares/validationFunctions/usersValidationFunctions";
import { authenticateUser } from "../middlewares/authenticate";
import upload from "../utils/Multer";
import { authorizeUserInfoUpdate } from "../middlewares/authorize";

const MB2 = 2000;

const router = express.Router()

router.get("/",usersRouter.getUserByToken);
router.get("/verifyResetPasswordToken/:token",usersRouter.verifyResetPasswordToken);
router.post("/signup",validateUserRegistration,usersRouter.signUp);
router.post("/signin",validateUserSignIn,usersRouter.signIn);
router.post("/forgotPassword",validateForgotPassword,usersRouter.forgotPassword);
router.patch("/resetPassword/:token",validateResetPasswordViaCode,usersRouter.resetPasswordViaCode);
router.put("/changepassword",validateUserChangePassword,authenticateUser,usersRouter.changePassword);
router.put("/userInformation",authenticateUser,authorizeUserInfoUpdate,upload({fileSize:MB2}).single("userImg"),validateUserChangeInformation,usersRouter.changeUserInformation);
router.delete("/logout",authenticateUser,usersRouter.logout);
router.use("/oauth",oAuthRouter);

export default router;