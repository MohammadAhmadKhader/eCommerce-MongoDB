import { authenticateUser } from './../middlewares/authenticate';
import { pagination } from './../middlewares/pagination';
import * as reviewsRouter from "../controllers/reviewsController"
import express from "express"
import { validateUserReview } from '../middlewares/validationsFunctions';
const router = express.Router()


router.get("/:userId",pagination,reviewsRouter.getAllReviewsByUserId)
router.post("/",authenticateUser,validateUserReview,reviewsRouter.addReviewToProduct)
router.put("/",authenticateUser,reviewsRouter.editReview);
router.delete("/",authenticateUser,reviewsRouter.deleteReview)

export default router;