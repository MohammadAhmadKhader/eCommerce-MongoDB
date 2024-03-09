import * as usersRouter from "../controllers/usersController"
import express from "express"
import { validateUserChangePassword, validateUserRegistration } from "../middlewares/validationsFunctions";
import { authenticateUser } from "../middlewares/authenticate";
import multer from "multer";
import { authorizeUserInfoUpdate } from "../middlewares/authorize";
const storage = multer.memoryStorage()
const upload = multer({
    storage,
})


const router = express.Router()

router.post("/signup",validateUserRegistration,usersRouter.signUp);
router.post("/signin",usersRouter.singIn)
router.delete("/logout",usersRouter.logout)
router.put("/changepassword",authenticateUser,validateUserChangePassword,usersRouter.changePassword)
router.put("/:userId",authenticateUser,authorizeUserInfoUpdate,upload.single("userImg"),usersRouter.changeUserInformation)
router.post("/resetpassword",usersRouter.verifyCode)

export default router;