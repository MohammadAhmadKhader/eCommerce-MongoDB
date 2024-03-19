import { validateSendingMessage } from './../middlewares/validationsFunctions';
import * as contactUsController from "../controllers/contactUsController"
import express from "express";
const router = express.Router()

router.post("/",validateSendingMessage,contactUsController.sendMessage)

export default router;