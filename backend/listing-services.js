import mongoose from "mongoose";
import { ListingSchema } from "./listing.js";
import dotenv from "dotenv";
dotenv.config();

let dbConnection;

export function setConnection(newConn) {
  dbConnection = newConn;
  return dbConnection;
}

function getDbConnection() {
  if (!dbConnection) {
    dbConnection = mongoose.createConnection(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return dbConnection;
}

/**
 * creates a single new listing
 * @param {Object} listing
 * @param {string} listing.email
 * @param {string} listing.title
 * @param {string} listing.description
 * @param {string} listing.location
 * @param {string} listing.category
 * @param {string} listing.fileUrl
 * @returns {Promise<Listing?>}
 */
export async function createListing(listing) {
  //uses current model or new model
  const listingModel =
    // getDbConnection().models.Listing ||
    getDbConnection().model("Listing", ListingSchema);
  try {
    const listingToAdd = new listingModel(listing);
    const savedListing = await listingToAdd.save();
    return savedListing;
  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * gets all the listings in the database
 * @param {Object} search
 * @param {string} [search.keyword]
 * @param {string} [search.category]
 * @returns {Promise<Listing[]?>}
 */
export async function getListings({ keyword, category } = {}) {
  //uses current model or new model
  const listingModel =
    // getDbConnection().models.Listing ||
    getDbConnection().model("Listing", ListingSchema);

  const query = { available: true };
  if (keyword) {
    query.title = { $regex: keyword, $options: "i" };
  }
  if (category) {
    query.category = category;
  }

  const result = await listingModel.find(query).sort({ created_at: "desc" });
  return result;
}

/**
 * gets one listing based on id
 * @param {ObjectId} id
 * @returns {Promise<Listing?>}
 */
export async function getListing(id) {
  //uses current model or new model
  const listingModel =
    // getDbConnection().models.Listing ||
    getDbConnection().model("Listing", ListingSchema);
  try {
    let result = await listingModel.findById(id);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * gets all listings by a certain user
 * @param {string} email
 * @returns {Promise<Listing[]?>}
 */
export async function getUserListings(email) {
  //uses current model or new model
  const listingModel =
    // getDbConnection().models.Listing ||
    getDbConnection().model("Listing", ListingSchema);
  const result = await listingModel
    .find({ email: email })
    .sort({ created_at: "desc" });
  return result;
}

/**
 * updates a listing
 * @param {ObjectId} id
 * @param {Object} newListing
 * @param {string} newListing.title
 * @param {string} newListing.description
 * @param {string} newListing.location
 * @param {string} newListing.category
 * @param {string} newListing.fileUrl
 * @returns {Promise<Listing?>}
 */
export async function updateListing(id, newListing) {
  const listingModel = getDbConnection().model("Listing", ListingSchema);
  try {
    let updatedListing = await listingModel.findByIdAndUpdate(id, newListing, {
      new: true,
    });
    return updatedListing;
  } catch (error) {
    console.log(error);
    return false;
  }
}
