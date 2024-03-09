import mongoose from "mongoose";
import { app } from "../app";

const DB_URL = process.env.DB_URL as string;
const PORT = process.env.PORT as string;
mongoose.connect(DB_URL).then((result)=>{
    console.log("Connected to Database successfully!");
    app.listen(PORT,()=>{
    console.log(`Connected to PORT : ${PORT}`);

})
}).catch((e)=>{
    console.log(e);
})
