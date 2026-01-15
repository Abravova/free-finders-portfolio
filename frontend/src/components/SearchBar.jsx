import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function SearchBar() {
  const [searchParams] = useSearchParams();
  const [searchBar, setSearchBar] = useState(searchParams.get("keyword") ?? "");
  const navigate = useNavigate();

  // set search bar when navigating back and forth
  useEffect(() => {
    setSearchBar(searchParams.get("keyword") ?? "");
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // create new search params to not update and cause extra navigation
    const newSearch = new URLSearchParams(searchParams);
    newSearch.set("keyword", searchBar.trim());

    navigate("/?" + newSearch.toString());
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-bar"
        placeholder="Search for anything..."
        value={searchBar}
        onChange={(e) => setSearchBar(e.target.value)}
      />
      <button className="search-button">Search</button>
    </form>
  );
}
