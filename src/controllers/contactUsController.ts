import MailUtils from "../utils/MailUtils";
import { asyncHandler } from "../utils/AsyncHandler";


export const sendMessage = asyncHandler(async(req ,res)=>{
    const {email,message,fullName,subject} = req.body;

    await MailUtils.SendMessage(email,fullName,message,subject);

    return res.status(200).json({message:"success"});
})