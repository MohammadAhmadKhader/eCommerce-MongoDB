import * as brandsRouter from "../controllers/brandsController"
import express from "express";
import { authenticateAdmin } from "../middlewares/authenticate";
import {getServerCache}from "../middlewares/serverCache"
import { validateCreateBrand } from "../middlewares/validationsFunctions";
import multer from "multer"
const storage = multer.memoryStorage()
const upload = multer({
    storage,
})
const router = express.Router()


router.get("/",getServerCache("brands"),brandsRouter.getAllBrands)
router.post("/",authenticateAdmin, upload.single('brandLogo'),validateCreateBrand,brandsRouter.createNewBrand)


export default router;
