import { validateOrderId} from './../middlewares/validationFunctions/ordersValidationFunctions';
import { validateUserRegistration } from '../middlewares/validationFunctions/usersValidationFunctions';
import * as dashboardController from "../controllers/dashboardController"
import express from "express";
import { authenticateAdmin } from '../middlewares/authenticate';
import { paginationAdmin } from '../middlewares/pagination';
import upload from '../utils/Multer';
const router = express.Router()
const MB2 = 2000;

router.get("/orders",authenticateAdmin,paginationAdmin,dashboardController.getAllOrders);
router.get("/invoices",authenticateAdmin,paginationAdmin,dashboardController.getAllInvoices);
router.get("/reviews",authenticateAdmin,paginationAdmin,dashboardController.getAllReviews);
router.get("/users",authenticateAdmin,paginationAdmin,dashboardController.getAllUsers);
router.post("/users",authenticateAdmin,upload({fileSize:MB2}).single("userImg"),validateUserRegistration,dashboardController.createUser);
router.patch("/orders/:orderId",validateOrderId,authenticateAdmin,dashboardController.cancelOrderAdminPrivilege);
router.delete("/users/:userId",authenticateAdmin,dashboardController.deleteUserById);

export default router;