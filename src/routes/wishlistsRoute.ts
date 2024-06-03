import { authenticateUser } from '../middlewares/authenticate';
import * as wishListsRouter from "../controllers/wishlistsController" 
import express from "express"
import { validateAddToWishList, 
    validateRemoveFromWishlist } from '../middlewares/validationFunctions/wishlistsValidationFunctions';
const router = express.Router()

router.get("/:userId",authenticateUser,wishListsRouter.getWishList)
router.post("/",validateAddToWishList,authenticateUser,wishListsRouter.addToWishList)
router.delete("/:wishlistItemId",validateRemoveFromWishlist,authenticateUser,wishListsRouter.removeFromWishList)


export default router