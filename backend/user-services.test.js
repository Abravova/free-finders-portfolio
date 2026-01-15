import mongoose from "mongoose";
import { UserSchema } from "./user.js";
import * as userServices from "./user-services.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;
let conn;
let userModel;

// ------ setup -----------------------------------------------
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  conn = await mongoose.createConnection(uri, mongooseOpts);

  userModel = conn.model("User", UserSchema);

  userServices.setConnection(conn);
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  let dummyUser = {
    _id: "a3b5f2c987d01456e9a23df7",
    email: "test@gmail.com",
    name: "test",
    password: "123456abcd",
    phone: 1234356789,
  };
  let result = new userModel(dummyUser);
  await result.save();
});

afterEach(async () => {
  await userModel.deleteMany();
});

// ------ tests -----------------------------------------------
test("Fetch all users", async () => {
  const users = await userServices.getUsers();
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
});

test("Fetch user by id", async () => {
  const test_user = await userModel.findOne({ name: "test" });

  if (test_user) {
    const id = test_user._id;
    const user = await userServices.getUserById(id);
    expect(user).toBeDefined();
    expect(user.name).toBe(test_user.name);
  }
});

test("Fetch user by id -- invalid id format", async () => {
  const id = "123";
  const user = await userServices.getUserById(id);
  expect(user).toBeFalsy();
});

test("Add user -- successful", async () => {
  const dummyUser = {
    email: "test1@gmail.com",
    name: "test1",
    password: "123456abcd",
    phone: 1234356789,
  };
  const result = await userServices.createUser(dummyUser);
  expect(result).toBeTruthy();
  expect(result.name).toBe(dummyUser.name);
  expect(result.email).toBe(dummyUser.email);
  expect(result.phone).toBe(dummyUser.phone);
  expect(result).toHaveProperty("_id");
});

test("Add user -- no email", async () => {
  const dummyUser = {
    name: "test1",
    password: "123456abcd",
    phone: 1234356789,
  };
  const result = await userServices.createUser(dummyUser);
  expect(result).toBeFalsy();
});
/*
test("Get user by email -- success", async () => {
  const email = "test@gmail.com";
  const user = await userServices.getUser(email, true);
  expect(user).toBeDefined();
  expect(user.email).toBe(email);
});
*/
test("Get user by email -- failure", async () => {
  const email = "blah@blah.edu";
  const user = await userServices.getUser(email);
  expect(user).toBeFalsy();
});

test("Get user by email -- no email", async () => {
  const user = await userServices.getUser();
  expect(user).toBeFalsy();
});

test("Update user's name -- success", async () => {
  const email = "test@gmail.com";
  const newName = "newName";
  const result = await userServices.changeUserName(email, newName);
  expect(result).toBeTruthy();
  expect(result.name).toBe(newName);
});

test("Update user's number -- success", async () => {
  const email = "test@gmail.com";
  const newNumber = 9876543210;
  const result = await userServices.changeUserPhone(email, newNumber);
  expect(result).toBeTruthy();
  expect(result.phone).toBe(newNumber);
});

test("Update user's password -- success", async () => {
  const id = "a3b5f2c987d01456e9a23df7";
  const newPassword = "newPassword";
  const result = await userServices.changeUserPassword(id, newPassword);
  expect(result).toBeTruthy();
});

test("Update user's pfp -- success", async () => {
  const id = "a3b5f2c987d01456e9a23df7";
  const newPfp = "newPfp";
  const result = await userServices.changeUserProfilePic(id, newPfp);
  expect(result).toBeTruthy();
  expect(result.profilePicture).toBe(newPfp);
});