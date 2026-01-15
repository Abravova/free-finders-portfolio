import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignUpForm.css"; // Ensure this file exists for custom styling
import { signUpUser } from "../utils/api.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeLowVision } from "@fortawesome/free-solid-svg-icons";

/** @typedef {import('../utils/api.js').SignUpCreds} SignUpCreds */

const SignUpForm = () => {
  const [strength, setStrength] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /** @type {ReturnType<typeof useState<SignUpCreds & { confirmPassword: string }>>} */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [displayPhone, setDisplayPhone] = useState(""); // State for formatted phone number

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength < 4) {
      setError("Password is not strong enough.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
    } else {
      setError(null);

      // Send the raw phone number (without formatting) to the database
      const { success, message, error } = await signUpUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone, // Raw phone number
      });

      if (success) {
        alert(message);
        navigate("/");
      } else if (error) {
        setError(error);
      } else {
        setError("Error creating account. Please try again.");
      }
    }
  };

  useEffect(() => {
    const checkStrength = () => {
      const password = formData.password;
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      setStrength(score);
    };

    checkStrength();
  }, [formData.password]);

  // Function to format the phone number
  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const cleaned = ("" + value).replace(/\D/g, "");

    // Format the phone number
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return !match[2]
        ? `(${match[1]}`
        : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ""}`;
    }
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const cleanedValue = value.replace(/\D/g, ""); // Remove non-numeric characters
    const formattedValue = formatPhoneNumber(cleanedValue); // Format the phone number

    // Update the display value (formatted) and the raw value (unformatted)
    setDisplayPhone(formattedValue);
    setFormData({
      ...formData,
      phone: cleanedValue, // Store the raw value in the state
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Create an account</h2>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="input-container">
          <label>Name</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={formData.name}
            required
          />
        </div>

        <div className="input-container">
          <label>Email</label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </div>

        <div className="input-container">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            onChange={handlePhoneChange} // Use the custom handler
            value={displayPhone} // Display the formatted value
            placeholder="(---) 123-1234"
            maxLength={14} // Set max length to 14 characters
            required
          />
        </div>

        <div className="input-container">
          <label>Password</label>
          <div className="password-input-container">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? (
                <FontAwesomeIcon icon={faEyeLowVision} />
              ) : (
                <FontAwesomeIcon icon={faEye} />
              )}
            </button>
          </div>
        </div>

        <div className="input-container">
          <label>Confirm Password</label>
          <input
            type={passwordVisible ? "text" : "password"}
            name="confirmPassword"
            onChange={handleChange}
            value={formData.confirmPassword}
            required
          />

          <div className="guideline-container">
            <p className="guideline">
              At least 1 letter, a number, a symbol, at least 8 characters
            </p>
          </div>

          <div className="strength-bar">
            <div className={`strength-indicator strength-${strength}`} />
          </div>
        </div>

        <button type="submit" className="create-account-button">
          Create Account
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;
