import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useMoviesAPI } from '../../hooks/useMoviesAPI';
import './SearchBar.css';

const SearchBar = () => {
    const [inputValue, setInputValue] = useState('');
    const { setMovies, setSeries, setIsLoading, setIsSearching, setSearch } = useAppContext();
    const { searchAll } = useMoviesAPI();

    const handleSearch = async () => {
        if (!inputValue.trim()) return;

        setIsLoading(true);
        setIsSearching(true);
        setSearch(inputValue);

        const { movies, series } = await searchAll(inputValue);

        setMovies(movies);
        setSeries(series);
        setIsLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Cerca un film o una serie TV..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
                🔍 Cerca
            </button>
        </div>
    );
};

export default SearchBar;