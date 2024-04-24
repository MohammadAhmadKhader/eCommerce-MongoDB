export function expectAddress(address:any){
    expect(typeof address.fullName).toBe("string");
    expect(typeof address.mobileNumber).toBe("string");
    expect(typeof address.state).toBe("string");
    if(address.pinCode){
        expect(typeof address.pinCode).toBe("string");
    }
    expect(typeof address.streetAddress).toBe("string");
}