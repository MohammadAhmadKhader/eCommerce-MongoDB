import { pagination } from './../middlewares/pagination';
import { authenticateUser, authenticateAdmin } from './../middlewares/authenticate';
import * as invoicesRouter from "../controllers/invoicesController"
import express from "express"

const router = express.Router()

router.get("/:orderId",authenticateUser,invoicesRouter.getInvoiceByOrderId);
router.get("/",authenticateAdmin,pagination,invoicesRouter.getAllInvoices);

export default router;