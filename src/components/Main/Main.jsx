import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Filters from '../Filters/Filters';
import Results from '../Results/Results';
import Homepage from '../Homepage/Homepage';
import './Main.css';

const Main = () => {
    const {
        movies,
        series,
        isLoading,
        isSearching,
        selectedGenre
    } = useAppContext();

    // Se l'utente ha fatto una ricerca, mostro i risultati
    if (isSearching) {
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
    }

    // Altrimenti mostro la homepage con i contenuti suggeriti
    return (
        <main className="main">
            <Homepage />
        </main>
    );
};

export default Main;