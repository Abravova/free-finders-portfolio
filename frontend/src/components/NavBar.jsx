import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Layout.css";
import { signout } from "../utils/api";
import { useIsLoggedIn } from "../utils/hooks";
import { VALID_CATEGORIES } from "../utils/util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import categoryDropdown from "./dropdownIcon.png";
import { SearchBar } from "./SearchBar";

function NavBar() {
  const isLoggedIn = useIsLoggedIn();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => setMobileMenuVisible(!mobileMenuVisible);

  // Close the modal when clicked outside
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal")) {
      setMobileMenuVisible(false);
    }
  };

  return (
    <header>
      {/* Top Bar */}
      <nav className="top-bar">
        <div className="top-links">
          <Link to="/how-it-works">How it Works</Link>
          <Link to="/help">Help & Contact</Link>
          {isLoggedIn ? (
            <>
              <Link to="/create">Create Listing</Link>
              <button className="signout-button" onClick={signout}>
                Sign Out
              </button>
            </>
          ) : (
            <div>
              <Link to="/login">Log in</Link>
              <span> or </span>
              <Link to="/signup">Register</Link>
            </div>
          )}
          <Link to="/personal-info">
            <FontAwesomeIcon
              icon={faCircleUser}
              title="Personal Info"
              className="profile-icon"
            />
          </Link>
        </div>
      </nav>

      {/* Main Navigation Section */}
      <div className="main-section">
        <div className="container">
          {/* Logo and Mobile Menu Icon */}
          <div className="header-title-container">
            <Link to="/" className="header-title">
              <span className="overlight">Free</span>
              <span className="highlight">Finders</span>
            </Link>
            <FontAwesomeIcon
              icon={faBars}
              className="hamburger-menu"
              onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
            />
          </div>

          {/* Mobile Modal (Only shown when active) */}
          {mobileMenuVisible && (
            <div className="modal" onClick={handleOutsideClick}>
              <div className="modal-content2">
                <div className="mobile-menu">
                  <div className="exiting">
                    <Link
                      to="/how-it-works"
                      onClick={() => setMobileMenuVisible(false)}
                    >
                      How it Works
                    </Link>
                    <button
                      className="close-button"
                      onClick={() => setMobileMenuVisible(false)}
                    >
                      x
                    </button>
                  </div>
                  <Link to="/help" onClick={() => setMobileMenuVisible(false)}>
                    Help & Contact
                  </Link>
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/create"
                        onClick={() => setMobileMenuVisible(false)}
                      >
                        Create Listing
                      </Link>
                      <button
                        className="signout-button"
                        onClick={() => {
                          signout();
                          setMobileMenuVisible(false); // Close modal after signout
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuVisible(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuVisible(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Bar & Category Dropdown */}
          <div className="search-container">
            <div className="search-bar-container">
              <SearchBar />
            </div>
            <Dropdown />
          </div>
        </div>
      </div>
    </header>
  );
}

function Dropdown() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent click from propagating to the window
    setDropdownVisible((visible) => !visible);
  };

  const selectCategory = (category) => {
    const newSearch = new URLSearchParams(searchParams);
    newSearch.set("category", category);
    setDropdownVisible(false);

    navigate("/?" + newSearch.toString());
  };

  // wrap in useCallback so i can use in useEffect
  const clearCategory = useCallback(() => {
    const newSearch = new URLSearchParams(searchParams);
    newSearch.delete("category");
    setDropdownVisible(false);

    // keeps path when removing category (if you manually add a bad category to the url it stays on the page)
    // crazy edge case but easy enough to deal with
    navigate(`${window.location.pathname}?` + newSearch.toString());
  }, [navigate, searchParams]);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category && !VALID_CATEGORIES.includes(category)) {
      clearCategory();
    }
  }, [clearCategory, searchParams]);

  return (
    <div className="dropdown">
      <button className="dropbtn" onClick={toggleDropdown}>
        {searchParams.get("category") || "Select Category"}
        <img src={categoryDropdown} alt="category" className="category-icon" />
      </button>
      {isDropdownVisible && (
        <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
          {searchParams.get("category") && (
            <div className="dropdown-clear" onClick={clearCategory}>
              Clear
            </div>
          )}
          {VALID_CATEGORIES.map((cat) => (
            <div key={cat} onClick={() => selectCategory(cat)}>
              {cat}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NavBar;
