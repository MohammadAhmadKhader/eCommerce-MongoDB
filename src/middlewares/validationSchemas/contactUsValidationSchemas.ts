import Joi from "joi"

export const sendingMessageSchema = Joi.object({
    fullName:Joi.string().trim().min(4).max(32).required(),
    email:Joi.string().trim().email().lowercase().min(6).max(64).required(),
    subject: Joi.string().trim().min(4).max(32),
    message: Joi.string().trim().min(4).max(256),
})