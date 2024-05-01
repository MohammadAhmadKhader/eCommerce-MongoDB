import { IBrand } from './../../@types/types.d';
import { expectId } from './helperTestFunctions.test';
export function expectBrand(brand : IBrand){
    expect(typeof brand.imageUrl).toBe("string");
    expect(typeof brand.name).toBe("string");
    expect(brand.imageUrl.length).toBeGreaterThan(0);
    expect(brand.name.length).toBeGreaterThan(0);
    expectId(brand._id)
}