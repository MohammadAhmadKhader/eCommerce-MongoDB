import { IProductImage } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";

export function expectProductImageObj(imageObj : IProductImage){
    expect(typeof imageObj.imageUrl).toBe("string");
    expect(typeof imageObj.thumbnailUrl).toBe("string");
    expectId(imageObj._id);
} 