import dotenv from "dotenv";
dotenv.config();
import {serverConnection} from "./config/database";
import "./config/cloudinary";
import createServer from "./utils/Server";

process.on("uncaughtException",(error)=>{
    console.error("Uncaught exception has occurred : ")
    console.error(error);  
    process.exit(1);
})

export const app = createServer();

process.on("unhandledRejection",(error)=>{
    console.error("Uncaught rejection has occurred : ")
    console.error(error);

    serverConnection.close(()=>{
        process.exit(1);
    })
});