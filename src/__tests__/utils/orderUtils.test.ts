import { expectAddress } from "./addressUtils.test";

export function expectOrderItems(orderItem:any){
    expect(typeof orderItem.productId).toBe("string");
    expect(typeof orderItem._id).toBe("string");
    expect(orderItem.productId.length).toBe(24);
    expect(orderItem._id.length).toBe(24);
    expect(orderItem.quantity).toBeGreaterThanOrEqual(1);
    expect(orderItem.thumbnailUrl).toBeTruthy();
    expect(typeof orderItem.thumbnailUrl).toBe("string");
    expect(typeof orderItem.price).toBe("number");
    expect(typeof orderItem.subTotal).toBe("number");
}

export function expectOrder(order:any,expectedStatus = "all",options={checkAddress:true}){
    const mergedOptions = { ...options }
    const arrayOfStatus = ["Processing","Placed","Completed","Cancelled"];
    const arrayOfPaymentDetailsTypes = ["string","undefined"]
    expect(typeof order._id).toBe("string");
    expect(typeof order.userId).toBe("string");
    expect(order._id.length).toBe(24);
    expect(order.userId.length).toBe(24);
    expect(typeof order.discount).toBe("number");
    expect(typeof order.deliveryFee).toBe("number");
    expect(typeof order.grandTotal).toBe("number");
    expect(typeof order.isPaid).toBe("boolean");
    if(expectedStatus === "all"){
        expect(arrayOfStatus).toEqual(expect.arrayContaining([order.status]));
    }else{
        expect(order.status).toBe(expectedStatus)
    }
    expect(arrayOfPaymentDetailsTypes).toEqual(expect.arrayContaining([typeof order.paymentDetails]));
    expect(typeof order.createdAt).toBe("string");
    expect(typeof order.updatedAt).toBe("string");
    if(order.status !== "Placed"){
        if(mergedOptions.checkAddress){
            expectAddress(order.address);
        }
    }
    order.orderItems.forEach((orderItem : any)=>{
        expectOrderItems(orderItem)
    })
}