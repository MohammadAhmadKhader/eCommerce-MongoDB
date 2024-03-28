import { authenticateUser } from './../middlewares/authenticate';
import { pagination } from './../middlewares/pagination';
import * as invoicesRouter from "../controllers/invoicesController"
import express from "express"

const router = express.Router()

router.get("/:orderId",authenticateUser,invoicesRouter.getInvoiceByOrderId);

export default router;