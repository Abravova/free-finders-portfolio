import mongoose from "mongoose";
import { UserSchema } from "./user.js";
import * as listingServices from "./listing-services.js";
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
 * creates a single new user
 * @param {Object} user
 * @param {string} user.password
 * @param {string} user.name
 * @param {string} user.email
 * @param {number} user.phone
 * @returns {Promise<User?>}
 */
export async function createUser(user) {
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const userToAdd = new userModel(user);
    const savedUser = await userToAdd.save();
    return savedUser;
  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * gets one user by email
 * @param {string} email
 * @param {boolean} withContactInfo
 * @returns {Promise<User?>}
 */
export async function getUser(email, withContactInfo = false) {
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const deselectedFields =
      "-password" + (withContactInfo ? "" : " -email -phone");

    // get user without password hash and optionally without contact info
    let result = await userModel
      .findOne({ email: email })
      .select(deselectedFields);

    if (!result) return null;

    // get listings for user
    const listings = await listingServices.getUserListings(email);

    result.listings = listings;

    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * gets all the users in the database
 * @returns {Promise<User[]?>}
 */
export async function getUsers() {
  const userModel =
    //  getDbConnection().models.User ||
    getDbConnection().model("User", UserSchema);
  let result = await userModel.find();
  return result;
}

/**
 * gets one user by ID
 * @param {string} id - the id of the user to retrieve
 * @returns {Promise<User?>}
 */
export async function getUserById(id) {
  const userModel = getDbConnection().model("User", UserSchema);

  try {
    if (!mongoose.isValidObjectId(id)) return null;
    return await userModel.findById(id);
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * update user's email to new email
 * @param {string} currentEmail - the current email
 * @param {string} newEmail - the email to change to
 * @returns {Promise<User?>} - The updated user object with new email
 */
/*
export async function changeUserEmail(currentEmail, newEmail) {
  const userModel = getDbConnection().model("User", UserSchema);

  try {
    const existingUser = await userModel.findOne({ email: newEmail });
    if (existingUser) {
      throw new Error("This email is already in user by another account");
    }
    const updateUser = await userModel.findOneAndUpdate(
      { email: currentEmail },
      { email: newEmail },
      { new: true, runValidators: true },
    );
    if (!updateUser) {
      throw new Error("User not found with the provided current email.");
    }

    return updateUser;
  } catch (error) {
    throw new Error(error.message);
  }
}
*/

/**
 * update user's name to new name
 * @param {string} currentEmail - the current email used for lookup
 * @param {string} newName - the name to change to
 * @returns {Promise<User?>} - The updated user object with new name
 */
export async function changeUserName(userEmail, newName) {
  const userModel = getDbConnection().model("User", UserSchema);

  try {
    const updateUser = await userModel.findOneAndUpdate(
      { email: userEmail },
      { name: newName },
      { new: true, runValidators: true },
    );

    return updateUser;
  } catch (error) {
    throw new Error(`Failed to update name: ${error.message}`);
  }
}

/**
 * update user's number to new number
 * @param {string} currentEmail - the current email used for lookup
 * @param {string} newPhone - the phone number to change to
 * @returns {Promise<User?>} - The updated user object with new number
 */
export async function changeUserPhone(userEmail, newPhone) {
  const userModel = getDbConnection().model("User", UserSchema);

  try {
    const updateUser = await userModel.findOneAndUpdate(
      { email: userEmail },
      { phone: newPhone },
      { new: true, runValidators: true },
    );

    return updateUser;
  } catch (error) {
    throw new Error(`Failed to update phone number: ${error.message}`);
  }
}

/**
 * update user's password (hashed) to new password (hashed)
 * @param {string} userId - the current id used for lookup
 * @param {string} newPasswordHashed - the password to change to
 * @returns {Promise<User?>} - The updated user object with new password
 */
export async function changeUserPassword(userId, newPasswordHashed) {
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const updateUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { password: newPasswordHashed },
      { new: true, runValidators: true },
    );

    return updateUser;
  } catch (error) {
    throw new Error(`Failed to update password: ${error.message}`);
  }
}

/**
 * update user's pfp to new link
 * @param {string} userId - the current id used for lookup
 * @param {string} pfpLink - the new pfp link to use
 * @returns {Promise<User?>} - The updated user object with new password
 */
export async function changeUserProfilePic(userId, pfpLink) {
  const userModel = getDbConnection().model("User", UserSchema);
  try {
    const updateUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { profilePicture: pfpLink },
      { new: true, runValidators: true },
    );

    return updateUser;
  } catch (error) {
    throw new Error(`Failed to update pfp: ${error.message}`);
  }
}
