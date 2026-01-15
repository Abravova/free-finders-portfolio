import mongoose from "mongoose";
const mockingoose = require("mockingoose");
import { UserSchema } from "./user.js";
import * as userServices from "./user-services.js";

let userModel;

//------- setup -----------------------------------------------
beforeAll(async () => {
  userModel = mongoose.model("User", UserSchema);
});

afterAll(async () => {});

beforeEach(async () => {
  jest.clearAllMocks();
  mockingoose.resetAll();

  //   let dummyUser = {
  //     email: "test@gmail.com",
  //     name: "test",
  //     password: "123456abcd",
  //     phone: 1234356789,
  //   };
  //   let result = new userModel(dummyUser);
  //   await result.save();
});

afterEach(async () => {
  jest.restoreAllMocks();
});

// ------ tests -----------------------------------------------
test("Fetch all users", async () => {
  let mockUsers = [
    {
      email: "test@gmail.com",
      name: "test",
      password: "123456abcd",
      phone: 1234356789,
    },
    {
      email: "test2@gmail.com",
      name: "test2",
      password: "654321dcba",
      phone: 987654321,
    },
  ];

  mockingoose(userModel).toReturn(mockUsers, "find");

  const users = await userServices.getUsers();
  expect(users).toBeDefined();
  expect(users.length).toBeGreaterThan(0);
});

test("Fetch user by id", async () => {
  let mockUser = {
    email: "test@gmail.com",
    name: "test",
    password: "123456abcd",
    phone: 1234356789,
  };

  mockingoose(userModel).toReturn(mockUser, "findOne");

  const test_user = await userModel.findOne({ name: "test" });
  const id = test_user._id;
  const user = await userServices.getUserById(id);
  expect(user).toBeDefined();
  expect(user.name).toBe(test_user.name);
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

  mockingoose(userModel).toReturn(dummyUser, "add");

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

  mockingoose(userModel).toReturn(dummyUser, "add");

  const result = await userServices.createUser(dummyUser);
  expect(result).toBeFalsy();
});
