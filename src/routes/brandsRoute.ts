import * as brandsRouter from "../controllers/brandsController"
import express from "express";
import { authenticateAdmin } from "../middlewares/authenticate";
import multer from "multer"
const storage = multer.memoryStorage()
const upload = multer({
    storage,
})
const router = express.Router()


router.get("/",brandsRouter.getAllBrands)
router.post("/:userId",authenticateAdmin, upload.single('brandLogo'),brandsRouter.createNewBrand)


export default router;