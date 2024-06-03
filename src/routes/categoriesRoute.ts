import * as categoriesRouter from "../controllers/categoriesController"
import express from "express"
import { getServerCache } from "../middlewares/serverCache";
import { authenticateAdmin } from "../middlewares/authenticate";
import { validateCreateCategory, validateUpdateCategory } from "../middlewares/validationFunctions/categoriesValidationFunctions";
import upload from "../utils/Multer";
const MB2 = 2000;
const router = express.Router();


router.get("/",getServerCache("categories"),categoriesRouter.getAllCategories);
router.post("/",authenticateAdmin,upload({fileSize:MB2}).single("image"),validateCreateCategory,categoriesRouter.createCategory);
router.put("/:categoryId",authenticateAdmin,upload({fileSize:MB2}).single("image"),validateUpdateCategory,categoriesRouter.updateCategory);
router.delete("/:categoryId",authenticateAdmin,categoriesRouter.deleteCategory);

export default router;