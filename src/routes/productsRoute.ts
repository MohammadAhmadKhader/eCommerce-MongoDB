import { paginationUser } from './../middlewares/pagination';
import express from "express"
import * as productsRouter from "../controllers/productsController"
import { authenticateAdmin } from '../middlewares/authenticate';
import upload from '../utils/Multer';
import { validateAppendImagesToProduct, validateCreateProduct, validateUpdateProduct, validateUpdateSingleImageProduct } from '../middlewares/validationFunctions/productsValidationFunctions';
const MB2 = 2000;
const MB10 = 10000;
const MB12 = 12000;
// import { getCache } from '../middlewares/cache';
const router = express.Router()

router.get("/:productId",paginationUser,productsRouter.getProductById);
router.get("/",paginationUser,productsRouter.getAllProducts);
router.get("/search/:text",productsRouter.searchForProducts);
router.post("/",authenticateAdmin, upload({fileSize:MB2}).single('image'),validateCreateProduct,productsRouter.postNewProduct);
router.patch("/:productId",authenticateAdmin,upload({}).none(),validateUpdateProduct, productsRouter.updateProductInfo);
router.patch("/addImages/:productId",authenticateAdmin, upload({fileSize:MB10,filesNum:9}).any(),validateAppendImagesToProduct,productsRouter.appendImagesToProduct);
router.patch("/image/:productId",authenticateAdmin,upload({fileSize:MB2}).single('image'),validateUpdateSingleImageProduct, productsRouter.updateProductSingleImage);
router.delete("/:productId",authenticateAdmin,productsRouter.deleteProduct);

export default router;

