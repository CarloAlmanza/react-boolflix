import React from 'react';
import { Outlet } from 'react-router-dom';
import './Main.css';

const Main = () => {
    return (
        <main className="main">
            <Outlet /> {/* Questo renderà le route figlie */}
        </main>
    );
};

export default Main;