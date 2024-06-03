import Joi from "joi"

export const addToCartSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
    quantity:Joi.number().min(1).integer().required()
})

export const deleteFromCartSchema = Joi.object({
    cartItemId:Joi.string().hex().length(24).required(),
})

export const changeCartItemQuantityByOneSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
    cartItemId:Joi.string().hex().length(24).required(),
    operation:Joi.string().valid("+1","-1").required()
})