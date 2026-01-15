import mongoose from "mongoose";
import { ListingSchema } from "./listing.js";
import * as listingServices from "./listing-services.js";
const mockingoose = require("mockingoose");

let listingModel;

//------- setup -----------------------------------------------
beforeAll(() => {
  listingModel = mongoose.model("Listing", ListingSchema);
});

afterAll(async () => {});

beforeEach(() => {
  jest.clearAllMocks();
  mockingoose.resetAll();
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ------ tests -----------------------------------------------
test("Fetch all listings", async () => {
  const mockListings = [
    {
      _id: "a3b5f2c987d01456e9a23df7",
      email: "user1@example.com",
      title: "Mouse",
      description: "A wireless mouse in good condition.",
      available: true,
      category: "Electronics",
      location: "San Luis Obispo",
      fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
      created_at: new Date(),
    },
    {
      _id: "6788fa9792c0279d3a346de7",
      email: "user2@example.com",
      title: "Outdoor Bench",
      description: "A sturdy wooden outdoor bench.",
      available: true,
      category: "Home & Garden",
      location: "San Luis Obispo",
      fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
      created_at: new Date(),
    },
  ];

  mockingoose(listingModel).toReturn(mockListings, "find");

  const listings = await listingServices.getListings();

  expect(listings).toBeDefined();
  expect(listings.length).toBe(2);
  expect(listings[0].title).toBe("Mouse");
});

test("Fetch listing by id", async () => {
  const result = {
    _id: "1b23e4f5c6d7a890b1c2d3e4",
    email: "user3@example.com",
    title: "Monitor",
    description: "A 24-inch monitor, perfect for work or gaming.",
    available: true,
    category: "Electronics",
    location: "San Luis Obispo",
    fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
    created_at: new Date(),
  };

  mockingoose(listingModel).toReturn(result, "findOne");

  const test_listing = await listingModel.findOne({ title: "Monitor" });

  const id = test_listing._id;
  const listing = await listingServices.getListing(id);

  expect(listing).toBeDefined();
  expect(listing.title).toBe(test_listing.title);
});

test("Fetch listing by id -- invalid id format", async () => {
  const id = "123";
  const listing = await listingServices.getListing(id);
  expect(listing).toBeFalsy();
});

test("Fetch listings by category", async () => {
  const result = [
    {
      _id: "1b23e4f5c6d7a890b1c2d3e4",
      email: "user3@example.com",
      title: "Monitor",
      description: "A 24-inch monitor, perfect for work or gaming.",
      available: true,
      category: "Electronics",
      location: "San Luis Obispo",
      fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
      created_at: new Date(),
    },
  ];

  mockingoose(listingModel).toReturn(result, "find");

  const category = "Electronics";
  const listings = await listingServices.getListings({ category });

  expect(listings).toBeDefined();
  expect(listings.length).toBeGreaterThan(0);
  listings.forEach((listing) => expect(listing.category).toBe(category));
});

test("Fetch listings by keyword", async () => {
  const result = [
    {
      _id: "a3b5f2c987d01456e9a23df7",
      email: "user1@example.com",
      title: "Mouse",
      description: "A wireless mouse in good condition.",
      available: true,
      category: "Electronics",
      location: "San Luis Obispo",
      fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
      created_at: new Date(),
    },
  ];

  mockingoose(listingModel).toReturn(result, "find");

  const keyword = "mouse";
  const listings = await listingServices.getListings({ keyword });
  expect(listings).toBeDefined();
  expect(listings.length).toBeGreaterThan(0);
});

test("Add listing -- successful", async () => {
  const dummyListing = {
    _id: "64c7f9b347d3f9a011c12345",
    email: "user4@example.com",
    title: "Silver Ring",
    description: "A beautiful silver ring with intricate design.",
    available: true,
    category: "Jewelry",
    location: "San Luis Obispo",
    fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
    created_at: new Date(),
  };

  mockingoose(listingModel).toReturn(dummyListing, "save");

  const result = await listingServices.createListing(dummyListing);
  expect(result).toBeTruthy();
  expect(result.title).toBe(dummyListing.title);
  expect(result.category).toBe(dummyListing.category);
  expect(result.location).toBe(dummyListing.location);
  expect(result.fileUrl).toBe(dummyListing.fileUrl);
  expect(result.description).toBe(dummyListing.description);
  expect(result.available).toBeTruthy();
  expect(result).toHaveProperty("_id");
});

test("Add listing -- no title", async () => {
  const dummyListing = {
    category: "Jewelry",
    location: "San Luis Obispo",
    fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
  };

  mockingoose(listingModel).toReturn(dummyListing, "save");

  const result = await listingServices.createListing(dummyListing);
  expect(result).toBeFalsy();
});

test("Add listing -- invalid category", async () => {
  const dummyListing = {
    title: "Elden Ring",
    category: "Video Games",
    location: "San Luis Obispo",
    fileUrl: "https://csc308--freefinder.s3.us-west-1.amazonaws.com/",
  };

  mockingoose(listingModel).toReturn(dummyListing, "save");

  const result = await listingServices.createListing(dummyListing);
  expect(result).toBeFalsy();
});
