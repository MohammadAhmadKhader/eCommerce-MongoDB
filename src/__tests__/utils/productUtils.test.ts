import { IProduct, IProductImage, IUser } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";

export function expectProductImageObj(imageObj : IProductImage){
    expect(typeof imageObj.imageUrl).toBe("string");
    expect(typeof imageObj.thumbnailUrl).toBe("string");
    expectId(imageObj._id);
} 

export function expectProduct(product : IProduct){
    expect(typeof product.name).toBe("string");
    expect(typeof product.description).toBe("string");
    expect(typeof product.price).toBe("number");
    expect(typeof product.finalPrice).toBe("number");
    expect(typeof product.offer).toBe("number");
    expect(product.quantity).toBeGreaterThanOrEqual(1);
    expect(typeof product.quantity).toBe("number");
    expect(typeof product.brand).toBe("string");
    expect(product.images.length).toBeGreaterThanOrEqual(1)
    product.images.forEach((imageObj)=>{
        expectProductImageObj(imageObj)
    })
}

export function expectProductReview(productRev :any){
    const expectedRatingValues = [1,2,3,4,5];
    expectId(productRev._id);
    expect(typeof productRev.comment).toBe("string");
    expect(typeof productRev.rating).toBe("number");
    expect(expectedRatingValues).toEqual(expect.arrayContaining([productRev.rating]))
    expect(typeof productRev.createdAt).toBe("string");
    expect(typeof productRev.updatedAt).toBe("string");
    expect(productRev.user).toBeDefined();
    expectUserProductReview(productRev.user);
}

export function expectUserProductReview(user :IUser){
    expect(user._id).toBeTruthy();
    expect(user.firstName).toBeTruthy();
    expect(user.lastName).toBeTruthy();
    expect(user.userImg).toBeTruthy();
    expect(user.email).toBeTruthy();
    expect(user.role).toBeTruthy();
    expect(user.password).toBeUndefined();
    expect(user.mobileNumber).toBeUndefined();
    expect(user.wishList).toBeUndefined();
    expect(user.addresses).toBeUndefined();
    expect(user.cart).toBeUndefined();
}