import { useState } from "react";
import "../styles/SignUpForm.css";
import { loginUser } from "../utils/api.js";
import { useNavigate } from "react-router-dom";

/** @typedef {import('../utils/api.js').Creds} Creds */

const LoginForm = () => {
  /** @type {ReturnType<typeof useState<Creds>>} */
  const [creds, setCreds] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    switch (name) {
      case "email":
        setCreds({ ...creds, email: value });
        break;
      case "password":
        setCreds({ ...creds, password: value });
        break;
    }
  }

  async function submitForm(e) {
    e.preventDefault();
    const success = await loginUser(creds);

    if (success) {
      navigate("/");
    }

    setCreds({ email: "", password: "" });
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Log in to your account</h2>
      <form onSubmit={submitForm}>
        <div className="input-container">
          <input
            type="email"
            name="email"
            onChange={handleChange}
            value={creds.email}
            required
          />
          <label>Email</label>
        </div>

        <div className="input-container">
          <input
            name="password"
            type="password"
            onChange={handleChange}
            value={creds.password}
            required
          />
          <label>Password</label>
        </div>

        <button type="submit" className="create-account-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
