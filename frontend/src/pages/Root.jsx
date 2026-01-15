import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../App.css";
import { Listing } from "../components/ListingCard.jsx";
import "../styles/root.css";
import { fetchListings } from "../utils/api";

/**
 * @typedef {import('../utils/api.js').Listing} Listing
 */

export default function Root() {
  /** @type {ReturnType<typeof useState<Listing[]>>} */
  const [listings, setListings] = useState([]);

  /** @type {ReturnType<typeof useState<boolean>>} */
  const [error, setError] = useState(false);

  /** @type {ReturnType<typeof useState<boolean>>} */
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const category = searchParams.get("category");

  useEffect(() => {
    setLoading(true);

    fetchListings({
      keyword,
      category,
    }).then((result) => {
      if (result) {
        setListings(result);
        setError(false);
      } else {
        console.error("Error fetching listings");
        setListings([]);
        setError(true);
      }
      setLoading(false);
    });
  }, [category, keyword]);

  return (
    <>
      {error && <h2 className="search-error">Error fetching listings!</h2>}
      {listings.length === 0 && !error && !loading && (
        <h2 className="search-error">
          No listings found for &quot;{keyword}&quot;
          {category && <> in the category &quot;{category}&quot;</>}
        </h2>
      )}
      <main className="root-main">
        {listings.map((item) => (
          <Listing
            key={item._id}
            id={item._id}
            image={item.fileUrl}
            title={item.title}
            location={item.location}
            createdAt={item.created_at}
          />
        ))}
      </main>
    </>
  );
}
