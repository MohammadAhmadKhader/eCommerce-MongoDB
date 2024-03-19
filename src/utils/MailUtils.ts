import dotenv from 'dotenv';
import nodeMailer from "nodemailer"
import SMTPTransport from 'nodemailer/lib/smtp-transport';
dotenv.config()

async function SendToResetPassword(userEmail:string,token:string){
    const transporter = nodeMailer.createTransport({
        host:process.env.EMAIL_HOST,
        post:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    } as SMTPTransport.Options)
    const message = {
        from:"Geekout Store",
        to:userEmail,
        subject:"Reset Password",
        html:`<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; color: #333;">Reset Password</h2>
            <p style="color: #666; font-size: 16px;">Click the button below to reset your password.</p>
            <div style="text-align: center;">
                <a href="${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 3px;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, you can ignore this email.</p>
        </div>
    </body>`
    }
    
    const msg = await transporter.sendMail(message);
}

async function SendMessage(email:string,fullName:string,usersMessage:string,subject:string){
    const transporter = nodeMailer.createTransport({
        host:process.env.EMAIL_HOST,
        post:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    } as SMTPTransport.Options)

    const message = {
        from:{
            name:fullName,
            address:email
        },
        to:"mohammadKhaderr1999@gmail.com",
        subject:`${subject}`,
        html:`<div style="max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #333;">Contact Us</h2>
        <div style="margin-bottom: 10px;">
            <p style="margin-bottom: 5px; color: #666;"><strong>Full Name:</strong> ${fullName}</p>
            <p style="margin-bottom: 5px; color: #666;"><strong>Email:</strong> ${email}</p>
            <p style="margin-bottom: 5px; color: #666;"><strong>Message:</strong></p>
            <p style="padding: 10px; background-color: #fff; border: 1px solid #ccc; border-radius: 4px; color: #333;">${usersMessage}</p>
        </div>
    </div>`
    }
    const msg = await transporter.sendMail(message);
}
const MailUtils = {
    SendToResetPassword,
    SendMessage
}

export default MailUtils