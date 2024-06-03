import { authenticateUser } from './../middlewares/authenticate';
import { paginationUser } from './../middlewares/pagination';
import * as reviewsRouter from "../controllers/reviewsController"
import express from "express"
import { validateDeleteUserReview, validateEditUserReview, 
    validateUserReview } from '../middlewares/validationFunctions/reviewsValidationFunctions';
const router = express.Router()


router.get("/:userId",authenticateUser,paginationUser,reviewsRouter.getAllReviewsByUserId);
router.post("/",validateUserReview,authenticateUser,reviewsRouter.addReviewToProduct);
router.put("/:reviewId",validateEditUserReview,authenticateUser,reviewsRouter.editReview);
router.delete("/:productId/:reviewId",validateDeleteUserReview,authenticateUser,reviewsRouter.deleteReview);

export default router;