import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import defaultProfilePicture from "../components/profile_img.png";
import styles from "../styles/Listing.module.css";
import { fetchListing, fetchUser } from "../utils/api"; // Import fetchUser

/** @typedef {import('../utils/api.js').Listing} Listing */

export default function Listing() {
  const { id } = useParams();
  const navigate = useNavigate();

  /** @type {ReturnType<typeof useState<Listing?>>} */
  const [listing, setListing] = useState();

  /** @type {ReturnType<typeof useState<string>>} */
  const [sellerName, setSellerName] = useState("");

  const [sellerProfilePicture, setSellerProfilePicture] = useState("");

  useEffect(() => {
    fetchListing(id).then((result) => {
      if (result) {
        setListing(result);

        // Fetch the seller's name using their email
        if (result.email) {
          fetchUser(result.email).then((userResult) => {
            if (userResult) {
              setSellerName(userResult.name); // Set the seller's name
              setSellerProfilePicture(userResult.profilePicture);
            } else {
              console.error("Error fetching seller's name");
              setSellerName("Unknown Seller"); // Fallback if the name is not found
            }
          });
        }
      } else {
        console.error("Error fetching listing");
      }
    });
  }, [id]);

  return (
    <>
      {listing && (
        <div className={styles.content}>
          <div className={styles.images}>
            <img
              src={
                listing.fileUrl ||
                "https://placehold.co/600x400?text=Placeholder"
              }
              alt={listing.title}
            />
          </div>
          <div className={styles.info}>
            <h1 className={styles.title}>{listing.title}</h1>
            <hr />
            <div className={styles.seller}>
              <img
                src={sellerProfilePicture || defaultProfilePicture}
                alt={`${sellerName}'s Profile`}
              />
              <div className={styles["seller-info"]}>
                <p>Seller: {sellerName}</p> {/* Display the seller's name */}
              </div>
            </div>
            <hr />
            <h3 className={styles["description-title"]}>
              Description: {listing.description}
            </h3>
            <p>
              Date Listed: {new Date(listing.created_at).toLocaleDateString()}
            </p>
            <p>Location: {listing.location}</p>
            <p>Category: {listing.category}</p>
            <p>Available: {listing.available ? "Yes" : "No"}</p>
            <div className={styles["button-container"]}>
              <button
                className={styles["seller-link"]}
                onClick={() => navigate(`/user/${listing.email}`)}
              >
                Lister&apos;s Page
              </button>
              {listing.isAuthor && (
                <button onClick={() => navigate(`/listing/${id}/edit`)}>
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
