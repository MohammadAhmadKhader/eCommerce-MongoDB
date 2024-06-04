import { IInvoice, IOrder, IProduct, IReview, ISingleProduct, IUser, allowedFields } from "../@types/types"
import { SortFieldsOptions } from "./HelperFunctions"

export const allowedUserProductsFields : allowedFields<IProduct> | {}= {
    price_lte:{},
    price_gte:{},
    brand:{},
    category:{},
    quantity:{
        fixedCheck:"gte",
        fixedValue:1
    },
    offer:{
        fixedCheck:"gt",
        fixedValue:0
    },
    description:{},
    name:{},
    search:{}
}
export const sortFieldsUserProducts : SortFieldsOptions<ISingleProduct>[] = [
    {fieldInQuery:"price",fieldInDb:"finalPrice"},
    {fieldInQuery:"newArrivals",fieldInDb:"createdAt"},
    {fieldInQuery:"ratings",fieldInDb:"avgRating"},
    {fieldInQuery:"ratingNumbers",fieldInDb:"ratingNumbers"}
]

export const sortFieldsAdminInvoices : SortFieldsOptions<IInvoice>[]= [
    {fieldInDb:"subTotal",fieldInQuery:"subTotal",allowedDir:"both"},
    {fieldInDb:"grandTotal",fieldInQuery:"grandTotal",allowedDir:"both"},
]

export const allowedValuesForAdminOrders : allowedFields<IOrder> | {} = {
    isPaid:{},
    subTotal:{},
    email:{},
    grandTotal_lte:{
        
    } as allowedFields<IOrder>["grandTotal"],
    grandTotal_gte:{
        
    } as allowedFields<IOrder>["grandTotal"],
    subTotal_lte:{
        
    } as allowedFields<IOrder>["subTotal"],
    subTotal_gte:{
        
    } as allowedFields<IOrder>["subTotal"],
}

export const allowedValuesForAdminInvoices : allowedFields<IInvoice> | {} = {
    isPaid:{},
    subTotal:{},
    email:{},
    grandTotal_lte:{
        
    } as allowedFields<IInvoice>["grandTotal"],
    grandTotal_gte:{
        
    } as allowedFields<IInvoice>["grandTotal"],
    subTotal_lte:{
        
    } as allowedFields<IInvoice>["subTotal"],
    subTotal_gte:{
        
    } as allowedFields<IInvoice>["subTotal"],

}

export const allowedValuesForAdminReviews: allowedFields<IReview> | {} = {
    rating:{},
    createdAt:{},
    comment:{},
    email:{}
}

export const allowedValuesForAdminUsers :allowedFields<IUser> = {
    email:{},
    firstName:{},
    mobileNumber:{},
    lastName:{},
}