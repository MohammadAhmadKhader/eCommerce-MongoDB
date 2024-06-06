import Joi from "joi"

export const tokenIdSchema = Joi.object({
    tokenId:Joi.string().regex(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
      ).message("Invalid token format").required(),
})