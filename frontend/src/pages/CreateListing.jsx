import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CreateListing.module.css";
import { addAuthHeader, BASE_URL, postListing } from "../utils/api";
import { VALID_CATEGORIES } from "../utils/util";

const placeholderImage = "https://placehold.co/600x400?text=Placeholder";

export default function CreateListing() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("notchosen");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const uploadFile = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return null;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: addAuthHeader({
          "Content-Type": "multipart/form-data",
        }),
      });

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

  async function submitListing(e) {
    e.preventDefault();

    if (title.trim() === "") {
      setError("Please enter a title");
      return;
    } else if (description.trim() === "") {
      setError("Please enter a description");
      return;
    } else if (city.trim() === "") {
      setError("Please enter a city");
      return;
    } else if (category === "notchosen") {
      setError("Please select a category");
      return;
    } else {
      setError(null);
    }

    let fileUrl;

    try {
      fileUrl = await uploadFile();
    } catch (error) {
      console.log("error uploading file: " + error);
      setError(error.data.message);
      if (!fileUrl) return;
    }

    const result = await postListing(
      title,
      description,
      city,
      category,
      fileUrl,
    );

    if (result) {
      navigate("/");
    } else {
      if (!fileUrl) {
        setError(error.data.message);
      } else {
        setError("Error creating listing");
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.images}>
        <img src={fileDataUrl || placeholderImage} alt="placeholder image" />

        <input
          type="file"
          id="myFile"
          name="filename"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <form className={styles.form} onSubmit={submitListing}>
          <div>
            <label htmlFor="title">Listing Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="description">Description</label>
            <textarea
              rows={5}
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="notchosen" disabled>
                Choose a category
              </option>
              {VALID_CATEGORIES.map((cat) => (
                <option value={cat} key={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button type="submit">Create Listing</button>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
