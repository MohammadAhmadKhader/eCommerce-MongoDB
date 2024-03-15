import { authenticateUser } from './../middlewares/authenticate';
import * as wishListsRouter from "../controllers/wishlistsController" 
import express from "express"
const router = express.Router()

router.get("/:userId",authenticateUser,wishListsRouter.getWishList)
router.post("/",authenticateUser,wishListsRouter.addToWishList)
router.delete("/",authenticateUser,wishListsRouter.removeFromWishList)


export default router