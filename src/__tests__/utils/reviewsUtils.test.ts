export const expectReview = (review : any,userId:string)=>{
    const expectedRatings = [1,2,3,4,5]
    expect(typeof review.comment).toBe("string");
    expect(review.userId).toBe(userId);
    expect(expectedRatings).toEqual(expect.arrayContaining([review.rating]));
    expect(typeof review.createdAt).toBe("string");
    expect(typeof review.updatedAt).toBe("string");
    expect(typeof review._id).toBe("string");
    expect(review.createdAt.length).toBe(24);
    expect(review.updatedAt.length).toBe(24);
    expect(review._id.length).toBe(24);
}