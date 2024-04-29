import mongoose,{Schema} from "mongoose";
import { IBrand } from "../@types/types";

const brandSchema : Schema<IBrand>= new Schema ({
    name:{
        type:String,
        required:true,
        unique:true
    },
    imageUrl:{
        type:String,
        required:true
    }
},{
    timestamps:false
})

const Brand = mongoose.model("Brand",brandSchema)
export default Brand;