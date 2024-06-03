import Joi from "joi"

export const creatingAddressSchema = Joi.object({
    fullName:Joi.string().trim().min(4).max(32).required(),
    streetAddress:Joi.string().trim().min(4).max(62).required(),
    city:Joi.string().trim().min(3).max(32).required(),
    state:Joi.string().trim().min(4).max(32).required(),
    mobileNumber:Joi.string().trim().min(6).max(15).required(),
    pinCode:Joi.alternatives().try(
        Joi.string().trim().min(3).max(12),
    ).optional(),
})

export const updatingAddressSchema = Joi.object({
    fullName:Joi.alternatives().try(
        Joi.string().trim().min(4).max(32),
    ).optional(),
    streetAddress:Joi.alternatives().try(
        Joi.string().trim().min(4).max(62),
    ).optional(),
    city:Joi.alternatives().try(
        Joi.string().trim().min(3).max(32),
    ).optional(),
    state:Joi.alternatives().try(
        Joi.string().trim().min(4).max(32),
    ).optional(),
    mobileNumber:Joi.alternatives().try(
        Joi.string().trim().min(6).max(15),
    ).optional(),
    pinCode:Joi.alternatives().try(
        Joi.string().trim().min(3).max(12),
    ).optional()
})