import { pagination } from './../middlewares/pagination';
import express from "express"
import * as productsRouter from "../controllers/productsController"
import { authenticateAdmin } from '../middlewares/authenticate';
import { validateThenAuthThenUpload } from '../middlewares/validateThenAuthThenUpload';
import { validateAppendImagesToProduct, validateCreateProduct } from '../middlewares/validationsFunctions';
// import { getCache } from '../middlewares/cache';

const router = express.Router()

router.get("/:productId",pagination,productsRouter.getProductById)
router.get("/",pagination,productsRouter.getAllProducts)
router.get("/search/:text",productsRouter.searchForProducts)
router.post("/:userId",validateThenAuthThenUpload(validateCreateProduct,authenticateAdmin,"image"),productsRouter.postNewProduct)
router.post("/:productId/:userId",validateThenAuthThenUpload(validateAppendImagesToProduct,authenticateAdmin),productsRouter.appendImagesToProduct)
router.delete("/:productId/:userId",authenticateAdmin,productsRouter.deleteProduct)
export default router;

