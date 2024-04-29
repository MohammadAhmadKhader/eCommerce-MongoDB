import mongoose from "mongoose";
import { app } from "../app";
import {Server} from 'http';

const DB_URL = process.env.DB_URL as string;
const PORT = process.env.PORT as string;
export let serverConnection : Server;
mongoose.connect(DB_URL).then(()=>{
    console.log(`Connected to Database successfully!`);

    serverConnection = app.listen(PORT,()=>{
        console.log(`Connected to PORT : ${PORT} in ${process.env.NODE_ENV?.trim()} mode`);
    })
}).catch((error)=>{
    console.error(error);
})
