import { authenticateUser } from './../middlewares/authenticate';
import * as addressesRouter from "../controllers/addressesController"
import express from "express";
import { validateCreatingAddress, validateUpdatingAddress } from "../middlewares/validationsFunctions";
const router = express.Router()

router.post("/",validateCreatingAddress,authenticateUser,addressesRouter.createNewAddress)
router.put("/",validateUpdatingAddress,authenticateUser,addressesRouter.editAddress)
router.delete("/",authenticateUser,addressesRouter.deleteAddress)

export default router;