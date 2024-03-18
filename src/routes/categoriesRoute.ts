import * as categoriesRouter from "../controllers/categoriesController"
import express from "express"
const router = express.Router()


router.get("/",categoriesRouter.getAllCategories)


export default router;