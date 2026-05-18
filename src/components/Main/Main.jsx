import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Filters from '../Filters/Filters';
import Results from '../Results/Results';
import './Main.css';

const Main = () => {
    // Prelevo i valori dal Context
    const {
        movies,
        series,
        isLoading,
        isSearching,
        selectedGenre
    } = useAppContext();

    return (
        <main className="main">
            <Filters />
            <Results
                movies={movies}
                series={series}
                isLoading={isLoading}
                isSearching={isSearching}
                selectedGenre={selectedGenre}
            />
        </main>
    );
};

export default Main;