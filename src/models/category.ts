import mongoose,{Schema} from "mongoose";
import { ICategory } from "../@types/types";

const categorySchema = new Schema<ICategory> ({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:[2,"category name cant be less than 2 characters"],
        maxlength:[64,"category name cant be more than 64 character"],
        unique:true
    },
    imageUrl:{
        type:String,
        required:true
    }
},{
    timestamps:false
})

const Category = mongoose.model<ICategory>("Category",categorySchema)
export default Category;