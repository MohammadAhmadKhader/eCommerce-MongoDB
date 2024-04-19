import mongoose,{Schema} from "mongoose";
import { IUser } from "../@types/types";

const userSchema = new Schema<IUser>({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:String,
    },
    userImg:{
        type:String,
    },
    birthdate:{
        type:Date,
    },
    addresses:[{
        fullName:String,
        country:String,
        mobileNumber:String,
        state:String,
        city:String,
        pinCode:String,
        streetAddress:String,
    }],
    wishList:[{
        productId:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
    }],
    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    cart:[{
        productId:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        quantity:Number,
    }],
    passwordChangedAt:Date
},{
    timestamps:true
})

userSchema.methods.isPasswordHasChanged =async function(JWT_Timestamps : number){
    if(this.passwordChangedAt){
        const pwInTimestamps = Math.floor(this.passwordChangedAt.getTime() / 1000)
        return JWT_Timestamps < pwInTimestamps 
        // if token was made after password return true
    }
    return false;
}

const User = mongoose.model("User",userSchema);
export default User;