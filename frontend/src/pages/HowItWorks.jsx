import sellerImg from "../components/seller.jpg";
import buyerImg from "../components/buyer.jpg";
import "../styles/HowItWorks.css";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="how">
      <header>
        <h1 className="banner">This is how FreeFinders works</h1>
      </header>
      <main className="how">
        {/* Section 1: Sellers */}
        <div className="seller-details">
          <div className="seller-details-text">
            <h2>For Sellers</h2>
            <p>To make an item available, follow these steps:</p>
            <ol>
              <li>Sign up or log in to your account.</li>
              <li>Take clear images of the item you want to give away.</li>
              <li>
                Provide your location and contact information so interested
                users can reach you.
              </li>
              <li>
                Add relevant details about the item (e.g., condition, size, or
                special notes).
              </li>
              <li>
                Click the <strong>Create Listing;</strong> button to post your
                item!
              </li>
            </ol>
          </div>
          <img src={sellerImg} alt="Illustration of a seller listing an item" />
        </div>

        {/* Section 2: Buyers */}
        <div className="buyer-details">
          <img
            src={buyerImg}
            alt="Illustration of a buyer searching for items"
          />
          <div className="buyer-details-text">
            <h2>For Buyers</h2>
            <p>Looking for free items? Here&apos;s how you can get started:</p>
            <ol className>
              <li>Browse available items from our listings.</li>
              <li>
                If you&apos;re interested, click on the item to view more
                details and the seller&apos;s information.
              </li>
              <li>
                Contact the seller directly to arrange pickup or delivery.
              </li>
            </ol>
          </div>
        </div>

        {/* Section 3: Need Help */}
        <div className="help">
          <h2>Need Help?</h2>
          <p>
            If you have any questions or need assistance, feel free to reach
            out!
          </p>
          <Link to="/help">
            <button className="help-button">Help & Contact</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
