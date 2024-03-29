import mongoose,{Schema} from "mongoose";

const resetPassCode = new Schema({
    userId:Schema.Types.ObjectId,
    code:String,
    expiredAt:{
        type:Date,
        default:Date.now() +  30 * 60 * 1000,// 30 minutes
    }
},{
    timestamps:false
})

const ResetPassCode = mongoose.model("ResetPassCode",resetPassCode);
export default ResetPassCode;
