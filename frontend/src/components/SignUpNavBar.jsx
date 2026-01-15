import { Link, useLocation } from "react-router-dom";
import "../styles/navBar2.css"; // Assuming you have styles here

function SignUpNavBar() {
  // Get the current location/pathname from react-router
  const location = useLocation();

  // Check if the current page is the SignUp page
  const isSignUp = location.pathname === "/signup";

  return (
    <header>
      {/* Main Section */}
      <div className="main-section">
        <div className="container2">
          <div className="header-left">
            <Link to="/" className="header-title">
              FreeFinders
            </Link>
          </div>

          <div className="header-right">
            <div className="login-container">
              {isSignUp ? (
                <>
                  <span>Already have an account? </span>
                  <Link to="/login" className="log-in">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  <span>Don&apos;t have an account? </span>
                  <Link to="/signup" className="log-in">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout() {
  return (
    <div className="app-container">
      <SignUpNavBar />
    </div>
  );
}
