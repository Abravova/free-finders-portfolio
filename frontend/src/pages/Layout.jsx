import { useAtom } from "jotai";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SignUpNavBar from "../components/SignUpNavBar"; // Alternative Navbar for Signup/Login pages
import "../styles/Layout.css";
import { expirationAtom, INVALID_TOKEN, tokenAtom } from "../utils/api";
import { useIsLoggedIn } from "../utils/hooks";

const PRIVATE_ROUTES = ["/create", "/personal-info"];

export default function Layout() {
  const isLoggedIn = useIsLoggedIn();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUpOrLoginPage =
    location.pathname === "/signup" || location.pathname === "/login";

  const [expirationDate] = useAtom(expirationAtom);
  const [, setToken] = useAtom(tokenAtom);

  useEffect(() => {
    if (PRIVATE_ROUTES.includes(location.pathname)) {
      if (!isLoggedIn) {
        navigate("/login");
      }
    }
  }, [isLoggedIn, location.pathname, navigate]);

  // clear token if expired
  useEffect(() => {
    if (expirationDate < Date.now()) {
      setToken(INVALID_TOKEN);
    }
  }, [expirationDate, navigate, setToken]);

  return (
    <div className="layout">
      {/* Header Section */}
      <header>{isSignUpOrLoginPage ? <SignUpNavBar /> : <NavBar />}</header>

      {/* Main Content Section */}
      <main>
        <Outlet />
      </main>

      {/* Footer Section */}
      <footer className="footer">
        <p>&copy;2025 FreeFinders. All rights reserved.</p>
      </footer>
    </div>
  );
}
