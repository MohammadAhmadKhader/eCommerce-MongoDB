import mongoose from "mongoose";
import { app } from "../app";
import {Server} from 'http';

const DB_URL = process.env.DB_URL as string;
const DB_URL_TEST = process.env.DB_URL_TEST as string;
const PORT = process.env.PORT as string;
export let serverConnection : Server;
let dbUrl : string | undefined;

if(process.env.NODE_ENV?.trim() === "production"){
    dbUrl = DB_URL
}else{
    dbUrl = DB_URL_TEST
}

mongoose.connect(dbUrl as string).then(()=>{
    console.log(`Connected to Database successfully!`);

    serverConnection = app.listen(PORT,()=>{
        console.log(`Connected to PORT : ${PORT} in ${process.env.NODE_ENV?.trim()} mode`);
    })
}).catch((error)=>{
    console.error(error);
})
