export function expectId(expectedId: any){
    expect(typeof expectedId).toBe("string");
    expect(expectedId.length).toBe(24);
}