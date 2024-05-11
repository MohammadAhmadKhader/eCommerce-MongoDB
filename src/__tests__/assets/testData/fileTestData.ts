import { faker } from "@faker-js/faker"
import { stringWith4Char } from "./stringTestData"

export const correctImageObj = {
    fieldname:"name",
    originalname:"name",
    buffer:faker.string.binary(),
    encoding: "7bit",
    mimetype: faker.system.mimeType(),
    size: faker.number.int({min:0,max:1000}),
}

export const emptyImageObj = {
    fieldname:"",
    originalname:"",
    encoding: "",
    mimetype: "",
}

export const wrongDataTypesImage = {
    fieldname:Math.random(),
    originalname:Math.random(),
    encoding:Math.random(),
    mimetype: Math.random(),
    size:stringWith4Char,
    buffer:faker.string.alpha(),
}