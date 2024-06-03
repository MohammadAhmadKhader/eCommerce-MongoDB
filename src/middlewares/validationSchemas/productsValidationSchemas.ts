import Joi from "joi";
import { fileImageSchema } from "./sharedValidationSchemas";

export const createProductSchema = Joi.object({
    name:Joi.string().trim().min(3).max(100).required(),
    description:Joi.string().trim().min(10).max(1024).required(),
    categoryId:Joi.string().hex().length(24).required(),
    offer:Joi.number().min(0.00).max(1.00),
    price:Joi.number().min(0).max(1000).required(),
    finalPrice:Joi.number().min(0).max(1000),
    quantity:Joi.number().integer().min(0),
    brand:Joi.string().trim().min(1).max(32).required(),
}).when(
    Joi.object({ offer: Joi.number().valid(0) }), {
      then: Joi.object({
        price: Joi.number().valid(Joi.ref('finalPrice')).required(),
      }),
    }
);

export const updateProductSchema = Joi.object({
    name:Joi.string().trim().min(3).max(100),
    description:Joi.string().trim().min(10).max(1024),
    categoryId:Joi.string().hex().length(24),
    offer:Joi.number().min(0.00).max(1.00),
    price:Joi.number().min(0).max(1000),
    finalPrice:Joi.number().min(0).max(1000),
    quantity:Joi.number().integer().min(0),
    brand:Joi.string().trim().min(1).max(32),
}).when(
    Joi.object({ offer: Joi.number().valid(0) }), {
      then: Joi.object({
        price: Joi.number().valid(Joi.ref('finalPrice')).required(),
      }).required(),
    }
)

export const updateProductSingleImageSchema = Joi.object({
    image:fileImageSchema.required(),
    imageId:Joi.string().hex().length(24).required(),
})

export const appendImagesToProductSchema = Joi.object({
    imagesLength:Joi.number().integer().min(1).max(9).required().messages({
        'number.base': 'Images were not sent',
        'number.min': 'At least one image must be provided',
        'number.max': 'Maximum of 9 images allowed',
        'any.required': 'Images were not sent'
    }),
})

