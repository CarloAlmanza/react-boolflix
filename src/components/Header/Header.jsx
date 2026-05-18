import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <h1>BoolFlix</h1>
            </div>
            <SearchBar />
        </header>
    );
};

export default Header;