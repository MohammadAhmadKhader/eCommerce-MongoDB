import { authenticateUser } from './../middlewares/authenticate';
import * as addressesRouter from "../controllers/addressesController"
import express from "express";
import { validateCreatingAddress, validateUpdatingAddress } from "../middlewares/validationsFunctions";
const router = express.Router()

router.post("/",authenticateUser,validateCreatingAddress,addressesRouter.createNewAddress)
router.put("/",authenticateUser,validateUpdatingAddress,addressesRouter.editAddress)
router.delete("/",authenticateUser,addressesRouter.deleteAddress)

export default router;