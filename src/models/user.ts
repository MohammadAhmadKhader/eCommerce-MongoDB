import mongoose,{Schema} from "mongoose";
import { IUser } from "../@types/types";

const userSchema  = new Schema<IUser>({
    email:{
        type:String,
        required:true,
        minlength:[6,"email cant be less than 6"],
        maxlength:[64,"email cant be more than 64"],
        trim:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    firstName:{
        type:String,
        required:true,
        trim:true,
        minlength:[4,"first name cant be less than 4"],
        maxlength:[32,"first name cant be more than 32"],
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
        minlength:[4,"last name cant be less than 4"],
        maxlength:[32,"last name cant be more than 32"],
    },
    mobileNumber:{
        type:String,
        trim:true,
        minlength:[6,"mobile number cant be less than 6 numbers"],
        maxlength:[15,"mobile number cant be more than 15 numbers"]
    },
    userImg:{
        type:String,
    },
    birthdate:{
        type:Date,
    },
    addresses:[{
        fullName:{
            type:String,
            trim:true,
            required:true,
            minlength:[4,"full name cant be less than 4 characters"],
            maxlength:[32,"full name cant be more than 32 characters"],
        },
        country:{
            type:String,
            trim:true,
        },
        mobileNumber:{
            type:String,
            trim:true,
            required:true,
            minlength:[6,"mobile number cant be less than 6 numbers"],
            maxlength:[15,"mobile number cant be more than 15 numbers"],
        },
        state:{
            type:String,
            trim:true,
            required:true,
            minlength:[4,"state cant be less than 4 characters"],
            maxlength:[32,"state cant be more than 32 characters"],
        },
        city:{
            type:String,
            trim:true,
            required:true,
            minlength:[3,"city cant be less than 3 characters"],
            maxlength:[32,"city cant be more than 32 characters"],
        },
        pinCode:{
            type:String,
            trim:true,
            minlength:[3,"pin code cant be less than 3 characters"],
            maxlength:[12,"pin code cant be more than 12 characters"]
        },
        streetAddress:{
            type:String,
            trim:true,
            required:true,
            minlength:[4,"street address cant be less than 4 characters"],
            maxlength:[62,"street address cant be more than 62 characters"],
        },
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
    timestamps:true,
})

userSchema.methods.isPasswordHasChanged =async function(JWT_Timestamps : number){
    if(this.passwordChangedAt){
        const pwInTimestamps = Math.floor(this.passwordChangedAt.getTime() / 1000)
        return JWT_Timestamps < pwInTimestamps 
        // if token was made after password return true
    }
    return false;
}

const User = mongoose.model<IUser>("User",userSchema);
export default User;