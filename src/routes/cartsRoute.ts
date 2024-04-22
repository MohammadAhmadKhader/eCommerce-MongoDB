import { authenticateUser } from './../middlewares/authenticate';
import * as cartsRouter from "../controllers/cartsController";
import express from "express";
import { validateAddingToCart, validateChangeCartItemQuantityByOne, validateDeletingFromCart } from '../middlewares/validationsFunctions';
const router = express.Router();

router.get("/:userId",authenticateUser,cartsRouter.getAllCartItems)
router.post("/",authenticateUser,validateAddingToCart,cartsRouter.addToCart);
router.put("/changeQtyByOne",authenticateUser,validateChangeCartItemQuantityByOne,cartsRouter.changeCartItemQuantityByOne)
router.delete("/clearCart",authenticateUser,cartsRouter.clearCart)
router.delete("/deleteCartItem",authenticateUser,validateDeletingFromCart,cartsRouter.deleteFromCart)

export default router