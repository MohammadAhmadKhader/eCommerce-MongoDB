import { authenticateUser } from './../middlewares/authenticate';
import { pagination } from './../middlewares/pagination';
import * as ordersRouter from "../controllers/ordersController"
import express from "express"

const router = express.Router()


router.get("/:userId",authenticateUser,pagination,ordersRouter.getAllOrders);
router.get("/singleOrder/:orderId",authenticateUser,ordersRouter.getSingleOrderById);
router.post("/",authenticateUser,ordersRouter.createOrder);
router.delete("/",authenticateUser,ordersRouter.deleteOrder);
router.post("/stripe/createPaymentIntent",ordersRouter.createPaymentIntent)
router.post("/stripe/OrderCheckingOut",ordersRouter.OrderCheckingOut)

export default router;