import express from "express";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import path from "path";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

import * as listingServices from "./listing-services.js";
import * as userServices from "./user-services.js";
import {
  registerUser,
  verifyEmail,
  loginUser,
  authenticateUser,
  verifyUserPassword,
  hashPassword,
  attachUser,
} from "./auth.js";
import { validCategories } from "./listing.js";
import * as reviewServices from "./review-services.js";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."),
      false,
    );
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

function generateRandom10DigitId() {
  return Math.floor(1000000000 + Math.random() * 9000000000);
}

// upload picture
app.post(
  "/api/upload",
  authenticateUser,
  upload.single("image"),
  async (req, res) => {
    console.log("req.body ", req.body);
    console.log("req.file ", req.file);

    const fileName = +generateRandom10DigitId() + "-" + req.file.originalname;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    const fileUrl =
      "https://csc308--freefinder.s3.us-west-1.amazonaws.com/" +
      fileName.replace(/\s/g, "+");

    try {
      await s3.send(command);
      res.status(200).json({
        message: "File uploaded successfully!",
        fileName: fileName,
        imageLink: fileUrl,
      });
    } catch (error) {
      console.error("Error uploading to S3:", error);
      res.status(500).json({ message: `File upload failed: ${error}` });
    }
  },
);

// upload profile picture
app.post(
  "/api/upload-pfp",
  authenticateUser,
  upload.single("image"),
  async (req, res) => {
    console.log("req.body ", req.body);
    console.log("req.file ", req.file);

    const fileType = path.extname(req.file.originalname);
    const userId = req.user.id;

    const fileName = userId + "-pfp" + fileType;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    const fileUrl =
      "https://csc308--freefinder.s3.us-west-1.amazonaws.com/" +
      fileName.replace(/\s/g, "+");

    try {
      await s3.send(command);
      res.status(200).json({
        message: "File uploaded successfully!",
        fileName: fileName,
        imageLink: fileUrl,
      });
    } catch (error) {
      console.error("Error uploading to S3:", error);
      res.status(500).json({ message: "File upload failed." });
    }
  },
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

//--------------- listing -------------------------------------

/**
 * create a listing
 * @param {string} req.title
 * @param {string} req.description
 * @param {string} req.location
 * @param {string} req.category
 * @param {string} req.fileUrl
 * @param {string} req.header.authorization // token
 * @returns {Promise<Listing?>} the saved listing
 */
app.post("/listing", authenticateUser, async (req, res) => {
  const listing = req.body;

  // decode email from token
  const authHeader = req.headers["authorization"];
  // getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];

  // get email from payload
  listing.email = jwt.decode(token).email;
  console.log(listing);
  if (!listing || !listing.email) res.status(500).end();

  const savedListing = await listingServices.createListing(listing);
  if (savedListing) res.status(201).send(savedListing);
  else res.status(500).end();
});

/**
 * get listing by id
 * @param {ObjectId} req.id
 * @returns {Promise<Listing?>}
 */
app.get("/listing/:id", attachUser, async (req, res) => {
  try {
    const listing = await listingServices.getListing(req.params.id);

    const isAuthor = req.user?.email === listing.email;

    //check for not found
    if (listing === undefined || listing === null) {
      res.status(404).send("Unable to find the listing with that id.");
    } else {
      res.send({ ...listing.toObject(), isAuthor });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
});

/**
 * get all listings in db by category or keyword or nothing
 * @param {Object} req
 * @param {String} req.query.category -optional
 * -must use encodeURIComponent() to send query to have & or spaces in categories
 * -would look like: `http://localhost:8000/listings?category=${encodeURIComponent(category)}`
 * @param {String} req.query.keyword -optional
 * @returns {Promise<Listing[]?>}
 */
app.get("/listings", async (req, res) => {
  let category = req.query.category;
  let keyword = req.query.keyword;

  if (category && !validCategories.includes(category)) {
    res.status(400).send("Bad request: Invalid input data.");
    return;
  }

  try {
    const result = await listingServices.getListings({ keyword, category });
    res.send({ listings: result });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
});

/**
 * update a listing by id
 * @param {ObjectId} req.params.id
 * @param {string} req.title
 * @param {string} req.description
 * @param {string} req.location
 * @param {string} req.category
 * @param {string} req.fileUrl
 * @param {string} req.header.authorization // token
 * @returns {Promise<Listing?>} the updated listing
 */
app.patch("/listing/:id", authenticateUser, async (req, res) => {
  const listing = req.body;
  const id = req.params.id;

  // decode email from token
  const authHeader = req.headers["authorization"];
  // getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];
  // get email from payload
  const email = jwt.decode(token).email;
  if (!listing || !email) res.status(500).end();

  try {
    // confirm that the listing belongs to the user
    const userListing = await listingServices.getListing(id);
    console.log("userListing: ", userListing);
    if (userListing.email !== email) {
      res.status(401).send("Unauthorized: Listing does not belong to user.");
    } else {
      // update the updated_at field
      listing.updated_at = Date.now();

      const updatedListing = await listingServices.updateListing(id, listing);
      if (updatedListing) res.status(200).send(updatedListing);
      else res.status(500).end();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
});

//------------ user -------------------------------------------

/**
 * get current user info
 * @param {Token}
 * @returns {Promise<User?>}
 */
app.get("/user/me", authenticateUser, async (req, res) => {
  try {
    const email = req.user.email;
    console.log("User Email from Token:", email);

    const user = await userServices.getUser(email, true);
    //check for not found
    if (user === undefined || user === null) {
      res.status(404).send("Unable to find the user with that email.");
    } else {
      res.send(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
});

/**
 * get all users in db
 * @returns {Promise<User[]?>}
 */
app.get("/users", async (req, res) => {
  try {
    const result = await userServices.getUsers();
    res.send({ users: result });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
});

/**
 * get user by email
 * @param {string} req.params.email
 * @returns {Promise<User?>}
 */
app.get("/user/:email", attachUser, async (req, res) => {
  try {
    const isLoggedIn = !!req.user;
    const user = await userServices.getUser(req.params.email, isLoggedIn);

    //check for not found
    if (user === undefined || user === null) {
      res.status(404).send("Unable to find the user with that email.");
    } else {
      res.send(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
});

/**
 * update user's email to new email
 * @param {string} req.body.newEmail - the email to change to
 * @returns {Promise<User?>} - the updated user object with new email
 */
/*
app.post("/user/update-email", authenticateUser, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const newEmail = req.body.newEmail;

    // should probably add another check to verify email format (to be done later)
    if (!userEmail || !newEmail) {
      return res
        .status(400)
        .json({ message: "Both current and new email are required." });
    }

    const updatedUser = await userServices.changeUserEmail(userEmail, newEmail);

    res.status(200).json({
      message: "Email updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});
*/

/**
 * update user's name to new name
 * @param {string} req.body.newName - the name to change
 * @returns {Promise<User?>} - the updated user object with new name
 */
app.post("/user/update-name", authenticateUser, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const newName = req.body.newName;

    if (!userEmail || !newName) {
      return res
        .status(400)
        .json({ message: "Both current email and new name are required." });
    }

    const updatedUser = await userServices.changeUserName(userEmail, newName);

    res.status(200).json({
      message: "Name updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * update user's phone to new phone number
 * @param {string} req.body.newPhone- the phone number to change to
 * @returns {Promise<User?>} - the updated user object with new phone number
 */
app.post("/user/update-phone", authenticateUser, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const newPhone = req.body.newPhone;

    if (!userEmail || !newPhone) {
      return res.status(400).json({
        message: "Both current email and new phone number are required.",
      });
    }

    const updatedUser = await userServices.changeUserPhone(userEmail, newPhone);

    res.status(200).json({
      message: "Phone number updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * update user's pfp to new pfp
 * @param {string} req.body.newLink- the phone number to change to
 * @returns {Promise<User?>} - the updated user object with new phone number
 */
app.post("/user/update-pfp", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const newPfp = req.body.newLink;

    if (!userId || !newPfp) {
      return res.status(400).json({
        message: "Both current email and link to pfp are required.",
      });
    }

    const updatedUser = await userServices.changeUserProfilePic(userId, newPfp);

    res.status(200).json({
      message: "Pfp updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * update user's password to new password
 * @param {string} req.body.password - the old password to verify
 * @param {string} req.body.newPassword - the new password to change to
 * @returns {Promise<User?>} - the updated user object with password (hashed)
 */
app.post("/user/update-password", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("User ID: " + req.user.id);
    const user = await userServices.getUserById(userId);
    console.log("Email: " + userId + req.body.newPassword);
    // checking to see the user knows their old password
    await verifyUserPassword(req.body.password, user.password); // if not valid will throw error

    const newPasswordHashed = await hashPassword(req.body.newPassword);

    if (!userId || !newPasswordHashed) {
      console.log("need both email and new password");
      return res.status(400).json({
        message: "Both current email and new password are required.",
      });
    }

    const updatedUser = await userServices.changeUserPassword(
      userId,
      newPasswordHashed,
    );

    res.status(200).json({
      message: "Password updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.log("Other Error : " + err);
    res.status(400).json({ message: err.message });
  }
});

//------------ auth -------------------------------------------
/**
 * sends a verification email to the user
 * @param {string} req.body.email
 * @param {string} req.body.name
 * @param {string} req.body.password //unhashed password
 * @param {number} req.body.phone
 * @returns {JSON} success and message
 */
app.post("/signup", verifyEmail);

/**
 * verify a user's email and create a user
 * @param {string} req.query.token // email verification token
 * @returns {Token} auth token
 */
app.post("/create-user", registerUser);

/**
 * login a user
 * @param {string} req.email
 * @param {string} req.password //unhashed password
 * @returns {Token}
 */
app.post("/login", loginUser);

//------------ review -------------------------------------------
/**
 * create a review for a user
 * @param {string} req.body.email // email of the user being reviewed
 * @param {number} req.body.rating // 1-5
 * @param {string} req.body.description
 * @param {string} req.headers.authorization // token
 * @returns {Promise<Review?>}
 */
app.post("/review", authenticateUser, async (req, res) => {
  const review = req.body;

  // check if user exists
  const user = await userServices.getUser(review.email);
  if (!user) return res.status(404).send("User not found.");

  // decode email from token
  const authHeader = req.headers["authorization"];
  // getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];

  // get email from payload
  review.reviewer_email = jwt.decode(token).email;
  console.log(review);
  if (!review || !review.reviewer_email) res.status(400).send("Bad request.");

  // check if user is trying to review themselves
  if (review.reviewer_email === review.email) {
    return res.status(400).send("Cannot review yourself.");
  }

  const savedReview = await reviewServices.createReview(review);
  if (savedReview === -1) res.status(409).send("Review already exists.");
  else if (savedReview) res.status(201).send(savedReview);
  else res.status(500).end();
});

/**
 * get all reviews for a user and average rating
 * @param {string} req.params.email
 * @returns {Object} res
 * @returns {Promise<Review[]?>} res.reviews -> all reviews for the user
 * @returns {Number} res.rating -> average rating for the user
 */
app.get("/reviews/:email", async (req, res) => {
  let email = req.params.email;
  try {
    // check if user exists
    const user = await userServices.getUser(email);
    if (!user) return res.status(404).send("User not found.");

    const reviews = await reviewServices.getReviews(email);
    console.log(reviews);

    let rating = 0;
    reviews.forEach((review) => {
      rating += review.rating;
    });
    rating = rating / reviews.length;
    res.send({ reviews: reviews, rating: rating });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
});
