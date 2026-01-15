import mongoose from "mongoose";
import { ReviewSchema } from "./review.js";
import * as reviewServices from "./review-services.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;
let conn;
let reviewModel;

// ------ setup -----------------------------------------------
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  conn = await mongoose.createConnection(uri, mongooseOpts);

  reviewModel = conn.model("Review", ReviewSchema);

  reviewServices.setConnection(conn);
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
  await mongoServer.stop();
});

beforeEach(async () => {
    let dummyReview = {
    _id: "a3b5f2c987d01456e9a23df7",
    email: "test@gmail.com",
    reviewer_email: "test1@gmail.com",
    rating: 5,
    description: "Great seller!",
    };

    let result = new reviewModel(dummyReview);
    await result.save();
});

afterEach(async () => {
    await reviewModel.deleteMany();
});

// ------ tests -----------------------------------------------
test("Create a new review -- success", async () => {
    let newReview = {
        email: "test2@gmail.com",
        reviewer_email: "test1@gmail.com",
        rating: 3,
        description: "Okay seller.",
    };
    const review = await reviewServices.createReview(newReview);
    expect(review).toBeDefined();
    expect(review.email).toBe(newReview.email);
    expect(review.reviewer_email).toBe(newReview.reviewer_email);
    expect(review.rating).toBe(newReview.rating);
    expect(review.description).toBe(newReview.description);
});

test("Create a new review -- existing review", async () => {
    let newReview = {
        email: "test@gmail.com",
        reviewer_email: "test1@gmail.com",
        rating: 5,
        description: "Great seller!",
    };
    const review = await reviewServices.createReview(newReview);
    expect(review).toBe(-1);
});

test("View all reviews by user", async () => {
    const reviews = await reviewServices.getReviews("test@gmail.com");
    expect(reviews).toBeDefined();
    expect(reviews.length).toBe(1);
});

test("View all reviews by user -- no reviews", async () => {
    const reviews = await reviewServices.getReviews("test4@gmail.com");
    expect(reviews).toBeDefined();
    expect(reviews.length).toBe(0);
});

/*
test("Connection is null for getReview", () => {
    reviewServices.setConnection(null);
    const result = reviewServices.getReviews("test@gmail.com");
    expect(result).toBeDefined();
});
*/