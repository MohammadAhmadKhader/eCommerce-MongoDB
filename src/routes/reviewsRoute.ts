import { authenticateUser, authenticateAdmin } from './../middlewares/authenticate';
import { pagination } from './../middlewares/pagination';
import * as reviewsRouter from "../controllers/reviewsController"
import express from "express"
import { validateDeleteUserReview, validateEditUserReview, validateUserReview } from '../middlewares/validationsFunctions';
const router = express.Router()


router.get("/:userId",authenticateUser,pagination,reviewsRouter.getAllReviewsByUserId);
router.get("/",authenticateAdmin,pagination,reviewsRouter.getAllReviews)
router.post("/",validateUserReview,authenticateUser,reviewsRouter.addReviewToProduct);
router.put("/:reviewId",validateEditUserReview,authenticateUser,reviewsRouter.editReview);
router.delete("/:productId/:reviewId",validateDeleteUserReview,authenticateUser,reviewsRouter.deleteReview);

export default router;