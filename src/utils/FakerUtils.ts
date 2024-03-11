import { ObjectId } from 'mongodb';
import Category from '../models/category';
import { userRegistrationSchema } from './../middlewares/validationsSchemas';
import { faker } from '@faker-js/faker';
import User from '../models/user';
import Product from '../models/product';

function createRandomUser(){
    return {
        firstName:faker.person.firstName(),
        lastName:faker.person.lastName(),
        email:faker.internet.email(),
        password:faker.internet.password(),
        mobileNumber:faker.phone.number(),
        birthDay:faker.date.birthdate()
    }
}

function createRandomProduct(){
    const price = faker.commerce.price({min:20,max:130});
    const finalPrice = faker.commerce.price({min:Number(price),max:200})
    const quantity = faker.commerce.price({min:1,max:15})
    const randomNumber = faker.number.int({min:3,max:35});
    const reviews = []
    for(let i =0 ; i< randomNumber ; i++){
        const singleReview = {
            comment:faker.word.words(8),
            rating:faker.number.float({min:0.5,max:5,multipleOf:0.5}),
            createdAt:faker.date.recent(),
            updatedAt:faker.date.recent(),
        }
        reviews.push(singleReview)
    }
    
    return {
        name:faker.commerce.productName(),
        description:faker.commerce.productDescription(),
        brand:faker.helpers.arrayElement([`Levi's`,`Adidas`,`Casio`,`Calvin Klein`,`Nike`,`Biba`]),
        price,
        categoryId:faker.helpers.arrayElement([`65e7d89b62bb29693a0d1c58`,`65e7d89c62bb29693a0d1c5b`,`65e7d89c62bb29693a0d1c5d`,`65e7d89c62bb29693a0d1c5f`,`65e7d89c62bb29693a0d1c61`]),
        finalPrice,
        quantity,
        images:{
            thumbnailUrl:faker.image.urlPicsumPhotos(),
            imageUrl:faker.image.urlPicsumPhotos(),
        },
        reviews,
    }
}

function createRandomCart(){
    const cartItems : any = []
    const productsGroup = [
        '65e7e1fc99e7abd5de848f5d',
        '65e7e1fc99e7abd5de848f65',
        '65e7e1fc99e7abd5de848f79',
        '65e7e1fc99e7abd5de848f79',
        '65e7e1fc99e7abd5de848f9f',
        '65e7e1fc99e7abd5de848fac',
        '65e7e1fc99e7abd5de848fc2',
        '65e7e1fc99e7abd5de848fc8',
        '65e7e1fc99e7abd5de848fd1'
    ]

    const Iterations = faker.number.int({min:0,max:4});
    

    for(let i =0 ; i < Iterations ; i++){
        const quantity = faker.number.int({min:1,max:7});
        const randomIndex = faker.number.int({min:0,max:productsGroup.length - 1});
        
        cartItems.push({
            productId:productsGroup[randomIndex],
            quantity:quantity
        })
    }
    return {cartItems}
}

async function createReviews(){
    for(let i=0 ; i < 500 ; i++ ){
        const randomIndexForProducts = faker.number.int({min:0,max:allProducts.length - 1})
        const randomIndexForUsers =  faker.number.int({min:0,max:allUsers.length - 1})
        const rating = faker.number.int({min:1,max:5});
        const comment = faker.word.words(8)
        const randomUser = allUsers[randomIndexForUsers]._id
        const newReview = {
            rating,
            comment,
            userId:randomUser
        }
        const review = await Product.findOneAndUpdate(
            {_id:allProducts[randomIndexForProducts]},
            {$push : { reviews : newReview}}
        )
        console.log(`review # ${i + 1} was created successfully!`)
    }
}


async function createUsers(){
    for(let i=0 ; i < 100 ; i++ ){
        const password = faker.internet.password();
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email();
        const userImg=faker.image.urlPicsumPhotos()

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            userImg,
        })
        console.log(`User # ${i + 1} was created successfully!`)
    }
}

const fakerUtils = {
    createRandomUser,
    createRandomProduct,
    createRandomCart,
    createReviews,
    createUsers
}
export default fakerUtils;

// They were removed to hide data
const allProducts =[{}]
const allUsers = [{_id:1}]