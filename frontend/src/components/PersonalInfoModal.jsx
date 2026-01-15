"use client";
import "../styles/PersonalInfoModal.css";
import {
  updateUserName,
  //updateUserEmail,
  updateUserPhone,
  updateUserPassword,
} from "../utils/api";

//import { useLogout } from "../utils/hooks";
//import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { BsPencil } from "react-icons/bs";

export default function PersonalInfoModal({ modalType }) {
  const [newValue, setNewValue] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  //  const navigate = useNavigate();
  //  const logout = useLogout(); // this is a hook. using it for reusability later

  {
    /*}
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  */
  }

  function isValidName(name) {
    return /^[a-zA-Z\s]+$/.test(name); //checks to see if it is using letters and spaces - non numbers/symbols
  }

  function isValidPhone(phone) {
    // allows US phone number (no dashes)
    return /^(\+1)?\d{10}$/.test(phone);
  }

  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  }

  // modal ------
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }
  // modal------end

  async function nameApiCall() {
    try {
      if (!isValidName(newValue)) {
        setMessage("Please use only valid characters");
        return;
      }
      const response = await updateUserName(newValue);
      if (response && response.data.message === "Name updated successfully.") {
        setMessage("");
        alert("Name updated successfully!");
        setModal(!modal);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      alert(`Error updating name: ${error}`);
    }
  }

  {
    /*
  async function emailApiCall() {
    try {
      const response = await updateUserEmail(newValue);
      if (response && response.message === "Email updated successfully.") {
        alert("Email updated successfully! Please log in again.");
        setModal(!modal); // close modal
        logout();
        navigate("/login"); // kicks user back to login
      }
    } catch (error) {
      alert("Error updating email: invalid/existing email");
    }
  }
  */
  }

  async function phoneApiCall() {
    try {
      if (!isValidPhone(newValue)) {
        setMessage("Please correct phone formatting");
        return;
      }
      const response = await updateUserPhone(newValue);
      console.log(response);
      if (
        response &&
        response.data.message === "Phone number updated successfully."
      ) {
        setMessage("");
        alert("Phone number updated successfully.");
        setModal(!modal);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
      alert(`Error updating phone number: ${error}`);
    }
  }

  async function passwordApiCall() {
    try {
      if (!isValidPassword(newValue)) {
        setMessage(
          "At least 1 letter, a number, a symbol, at least 8 characters",
        );
        return;
      }
      const response = await updateUserPassword(oldPassword, newValue);
      if (
        response &&
        response.data.message === "Password updated successfully."
      ) {
        setMessage("");
        alert("Password updated successfully!");
        setModal(!modal); // close modal
      }
    } catch (error) {
      alert("Error updating password: " + error);
    }
  }

  // this handles the modals sumbit
  async function handleSubmit(e) {
    e.preventDefault();

    if (modalType == "name") {
      if (!newValue.trim()) {
        alert("Please enter a new name.");
        return;
      }
      nameApiCall();
      {
        /*
    } else if (modalType == "email") {
      if (!newValue.trim() || !isValidEmail(newValue)) {
        alert("Please enter a valid email.");
        // will need to add alerts for invalid due to duplicate
        return;
      }
      emailApiCall();
    */
      }
    } else if (modalType == "password") {
      if (!newValue.trim()) {
        alert("Please enter a password"); // need to validate password still
        return;
      }
      if (newValue != confirmPassword) {
        alert("Please make sure your new password match");
        return;
      }
      passwordApiCall();
    } else if (modalType == "phone number") {
      if (!newValue.trim()) {
        alert("Please enter a new phone number.");
        return;
      }
      phoneApiCall();
    }
  }

  return (
    <>
      <button onClick={toggleModal} className="btn-modal">
        <BsPencil
          style={{ color: "black", transition: "color 0.3s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "grey")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
        />
      </button>

      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit {modalType}</h2>
              <button className="close-modal" onClick={toggleModal}>
                <p>x</p>
              </button>
            </div>
            <hr></hr>
            <div className="input-field">
              {modalType === "password" && (
                <input
                  type="password"
                  placeholder="Enter old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              )}
              <input
                placeholder={`Enter new ${modalType}`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              {modalType === "password" && (
                <input
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}
            </div>
            <div className="submit-field">
              <p className="modal-message">{message}</p>
              <button
                type="submit"
                className="submit-button"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
