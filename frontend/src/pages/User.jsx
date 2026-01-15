import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Listing } from "../components/ListingCard.jsx";
import defaultProfilePicture from "../components/profile_img.png";
import ReviewModal from "../components/ReviewModal.jsx"; // Assuming you have a ReviewModal component
import sellerImg from "../components/seller.jpg";
import styles from "../styles/User.module.css";
import { fetchReviews, fetchUser } from "../utils/api";
import { useIsLoggedIn } from "../utils/hooks.js";
import { formatPhoneNumber } from "../utils/phone.js";

/** @typedef {import('../utils/api.js').User} User */

export default function User() {
  const { email } = useParams();

  /** @type {ReturnType<typeof useState<User?>>} */
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const isLoggedIn = useIsLoggedIn();

  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch user data
  useEffect(() => {
    fetchUser(email).then((result) => {
      if (result) {
        setUser(result);
        setError(false);
      } else {
        console.error("Error fetching user");
        setError(true);
      }
    });
  }, [email]);

  // Fetch reviews for the user
  useEffect(() => {
    const fetchUserReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      const result = await fetchReviews(email);
      if (result?.success) {
        setReviews(result.data.reviews);
        setRating(result.data.rating); // Set the average rating
        // Set the reviews from the response
      } else {
        console.error("Error fetching reviews:", result?.error);
        setReviewsError(result?.error || "Failed to fetch reviews.");
      }
      setReviewsLoading(false);
    };

    fetchUserReviews();
  }, [email]);

  // Handle review submission
  // Handle review submission (refresh reviews after a new one is posted)
  const handleReviewSubmit = async () => {
    const newReviewsResult = await fetchReviews(email);
    if (newReviewsResult?.success) {
      setReviews(newReviewsResult.data.reviews);
      setRating(newReviewsResult.data.rating); // Update the rating
    }
    setShowReviewModal(false); // Close the modal
  };

  if (error) {
    return <h1>Couldn&apos;t find user with email {email}</h1>;
  }

  if (!user) {
    return <p>Loading...</p>; // Show loading state while fetching user data
  }

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.blurredBg}></div>
        <img
          className={styles.centeredImage}
          src={sellerImg}
          alt="Illustration of a seller listing an item"
        />
      </div>

      {/* User Info Section */}
      <div className={styles.userInfo}>
        <div className={styles.userDetails}>
          <img
            className={styles.profileImage}
            src={user.profilePicture || defaultProfilePicture}
            alt={`${user.name}'s Profile`}
          />
          <div>
            <h1>{user.name}</h1>
            <div className={styles.userStats}>
              <p>Rating: {rating}⭐</p>
              <p>Amount of listings: {user.listings.length}</p>
            </div>
          </div>
        </div>

        <div className={styles.contactInfo}>
          <h1>Contact Information</h1>
          {/* gross looking ternary but whatever */}
          {isLoggedIn && user.email ? (
            <>
              <p>Email: {user.email}</p>
              {user.phone && (
                <p>Phone: {formatPhoneNumber(user.phone.toString())}</p>
              )}
            </>
          ) : (
            <p>Login to view contact information</p>
          )}
        </div>

        <div>
          <button
            className={styles["review-form"]}
            onClick={() => setShowReviewModal(true)}
          >
            Leave a review
          </button>
        </div>
      </div>

      {/* Listings Section */}
      <div className={styles.listingsSection}>
        <h2>Listings</h2>
        <div className={styles.listings}>
          {user.listings.map((item) => (
            <Listing
              key={item._id}
              id={item._id}
              image={item.fileUrl}
              title={item.title}
              location={item.location}
              createdAt={item.created_at}
            />
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className={styles.h2Review}>Reviews</h2>
        {reviewsLoading ? (
          <p>Loading reviews...</p>
        ) : reviewsError ? (
          <p>Error: {reviewsError}</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className={styles.reviews}>
            {reviews.map((review, index) => {
              // Extract the part of the email before the @ symbol
              const reviewerName = review.reviewer_email.split("@")[0];
              // Remove numbers from the reviewer name
              const reviewerNameWithoutNumbers = reviewerName.replace(
                /\d/g,
                "",
              );
              return (
                <div key={index} className={styles.review}>
                  <p className={styles.review}>
                    <strong>{reviewerNameWithoutNumbers}</strong>{" "}
                    {review.description}{" "}
                    <strong>Rating: {review.rating}★</strong>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          userEmail={user.email} // Pass the user's email as a prop
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
