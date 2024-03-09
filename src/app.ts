import express from "express";
import morgan from "morgan";
const cors = require("cors");
import productsRoute from "./routes/productsRoute"
import usersRoute from "./routes/usersRoute"
import cartsRoute from "./routes/cartsRoute"
import wishlistsRoute from "./routes/wishlists"
import ordersRoute from "./routes/ordersRoute"
import reviewsRoute from "./routes/reviewsRoute"
import addressesRoute from "./routes/addressesRoute"
import brandsRoute from "./routes/brandsRoute"
import dotenv from "dotenv";
dotenv.config();
import "./config/database";
import "./config/cloudinary";
import Product from "./models/product";
import { ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";
export const app = express();

//app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));


app.use("/api/products",productsRoute);
app.use("/api/users",usersRoute)
app.use("/api/carts",cartsRoute)
app.use("/api/wishlists",wishlistsRoute)
app.use("/api/orders",ordersRoute)
app.use("/api/reviews",reviewsRoute);
app.use("/api/addresses",addressesRoute);
app.use("/api/brands",brandsRoute);

// for (let index = 0; index < 200; index++) {
//     (async function run(){
//         const prod = FakerUtils.createRandomProduct()
//         const product = await Product.create(prod)
//         console.log(`${index + 1} Product`)
//     })
// }


(function run(){
    const randomWords = faker.commerce.productDescription()
    console.log(randomWords)
})

