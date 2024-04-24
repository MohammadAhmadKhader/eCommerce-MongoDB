import Stripe from "stripe";
import { IOrder, IUser } from "../@types/types";
function createStripe(){
    const stripe = new Stripe(process.env.STRIPE_SECRET as string);
    return stripe as Stripe;
}

async function searchCustomer(customerId:string,stripe : Stripe){
    let customer : Stripe.Response<Stripe.ApiSearchResult<Stripe.Customer>> = await stripe.customers.search({
        query:`metadata[\'customerId\']:\'${customerId}\'`
    })
    return customer as Stripe.Response<Stripe.ApiSearchResult<Stripe.Customer>>;
}

async function searchCustomerCreateOneIfDoesNotExist(customerId:string,stripe : Stripe,user:IUser){
    let hasCreatedNewCustomer = false;
    let newCustomer;
    const customer = await searchCustomer(customerId,stripe);
    if(customer.data.length == 0){
        const createdCustomer = await stripe.customers.create({
            email:user.email,
            metadata:{
                customerId:user._id as unknown as string
            }
        });
        hasCreatedNewCustomer = true;
        newCustomer = createdCustomer;
    }

    if(hasCreatedNewCustomer){
        return newCustomer as Stripe.Customer;
    }
    return customer.data[0] as Stripe.Customer;
}

async function createInvoice(customer : Stripe.Customer,stripe:Stripe){
    const invoice = await stripe.invoices.create({
        currency:"usd",
        customer:customer.id,
        collection_method:"charge_automatically",
    })
    return invoice as Stripe.Response<Stripe.Invoice>;
}

async function createInvoiceItems(customer : Stripe.Customer,invoice : Stripe.Invoice,order:IOrder,stripe:Stripe){
    for(let i =0; i < order.orderItems.length ;i++){
        const invoiceItems = await stripe.invoiceItems.create({
            customer:customer.id,
            invoice:invoice.id,
            quantity:order.orderItems[i].quantity as number,
            unit_amount:Number((order.orderItems[i].price! * 100).toFixed(0)),
            description:`
            || Product name : ${order.orderItems[i].name}
            || Product image link : ${order.orderItems[i].thumbnailUrl}
            || Product price after offer if exists : ${order.orderItems[i].price}
            `,
            metadata:{
                productId:order.orderItems[i].productId!.toString()
            }
        })
    }
}

const StripeUtils = {
    createStripe,
    searchCustomer,
    searchCustomerCreateOneIfDoesNotExist,
    createInvoice,
    createInvoiceItems
}

export default StripeUtils