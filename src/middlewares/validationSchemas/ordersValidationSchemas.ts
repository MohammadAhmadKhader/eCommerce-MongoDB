import Joi from "joi"
import { creatingAddressSchema } from "./addressesValidationSchemas"

export const createOrderSchema = Joi.object({
    orderId:Joi.string().hex().length(24).required(),
    address:creatingAddressSchema.required(),
})

export const orderIdSchema = Joi.object({
    orderId:Joi.string().hex().length(24).required(),
})

export const ordersStatusSchema = Joi.object({
    status:Joi.string().valid("Completed","Processing","Cancelled","Placed").required(),
})