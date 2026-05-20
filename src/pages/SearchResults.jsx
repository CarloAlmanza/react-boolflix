import React from 'react';
import { useAppContext } from '../context/AppContext';
import Filters from '../components/Filters/Filters';
import Results from '../components/Results/Results';

const SearchResults = () => {
    const {
        movies,
        series,
        isLoading,
        isSearching,
        selectedGenre
    } = useAppContext();

    return (
        <div className="search-results-page">
            <Filters />
            <Results
                movies={movies}
                series={series}
                isLoading={isLoading}
                isSearching={isSearching}
                selectedGenre={selectedGenre}
            />
        </div>
    );
};

export default SearchResults;