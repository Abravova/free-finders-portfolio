import axios from "axios";
import { useState, useEffect } from "react";
import styles from "../styles/PersonalInfo.module.css";
import { fetchUserInfo } from "../utils/api.js";
import { useNavigate } from "react-router-dom";
import { useIsLoggedIn } from "../utils/hooks";
import PersonalInfoModal from "../components/PersonalInfoModal.jsx";
import {
  addAuthHeader,
  BASE_URL,
  updateUserProfilePicture,
} from "../utils/api";

const placeholderImage =
  "https://i.pinimg.com/originals/f1/0f/f7/f10ff70a7155e5ab666bcdd1b45b726d.jpg";

function displayPhoneNumber(phone) {
  let cleaned = String(phone).replace(/\D/g, "");

  // ensure it's a valid 10-digit or 11-digit (with +1) number
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    cleaned = cleaned.slice(1); // remove the leading 1
  }

  if (cleaned.length !== 10) {
    console.log("cannot format number");
    return phone;
  }

  // format the number -> (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

export default function PersonalInfo() {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();

  const [fileDataUrl, setFileDataUrl] = useState(null);
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login"); // redirect to login page
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchUserInfo().then((result) => {
      if (result) {
        setUser(result);
        setError(false);
      } else {
        console.error("Error fetching current user");
        setError(true);
      }
    });
  }, []);

  if (error) {
    console.log("display error on page...");
  }

  const uploadFile = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return null;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/upload-pfp`,
        formData,
        {
          headers: addAuthHeader({
            "Content-Type": "multipart/form-data",
          }),
        },
      );

      if (response.status === 200 && response.data.imageLink) {
        console.log("Uploaded file URL:", response.data.imageLink);
        return response.data.imageLink;
      } else {
        console.error("Unexpected response format:", response);
        setError("File upload failed.");
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Error uploading file.");
      return null;
    }
  };

  async function handleProfilePictureUpload() {
    const fileUrl = await uploadFile();
    if (!fileUrl) return;
    const response = await updateUserProfilePicture(fileUrl);

    if (!response) {
      setError("Failed to upload photo");
      return;
    }
    alert("pfp uploaded successfully");
    window.location.reload();
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Personal Info</h1>
      <hr />
      <div className={styles.infoContainer}>
        {/* Email */}
        <div className={styles.infoComponent}>
          <div className={styles.images}>
            <img
              src={
                fileDataUrl || (user ? user.profilePicture : placeholderImage)
              }
              alt="placeholder image"
            />
            <input
              type="file"
              id="myFile"
              name="filename"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            <button onClick={handleProfilePictureUpload}>
              Change Profile Picture
            </button>
          </div>
          <h1 className={styles.infoTitle}>Email: </h1>
          <div className={styles.textComponent}>
            <div className={styles.textBox}>
              <p className={styles.infoText}>
                {user ? user.email : "Loading..."}
              </p>
            </div>
            {/*
            <div className={styles.editIcon}>
              <PersonalInfoModal modalType="email" />
            </div>
            */}
          </div>
        </div>

        {/* Name */}
        <div className={styles.infoComponent}>
          <h1 className={styles.infoTitle}>Name: </h1>
          <div className={styles.textComponent}>
            <div className={styles.textBox}>
              <p className={styles.infoText}>
                {user ? user.name : "Loading..."}
              </p>
            </div>
            <div className={styles.editIcon}>
              <PersonalInfoModal modalType="name" />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className={styles.infoComponent}>
          <h1 className={styles.infoTitle}>Password: </h1>
          <div className={styles.textComponent}>
            <div className={styles.textBox}>
              <p className={styles.infoText}>*************</p>
            </div>
            <div className={styles.editIcon}>
              <PersonalInfoModal modalType="password" />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className={styles.infoComponent}>
          <h1 className={styles.infoTitle}>Phone Number: </h1>
          <div className={styles.textComponent}>
            <div className={styles.textBox}>
              <p className={styles.infoText}>
                {user ? displayPhoneNumber(user.phone) : "Loading..."}
              </p>
            </div>
            <div className={styles.editIcon}>
              <PersonalInfoModal modalType="phone number" />
            </div>
          </div>
        </div>
      </div>
      <p>{error}</p>
    </div>
  );
}
