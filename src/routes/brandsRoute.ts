import * as brandsRouter from "../controllers/brandsController"
import express from "express";
import { authenticateAdmin } from "../middlewares/authenticate";
import {getServerCache}from "../middlewares/serverCache"
import { validateCreateBrand, validateUpdateBrand } from "../middlewares/validationFunctions/brandsValidationFunctions";
import upload from "../utils/Multer";
const MB2 = 2000;
const router = express.Router()


router.get("/",getServerCache("brands"),brandsRouter.getAllBrands);
router.post("/",authenticateAdmin, upload({fileSize:MB2}).single('brandLogo'),validateCreateBrand,brandsRouter.createNewBrand);
router.put("/:brandId",authenticateAdmin,upload({fileSize:MB2}).single('brandLogo'),validateUpdateBrand,brandsRouter.updateBrand);
router.delete("/:brandId",authenticateAdmin,brandsRouter.deleteBrand);

export default router;
