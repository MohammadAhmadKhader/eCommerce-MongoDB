import mongoose,{Schema} from "mongoose";
import { ICategory } from "../@types/types";

const categorySchema: Schema<ICategory> = new Schema ({
    name:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    }
},{
    timestamps:false
})

const Category = mongoose.model("Category",categorySchema)
export default Category;