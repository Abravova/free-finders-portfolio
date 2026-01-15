import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import createListingStyles from "../styles/CreateListing.module.css";
import styles from "../styles/EditListing.module.css";
import {
  addAuthHeader,
  BASE_URL,
  fetchListing,
  updateListing,
} from "../utils/api";
import { VALID_CATEGORIES } from "../utils/util";

/** @typedef {import('../utils/api.js').Listing} Listing */

export default function EditListing() {
  const { id } = useParams();

  const [newTitle, setNewTitle] = useState(undefined);
  const [newDescription, setNewDescription] = useState(undefined);
  const [newCity, setNewCity] = useState(undefined);
  const [newCategory, setNewCategory] = useState(undefined);
  const [newAvailable, setNewAvailable] = useState(undefined);

  const [newFile, setNewFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /** @type {ReturnType<typeof useState<Listing?>>} */
  const [listing, setListing] = useState();

  useEffect(() => {
    fetchListing(id).then((result) => {
      if (result) {
        setListing(result);
      } else {
        console.error("Error fetching listing");
      }
    });
  }, [id]);

  useEffect(() => {
    if (listing && !listing.isAuthor) {
      navigate(`/listing/${id}`);
    }
  }, [id, listing, navigate]);

  const [fileDataUrl, setFileDataUrl] = useState(null);
  useEffect(() => {
    if (newFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result);
      };
      reader.readAsDataURL(newFile);
    }
  }, [newFile]);

  const uploadFile = async () => {
    if (!newFile) {
      setError("Please choose a file first.");
      return null;
    }

    const formData = new FormData();
    formData.append("image", newFile);

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

    let newFileUrl;
    if (newFile) {
      newFileUrl = await uploadFile();
      if (!newFileUrl) return; // stop if file upload fails
    }

    // undefined fields don't update anything
    // undefined stuff also stops empty strings
    const result = await updateListing({
      _id: listing._id,
      title: newTitle || undefined,
      description: newDescription || undefined,
      location: newCity || undefined,
      category: newCategory || undefined,
      fileUrl: newFileUrl || undefined,
      available: newAvailable,
    });

    if (result) {
      navigate(`/listing/${listing._id}`);
    } else {
      setError("Error updating listing");
    }
  }

  function isEditedClassname(newField, listingField) {
    if (newField === null || newField === undefined) return "";
    return newField !== listingField ? styles.edited : "";
  }

  return (
    <>
      {listing && (
        <div className={createListingStyles.container}>
          <div className={createListingStyles.images}>
            <img
              src={(newFile && fileDataUrl) || listing.fileUrl}
              alt="placeholder image"
            />

            <input
              type="file"
              id="myFile"
              name="filename"
              accept=".jpg,.jpeg,.png"
              className={newFile ? styles.edited : ""}
              onChange={(e) => setNewFile(e.target.files[0])}
            />
          </div>
          <div>
            <form className={createListingStyles.form} onSubmit={submitListing}>
              <div>
                <label
                  htmlFor="title"
                  className={isEditedClassname(newTitle, listing.title)}
                >
                  Listing Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTitle ?? listing.title}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className={isEditedClassname(
                    newDescription,
                    listing.description,
                  )}
                >
                  Description
                </label>
                <textarea
                  rows={5}
                  id="description"
                  name="description"
                  value={newDescription ?? listing.description}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className={isEditedClassname(newCity, listing.location)}
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={newCity ?? listing.location}
                  onChange={(e) => setNewCity(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className={isEditedClassname(newCategory, listing.category)}
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newCategory ?? listing.category}
                  onChange={(e) => setNewCategory(e.target.value)}
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

              <div className={createListingStyles.checkbox}>
                <label
                  htmlFor="available"
                  className={isEditedClassname(newAvailable, listing.available)}
                >
                  Available
                </label>
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={newAvailable ?? listing.available}
                  onChange={(e) => {
                    setNewAvailable(e.target.checked);
                  }}
                />
              </div>

              <div>
                <button type="submit">Save Listing</button>
              </div>

              {error && (
                <div className={createListingStyles.error}>{error}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
