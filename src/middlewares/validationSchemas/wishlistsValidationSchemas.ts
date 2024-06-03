import Joi from "joi"

export const addToWishlistSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
})

export const removeFromWishlistSchema = Joi.object({
    wishlistItemId:Joi.string().hex().length(24).required(),
})