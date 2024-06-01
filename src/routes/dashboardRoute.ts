import { validateOrderId, validateSendingMessage, validateUserRegistration } from './../middlewares/validationsFunctions';
import * as dashboardController from "../controllers/dashboardController"
import express from "express";
import { authenticateAdmin } from '../middlewares/authenticate';
import { pagination } from '../middlewares/pagination';
import upload from '../utils/Multer';
const router = express.Router()
const MB2 = 2000;

router.get("/orders",authenticateAdmin,pagination,dashboardController.getAllOrders);
router.get("/invoices",authenticateAdmin,pagination,dashboardController.getAllInvoices);
router.get("/reviews",authenticateAdmin,pagination,dashboardController.getAllReviews);
router.post("/users",authenticateAdmin,upload({fileSize:MB2}).single("userImg"),validateUserRegistration,dashboardController.createUser);
router.patch("orders/:orderId",validateOrderId,authenticateAdmin,dashboardController.cancelOrderAdminPrivilege);
router.delete("/users/:userId",authenticateAdmin,dashboardController.deleteUserById);

export default router;