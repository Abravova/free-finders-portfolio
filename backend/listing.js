import mongoose from "mongoose";

export const validCategories = ["Clothing & Accessories", "Sporting Goods", "Electronics", "Jewelry", "Home & Garden", "Collectibles & Art", "Other"];

export const ListingSchema = new mongoose.Schema(
  {
    email: {
      type: String, 
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 40,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: validCategories,
      default: "Other",
    },
    location: {
      type: String,
      trim: true,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: {
      type: Date,
      immutable: true,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "listings" },
);