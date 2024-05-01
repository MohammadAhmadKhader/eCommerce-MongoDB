import { pagination } from './../middlewares/pagination';
import express from "express"
import * as productsRouter from "../controllers/productsController"
import { authenticateAdmin } from '../middlewares/authenticate';
import {  validateAppendImagesToProduct, validateCreateProduct } from '../middlewares/validationsFunctions';
import multer from "multer"
const storage = multer.memoryStorage()
const upload = multer({
    storage,
})

// import { getCache } from '../middlewares/cache';
const router = express.Router()

router.get("/:productId",pagination,productsRouter.getProductById);
router.get("/",pagination,productsRouter.getAllProducts);
router.get("/search/:text",productsRouter.searchForProducts);
router.post("/",authenticateAdmin, upload.single('image'),validateCreateProduct,productsRouter.postNewProduct);
router.patch("/:productId",authenticateAdmin, upload.any(),validateAppendImagesToProduct,productsRouter.appendImagesToProduct);
router.delete("/:productId",authenticateAdmin,productsRouter.deleteProduct);

export default router;

