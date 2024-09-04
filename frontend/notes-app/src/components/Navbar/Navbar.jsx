import React, { useState } from 'react';
import ProfileInfo from '../Cards/ProfileInfo';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';

const Navbar = ({ userInfo, onSearchNote, searchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
    console.log("Searching for:", searchQuery);
  };

  const onClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow border">
        <h2 className="text-xl font-medium text-black py-2">Notes</h2>

        <SearchBar
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />

        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>

      {searchQuery && (
        <div className="bg-gray-100 p-2 border-t">
          <h3 className="text-md font-medium">Search Results for: "{searchQuery}"</h3>
          {searchResults && searchResults.length > 0 ? (
            <ul className="list-disc pl-5 mt-2">
              {searchResults.map((note, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {note.title || "No Title"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No results found</p>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
