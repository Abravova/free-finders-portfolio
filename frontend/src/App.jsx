import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css"; // css import

//page imports
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Help from "./pages/Help";
import HowItWorks from "./pages/HowItWorks";
import Layout from "./pages/Layout";
import Listing from "./pages/Listing";
import Login from "./pages/Login";
import PersonalInfo from "./pages/PersonalInfo";
import Root from "./pages/Root";
import SignUp from "./pages/SignUp";
import User from "./pages/User";
import VerifyEmail from "./pages/VerifyEmail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/help" element={<Help />} />
          <Route path="/listing/:id" element={<Listing />} />
          <Route path="/listing/:id/edit" element={<EditListing />} />
          <Route path="/user/:email" element={<User />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* routes in here will have the header */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
