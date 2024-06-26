import { authenticateUser } from './../middlewares/authenticate';
import { paginationUser } from './../middlewares/pagination';
import * as ordersRouter from "../controllers/ordersController"
import express from "express"
import { validateCheckOrder, validateOrderId, validateOrdersStatus,
    validatePaymentIntent } from '../middlewares/validationFunctions/ordersValidationFunctions';
const router = express.Router()


router.get("/",validateOrdersStatus,authenticateUser,paginationUser,ordersRouter.getAllUserOrders);
router.get("/singleOrder/:orderId",authenticateUser,ordersRouter.getSingleOrderById);
router.post("/",authenticateUser,ordersRouter.createOrder);
router.delete("/:orderId",validateOrderId,authenticateUser,ordersRouter.cancelOrder);
router.post("/stripe/createPaymentIntent",validatePaymentIntent,authenticateUser,ordersRouter.createPaymentIntent)
router.post("/stripe/orderCheckingOut",validateCheckOrder,authenticateUser,ordersRouter.orderCheckingOut)

export default router;