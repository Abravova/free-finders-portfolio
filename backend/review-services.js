import mongoose from "mongoose";
import { ReviewSchema } from "./review.js";
import dotenv from "dotenv";
dotenv.config();

let dbConnection;

export function setConnection(newConn) {
    dbConnection = newConn;
    return dbConnection;
}

function getDbConnection() {
    if (!dbConnection) {
        dbConnection = mongoose.createConnection(process.env.MONGODB_URI)
    }
    return dbConnection;
}

/**
 * Create a new review
 * @param {Object} review
 * @param {string} review.email
 * @param {string} review.reviewer_email
 * @param {number} review.rating
 * @param {string} review.description
 * @returns {Promise<Review?>}
 */
export async function createReview(review) {
    const reviewModel = getDbConnection().model("Review", ReviewSchema);
    try {
        //check for existing review
        let existingReview = await reviewModel.findOne({ email : review.email, reviewer_email : review.reviewer_email });

        if (existingReview) return -1;

        //add new review
        const reviewToAdd = new reviewModel(review);
        const savedReview = await reviewToAdd.save();
        
        return savedReview;
    } catch (error) {
        console.log(error);
        return false;
    }
}

/** View all reviews by user
 * @param {string} email
 * @returns {Promise<Review[]?>}
 */
export async function getReviews(email) {
    const reviewModel = getDbConnection().model("Review", ReviewSchema);
    try {
        let result = await reviewModel.find({ email: email });
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}