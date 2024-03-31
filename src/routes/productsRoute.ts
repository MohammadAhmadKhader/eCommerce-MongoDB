import { pagination } from './../middlewares/pagination';
import express from "express"
import multer from "multer"
const storage = multer.memoryStorage()
const upload = multer({
    storage,
})

const router = express.Router()

import * as productsRouter from "../controllers/productsController"
import { authenticateAdmin } from '../middlewares/authenticate';
import { validateCreateProduct } from '../middlewares/validationsFunctions';
import { getCache } from '../middlewares/cache';


router.get("/:productId",pagination,productsRouter.getProductById)
router.get("/",pagination,productsRouter.getAllProducts)
router.get("/search/:text",productsRouter.searchForProducts)
router.post("/:userId",authenticateAdmin, upload.single('image'),validateCreateProduct,productsRouter.postNewProduct)
router.post("/:productId/:userId",authenticateAdmin, upload.any(),productsRouter.appendImagesToProduct)
router.delete("/:productId/:userId",authenticateAdmin,productsRouter.deleteProduct)
export default router;