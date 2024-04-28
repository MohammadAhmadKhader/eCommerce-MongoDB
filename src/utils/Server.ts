import express,{Response,Request, NextFunction} from "express";
import productsRoute from "../routes/productsRoute"
import usersRoute from "../routes/usersRoute"
import cartsRoute from "../routes/cartsRoute"
import wishlistsRoute from "../routes/wishlistsRoute"
import ordersRoute from "../routes/ordersRoute"
import reviewsRoute from "../routes/reviewsRoute"
import addressesRoute from "../routes/addressesRoute"
import categoriesRoute from "../routes/categoriesRoute"
import brandsRoute from "../routes/brandsRoute"
import contactUsRoute from "../routes/contactUsRoute"
import invoicesRoute from "../routes/invoicesRoute"
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import sanitize from "express-mongo-sanitize"
import globalErrorHandler from "../controllers/errorController"
const cors = require("cors");

function createServer(){
    const app = express();
    app.use(helmet());

    const limiter = rateLimit({
        max:250,
        windowMs:60*60*100, // 1hr
        message:"Something Went Wrong Please Try Again Later",
    });
    
    app.use('/api',limiter);
    app.use(sanitize());
    app.use(express.json());
    app.use(cors());
    app.use(morgan('dev'));

    app.use("/api/categories",categoriesRoute)
    app.use("/api/products",productsRoute);
    app.use("/api/users",usersRoute)
    app.use("/api/carts",cartsRoute)
    app.use("/api/wishlists",wishlistsRoute)
    app.use("/api/orders",ordersRoute)
    app.use("/api/reviews",reviewsRoute);
    app.use("/api/addresses",addressesRoute);
    app.use("/api/brands",brandsRoute);
    app.use("/api/contactUs",contactUsRoute);
    app.use("/api/invoices",invoicesRoute);

    app.use("/api/*",(req:Request,res:Response)=>{
        return res.sendStatus(404);
    })

    app.use(globalErrorHandler)

    return app;
}

export default createServer;