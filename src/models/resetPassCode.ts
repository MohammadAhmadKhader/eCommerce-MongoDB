import mongoose,{Schema} from "mongoose";
import { IResetPassCode } from "../@types/types";

const resetPassCode = new Schema<IResetPassCode>({
    userId:Schema.Types.ObjectId,
    code:String,
    expiredAt:{
        type:Date,
        default:Date.now() +  30 * 60 * 1000,// 30 minutes
    }
},{
    timestamps:false
})

const ResetPassCode = mongoose.model<IResetPassCode>("ResetPassCode",resetPassCode);
export default ResetPassCode;
