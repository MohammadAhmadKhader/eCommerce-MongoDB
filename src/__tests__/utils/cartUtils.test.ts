import { ICartItem, IProduct } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";

export function expectUnpopulatedCart(cartItem : ICartItem){
    expectId(cartItem._id);
    expectId(cartItem.productId);
    expect(typeof cartItem.quantity).toBe("number");
    expect(cartItem.quantity).toBeGreaterThanOrEqual(1);
}

export function expectPopulatedCartItems(product : IProduct){
    expectId(product._id);
    expect(typeof product.name).toBe("string");
    expect(typeof product.offer).toBe("number");
    expect(typeof product.price).toBe("number");
    expect(typeof product.finalPrice).toBe("number");
    expect(typeof product.quantity).toBe("number");
    expect(typeof product.brand).toBe("string");
    product.images.forEach((imagesItem : any)=>{
        expect(typeof imagesItem.imageUrl).toBe("string")
        expect(typeof imagesItem.thumbnailUrl).toBe("string")
        expectId(imagesItem._id)
    })
}