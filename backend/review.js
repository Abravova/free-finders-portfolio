import mongoose from "mongoose";

export const ReviewSchema = new mongoose.Schema(
  {
    email: {
      type: String, 
      required: true,
    },
    reviewer_email: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    created_at: {
      type: Date,
      immutable: true,
      default: Date.now,
    },
  },
  { collection: "reviews" },
);