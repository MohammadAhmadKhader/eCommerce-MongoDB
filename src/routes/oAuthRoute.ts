import * as oAuthRouter from "../controllers/oAuthController";
import express from "express";
import { validateOAuthTokenId } from '../middlewares/validationFunctions/oauthValidationFunctions';
const router = express.Router();

router.get("/google/signin",validateOAuthTokenId,oAuthRouter.signInUsingOAuthGoogle);
router.post("/google/signup",validateOAuthTokenId,oAuthRouter.signUpUsingOAuthGoogle);

export default router