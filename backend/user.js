import mongoose from "mongoose";
import { ListingSchema } from "./listing.js";

export const UserSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      default: null,
    },
    listings: {
      type: [ListingSchema],
      default: [],
    },
    profilePicture: {
      type: String,
      default:
        "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg",
    },
  },
  { collection: "users" },
);
