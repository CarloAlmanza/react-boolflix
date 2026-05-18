import React from 'react';
import './Loader.css';

const Loader = () => {
    return (
        <div className="global-loader">
            <div className="loader-spinner"></div>
            <p>Caricamento...</p>
        </div>
    );
};

export default Loader;