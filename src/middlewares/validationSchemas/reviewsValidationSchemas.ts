import Joi from "joi"

export const reviewSchema = Joi.object({
    rating:Joi.number().valid(1,2,3,4,5).required(),
    comment:Joi.string().trim().min(4).max(256).required()
})

export const editUserReviewSchema = Joi.object({
    rating:Joi.number().valid(1,2,3,4,5).required(),
    comment:Joi.string().trim().min(4).max(256).required(),
    reviewId:Joi.string().hex().length(24).required(),
})

export const deleteUserReviewSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
    reviewId:Joi.string().hex().length(24).required(),
})