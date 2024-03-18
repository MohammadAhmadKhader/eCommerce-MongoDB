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
    console.log(msg)
}

const MailUtils = {
    SendToResetPassword,
}

export default MailUtils