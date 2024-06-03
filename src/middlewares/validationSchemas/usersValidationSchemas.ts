import Joi from "joi"
import { IUserChangeInformation } from "../../@types/types"

export const userRegistrationSchema = Joi.object({
    firstName:Joi.string().trim().alphanum().min(4).max(32).required(),
    lastName:Joi.string().trim().alphanum().min(4).max(32).required(),
    email:Joi.string().trim().email().lowercase().min(6).max(64).required(),
    password:Joi.string().min(6).max(24).required()
})

export const createUserSchema = userRegistrationSchema.append({
    role:Joi.string().valid("user","admin").required(),
})

export const userChangePasswordSchema = Joi.object({
    oldPassword:Joi.string().min(6).max(24).required(),
    newPassword:Joi.string().min(6).max(24).required(),
    confirmNewPassword:Joi.string().min(6).max(24).equal(Joi.ref("newPassword")).required().messages({"any.only":"Password Must Match"}),
})

export const userSignInSchema = Joi.object({
    email:Joi.string().trim().email().lowercase().min(6).max(64).required(),
    password:Joi.string().min(6).max(24).required()
})

export const resetPasswordViaCodeSchema = Joi.object({
    newPassword:Joi.string().min(6).max(24).required(),
    confirmedNewPassword:Joi.string().min(6).max(24).equal(Joi.ref("newPassword")).required().messages({"any.only":"Password Must Match"}),
})

export const forgotPasswordSchema = Joi.object({
    email:Joi.string().trim().email().lowercase().min(6).max(64).required(),
})

const atLeastOneFieldRequiredUserInfo = (value : IUserChangeInformation, helpers : Joi.CustomHelpers<IUserChangeInformation>) => {
    const { firstName, lastName, email, mobileNumber, birthdate } = value;
    const detailedErrorMessage = `: At least one of the following fields is required: 'firstName', 'lastName', 'email', 'mobileNumber', 'birthdate'`;
    if (!firstName && !lastName && !email && !mobileNumber && !birthdate) {
        throw new Error(detailedErrorMessage)
    }
};

export const userChangeInformationSchema = Joi.object({
    firstName:Joi.alternatives().try(
        Joi.string().trim().alphanum().min(4).max(32).required(),
    ).optional(), 
    lastName:Joi.alternatives().try(
        Joi.string().trim().alphanum().min(4).max(32).required(),
    ).optional(),
    email:Joi.alternatives().try(
        Joi.string().trim().email().lowercase().min(6).max(64).required(),
    ).optional(),
    mobileNumber:Joi.alternatives().try(
        Joi.string().trim().min(6).max(15),
    ).optional(),
    birthdate:Joi.alternatives().try(
        Joi.date().max(new Date(Date.now() - 157680000000 /**before 5 years */)).min(new Date(Date.now() - 2522880000000/**before 80 years */)).allow("")
    ).optional(),
}).custom(atLeastOneFieldRequiredUserInfo,"atLeastOneFieldRequired")
