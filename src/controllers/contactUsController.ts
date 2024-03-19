import { Request,Response } from "express";
import MailUtils from "../utils/MailUtils";


export const sendMessage = async(req:Request,res:Response)=>{
    try{
        const {email,message,fullName,subject} = req.body;

        await MailUtils.SendMessage(email,fullName,message,subject)
        return res.status(200).json({message:"success"})
    }catch(error){
        console.error(error)
        return res.status(500).json({error})
    }
}