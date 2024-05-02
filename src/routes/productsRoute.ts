import { pagination } from './../middlewares/pagination';
import express from "express"
import * as productsRouter from "../controllers/productsController"
import { authenticateAdmin } from '../middlewares/authenticate';
import {  validateAppendImagesToProduct, validateCreateProduct } from '../middlewares/validationsFunctions';
import upload from '../utils/Multer';
const MB2 = 2000;
const MB10 = 10000;
// import { getCache } from '../middlewares/cache';
const router = express.Router()

router.get("/:productId",pagination,productsRouter.getProductById);
router.get("/",pagination,productsRouter.getAllProducts);
router.get("/search/:text",productsRouter.searchForProducts);
router.post("/",authenticateAdmin, upload({fileSize:MB2}).single('image'),validateCreateProduct,productsRouter.postNewProduct);
router.patch("/:productId",authenticateAdmin, upload({fileSize:MB10,filesNum:9}).any(),validateAppendImagesToProduct,productsRouter.appendImagesToProduct);
router.delete("/:productId",authenticateAdmin,productsRouter.deleteProduct);

export default router;

