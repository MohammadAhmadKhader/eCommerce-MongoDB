import { authenticateUser } from './../middlewares/authenticate';
import * as cartsRouter from "../controllers/cartsController";
import express from "express";
import { validateAddingToCart, validateChangeCartItemQuantityByOne, validateDeletingFromCart } from '../middlewares/validationsFunctions';
const router = express.Router();

router.get("/:userId",authenticateUser,cartsRouter.getAllCartItems)
router.post("/",validateAddingToCart,authenticateUser,cartsRouter.addToCart);
router.put("/changeQtyByOne",validateChangeCartItemQuantityByOne,authenticateUser,cartsRouter.changeCartItemQuantityByOne)
router.delete("/clearCart",authenticateUser,cartsRouter.clearCart)
router.delete("/deleteCartItem",validateDeletingFromCart,authenticateUser,cartsRouter.deleteFromCart)

export default router