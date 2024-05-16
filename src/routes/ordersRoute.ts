import { authenticateUser, authenticateAdmin } from './../middlewares/authenticate';
import { pagination } from './../middlewares/pagination';
import * as ordersRouter from "../controllers/ordersController"
import express from "express"
import { validateCheckOrder, validateOrderId, validateOrdersStatus, validatePaymentIntent } from '../middlewares/validationsFunctions';

const router = express.Router()


router.get("/",validateOrdersStatus,authenticateUser,pagination,ordersRouter.getAllUserOrders);
router.get("/dashboard",authenticateAdmin,pagination,ordersRouter.getAllOrders);
router.get("/singleOrder/:orderId",authenticateUser,ordersRouter.getSingleOrderById);
router.post("/",authenticateUser,ordersRouter.createOrder);
router.delete("/:orderId",validateOrderId,authenticateUser,ordersRouter.cancelOrder);
router.patch("/dashboard/:orderId",validateOrderId,authenticateAdmin,ordersRouter.cancelOrderAdminPrivilege);
router.post("/stripe/createPaymentIntent",validatePaymentIntent,authenticateUser,ordersRouter.createPaymentIntent)
router.post("/stripe/orderCheckingOut",validateCheckOrder,authenticateUser,ordersRouter.orderCheckingOut)

export default router;