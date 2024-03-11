import crypto from 'crypto';
import dotenv from 'dotenv';
import nodeMailer from "nodemailer"
import ResetPassCode from '../models/resetPassCode';
dotenv.config()

const Email = process.env.Email 
const Secret = process.env.Secret

async function SendToResetPassword(userEmail : string,userId : string){
    const code = crypto.randomUUID().substring(0,8);
    await ResetPassCode.create({
        userId,
        code:code
    })
    const transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        service:"gmail",
        port: 587,
        secure:false,
        auth: {
            user: Email,
            pass: Secret
        }
    });
    const message = {
        from:{
            name:"Geekout",
            address:Email as string
        },
        to:userEmail as string,
        subject:"Reset Password",
        html:`<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #333;">Reset Password</h2>
            <p style="color: #666; font-size: 16px;">Your verification code is: <strong style="color: #007bff;">${code}</strong></p>
            <p style="color: #666; font-size: 16px;">Click the button below to reset your password.</p>
            <div style="text-align: center;">
                <a href="https://example.com/reset-password/token123" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 3px;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, you can ignore this email.</p>
        </div>
    </body>`
    }
    
    const msg = await transporter.sendMail(message);
    console.log(msg)
}

const MailUtils = {
    SendToResetPassword,
}

export default MailUtils