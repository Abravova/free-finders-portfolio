import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../utils/api";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();
  const isVerifying = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
        // Prevent multiple requests
        if (isVerifying.current) return;
        isVerifying.current = true;

      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await createUser(token);

        if (response.success) {
          setMessage("Email verified! Redirecting to home...");
          setTimeout(() => navigate("/"), 3000); // Redirect after 3 seconds
        } else {
          setMessage(response.error || "Verification failed.");
        }
      } catch (error) {
        setMessage("Error verifying email. Try again.");
      } finally {
        isVerifying.current = false;
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div className="verify-container">
      <h2>{message}</h2>
    </div>
  );
};

export default VerifyEmail;