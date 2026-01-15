import { useState } from "react";
import styles from "../styles/ReviewModal.module.css"; // Create a separate CSS file for modal styles
import { postReview } from "../utils/api";

export default function ReviewModal({ userEmail, onClose, onSubmit }) {
  const [reviewForm, setReviewForm] = useState({
    description: "",
    rating: 0,
  });

  const [error, setError] = useState(null); // State to handle errors

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Validate the rating
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    // Call the postReview API function
    const result = await postReview(userEmail, reviewForm.rating, reviewForm.description);

    if (result.success) {
      // If the review is posted successfully, call the onSubmit prop
      onSubmit(reviewForm);
      setReviewForm({ description: "", rating: 0 }); // Reset the form
      onClose(); // Close the modal
    } else {
      // If there's an error, display it to the user
      setError(result.error || "Failed to post review");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Leave a Review for {userEmail}</h2>
        {error && <p className={styles.error}>{error}</p>} {/* Display error message */}
        <form onSubmit={handleReviewSubmit}>
          <label>
            Description:
            <textarea
              className={styles.desc}
              name="description"
              value={reviewForm.description}
              onChange={handleReviewChange}
              required
            ></textarea>
          </label>
          <label>
            Rating:
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={Number(reviewForm.rating) === star}
                    onChange={handleReviewChange}
                    required
                  />
                  {star}★
                </span>
              ))}
            </div>
          </label>
          <div className={styles.modalButtons}>
            <button className={styles.buttons} type="submit">
              Submit Review
            </button>
            <button className={styles.cancel} type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
