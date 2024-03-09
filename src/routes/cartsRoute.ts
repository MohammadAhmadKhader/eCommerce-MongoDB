import { authenticateUser } from './../middlewares/authenticate';
import * as cartsRouter from "../controllers/cartsController";
import express from "express";
const router = express.Router();

router.get("/",authenticateUser,cartsRouter.getAllCartItems)
router.post("/",authenticateUser,cartsRouter.addToCart);
router.put("/changeQtyByOne",authenticateUser,cartsRouter.changeCartItemQuantityByOne)
router.delete("/clearCart",authenticateUser,cartsRouter.clearCart)
router.delete("/deleteCartItem",authenticateUser,cartsRouter.deleteFromCart)

export default router