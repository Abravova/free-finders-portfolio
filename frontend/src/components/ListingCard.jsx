import { Link } from "react-router-dom";
import styles from "../styles/ListingCard.module.css";

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.image
 * @param {string} props.title
 * @param {string} props.location
 * @param {string} props.createdAt
 */
export function Listing({ id, image, title, location, createdAt }) {
  return (
    <Link to={`/listing/${id}`}>
      <div className={styles.item}>
        <img
          className={styles["item-img"]}
          src={image}
          alt="placeholder image"
        />
        <div className={styles["item-title"]}>{title}</div>
        <div className={styles["item-location"]}>{location}</div>
        <div className={styles["item-time"]}>
          Posted: {new Date(createdAt).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}
