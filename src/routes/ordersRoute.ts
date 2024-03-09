import { authenticateUser } from './../middlewares/authenticate';
import { pagination } from './../middlewares/pagination';
import * as ordersRouter from "../controllers/ordersController"
import express from "express"
const router = express.Router()


router.get("/",authenticateUser,pagination,ordersRouter.getAllOrders)
router.post("/",authenticateUser,ordersRouter.createOrder)
router.delete("/",authenticateUser,ordersRouter.deleteOrder)

export default router;