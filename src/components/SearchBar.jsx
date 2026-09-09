import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch(search);
    }
  };

  return (
    <div className="search-bar">

      <input
        type="text"
        placeholder="Search for Eyeglasses, Sunglasses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={handleSearch}>
        <FaSearch />
      </button>

    </div>
  );
}

export default SearchBar;