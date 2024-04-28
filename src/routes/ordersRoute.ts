import { authenticateUser } from './../middlewares/authenticate';
import { pagination } from './../middlewares/pagination';
import * as ordersRouter from "../controllers/ordersController"
import express from "express"
import { validateCheckOrder, validateOrderId, validateOrdersStatus } from '../middlewares/validationsFunctions';

const router = express.Router()


router.get("/:userId",validateOrdersStatus,authenticateUser,pagination,ordersRouter.getAllOrders);
router.get("/singleOrder/:orderId",authenticateUser,ordersRouter.getSingleOrderById);
router.post("/",authenticateUser,ordersRouter.createOrder);
router.delete("/",validateOrderId,authenticateUser,ordersRouter.deleteOrder);
router.post("/stripe/createPaymentIntent",validateOrderId,authenticateUser,ordersRouter.createPaymentIntent)
router.post("/stripe/orderCheckingOut",validateCheckOrder,authenticateUser,ordersRouter.orderCheckingOut)

export default router;