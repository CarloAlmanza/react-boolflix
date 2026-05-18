import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useMoviesAPI } from '../../hooks/useMoviesAPI';
import './Filters.css';

const Filters = () => {
    const { selectedGenre, setSelectedGenre } = useAppContext();
    const { allGenres, loadGenres } = useMoviesAPI();

    useEffect(() => {
        loadGenres();
    }, []);

    const allGenresList = [...allGenres.movie, ...allGenres.tv];
    const uniqueGenres = Array.from(
        new Map(allGenresList.map(genre => [genre.id, genre])).values()
    );

    return (
        <div className="filters">
            <label className="filter-label">
                Filtra per genere:
                <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Tutti i generi</option>
                    {uniqueGenres.map(genre => (
                        <option key={genre.id} value={genre.id}>
                            {genre.name}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
};

export default Filters;