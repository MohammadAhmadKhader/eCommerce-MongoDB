import * as categoriesRouter from "../controllers/categoriesController"
import express from "express"
import { getServerCache } from "../middlewares/serverCache";
const router = express.Router()


router.get("/",getServerCache("categories"),categoriesRouter.getAllCategories)


export default router;