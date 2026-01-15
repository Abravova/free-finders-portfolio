import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserSchema } from "./user.js";
import sgMail from "@sendgrid/mail";
dotenv.config();

// Base URL for email verification
const FRONTEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://gray-stone-0dfbef11e.4.azurestaticapps.net";

// Email service setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Database connection setup
let dbConnection;
function getDbConnection() {
  if (!dbConnection) {
    dbConnection = mongoose.createConnection(process.env.MONGODB_URI);
  }
  return dbConnection;
}

/**
 * sends a verification email
 * @param {string} req.email
 * @param {string} req.name
 * @param {string} req.password
 * @param {number} req.phone
 * @returns {JSON} success and message
 */
export async function verifyEmail(req, res) {
  const userModel = getDbConnection().model("User", UserSchema);
  let { email, name, password, phone } = req.body;
  let userExists;

  console.log(req.body);

  try {
    console.log(email, name, password, phone);

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    password = hashedPassword;

    //check if user already exists
    userExists = await userModel.findOne({ email: email });
  } catch (error) {
    console.log(error);
    return res.status(500).send("An error occurred in the server.");
  }

  if (!name || !password || !email) {
    res.status(400).send("Bad request: Invalid input data.");
  } else if (userExists) {
    res.status(409).send(" Email already taken");
  } else {
    try {
      //create jwt email verification token
      const verificationToken = jwt.sign(
        { email, name, password, phone },
        process.env.EMAIL_SECRET,
        { expiresIn: "1h" },
      );
      const verificationLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

      //send verification email
      const msg ={
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        text: `Click the link to verify your email(expires in 1 hour): ${verificationLink}`,
        html: `<p>Click the link to verify your email(expires in 1 hour):</p>
                <a href="${verificationLink}" style = "display: inline-block; 
                padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; 
                text-decoration: none; border-radius: 5px;">Verify Email</a>`,
      };
      await sgMail.send(msg);

      return res.status(200).send("Verification email sent!");
    } catch (error) {
      console.log(error);
      res.status(500).send("Failed to send email.");
    }
  }
}

/**
 * verify the users email and create user in db before sending auth token
 * @param {String} req.query.token // the email verification token
 * @returns {Token} // JWT auth token
 */
export async function registerUser(req, res) {
  const userModel = getDbConnection().model("User", UserSchema);
  const { token } = req.query;
  let userId;

  if (!token) {
    return res.status(400).send("Bad request: No token provided.");
  }

  let decoded;
  try {
    //verify the token
    decoded = jwt.verify(token, process.env.EMAIL_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(401).send("Unauthorized: Invalid token.");
  }

  const { email, name, password, phone } = decoded;
  if (!email || !name || !password) {
    return res.status(401).send("Unauthorized: Invalid token.");
  }

  try {
    //check if user already exists
    const userExists = await userModel.findOne({ email: email });
    if (userExists) {
      return res.status(409).send("Email already taken.");
    }

    //create user in db
    const userToAdd = new userModel({ email, name, password, phone });
    await userToAdd.save();
    userId = userToAdd._id.toString();
    console.log("user to add: " + userId);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Unable to create user.");
  }

  try {
    //generate JWT token for auth
    const authToken = await generateAccessToken(email, userId);
    console.log("Auth token:", authToken);

    //send the auth token in the response
    res.status(201).send({ token: authToken });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred in the server.");
  }
}

function generateAccessToken(username, userId) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { email: username, id: userId },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      },
    );
  });
}

// require authenticated user
export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  //Getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token received");
    res.status(401).send("Unauthorized: No token provided");
  } else {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
      if (decoded) {
        // attach email from token payload to req.user for ease of use
        req.user = { email: decoded.email, id: decoded.id };
        next();
      } else {
        console.log("JWT error:", error);
        res.status(401).send("Unauthorized: Invalid token");
      }
    });
  }
}

// allow unauthenticated, but give access to user if token is provided
export function attachUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  //Getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
      if (decoded) {
        // attach email from token payload to req.user for ease of use
        req.user = { email: decoded.email, id: decoded.id };
      }
    });
  }

  next();
}

/**
 * login a user
 * @param {string} req.password
 * @param {string} req.email
 * @returns {Token}
 */
export async function loginUser(req, res) {
  const user = req.body;
  const userModel = getDbConnection().model("User", UserSchema);
  const retrievedUser = await userModel.findOne({ email: user.email });

  if (!user.password || !user.email) {
    res.status(400).send("Bad request: Invalid input data.");
  } else if (!retrievedUser) {
    // invalid email
    res.status(401).send("Unauthorized: no user with that email");
  } else {
    bcrypt
      .compare(user.password, retrievedUser.password)
      .then((matched) => {
        if (matched) {
          generateAccessToken(user.email, retrievedUser._id).then((token) => {
            res.status(200).send({ token: token });
          });
        } else {
          // invalid password
          res.status(401).send("Unauthorized: invalid password");
        }
      })
      .catch(() => {
        res.status(401).send("Unauthorized");
      });
  }
}

/**
 * decode user id from token
 * @param {string} token
 * @returns {Number} user_id
 */
export function decodeUserId(token) {
  return jwt.decode(token);
}

/**
 * Check to see if password matches user's password
 * @param {string} enteredPassword
 * @param {string} passwordDB - current password in db
 * @returns {Boolean} - valid or invalid
 */
export async function verifyUserPassword(enteredPassword, passwordDB) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, passwordDB);

    if (!isMatch) {
      throw new Error("wrong password");
    }

    return isMatch;
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

/**
 * encrypt password
 * @param {string} password
 * @returns {string} hashedPassword
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}
