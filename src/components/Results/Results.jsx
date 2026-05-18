import React from 'react';
import Card from '../Card/Card';
import './Results.css';

const Results = ({ movies, series, isLoading, isSearching, selectedGenre }) => {
    // Combino i risultati come da schema
    const combinedResults = [...movies, ...series];

    // Filtro per genere se selezionato
    const filteredResults = selectedGenre
        ? combinedResults.filter(item => item.genre_ids?.includes(parseInt(selectedGenre)))
        : combinedResults;

    // Stato iniziale: nessuna ricerca effettuata
    if (!isSearching) {
        return (
            <div className="results-empty">
                <div className="empty-state">
                    <span className="empty-icon">🎬</span>
                    <h2>Cerca un film o una serie TV</h2>
                    <p>Utilizza la barra di ricerca sopra per trovare i tuoi contenuti preferiti</p>
                </div>
            </div>
        );
    }

    // Stato di caricamento
    if (isLoading) {
        return (
            <div className="results-loading">
                <div className="loader"></div>
                <p>Caricamento in corso...</p>
            </div>
        );
    }

    // Nessun risultato trovato
    if (filteredResults.length === 0) {
        return (
            <div className="results-empty">
                <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <h2>Nessun risultato trovato</h2>
                    <p>Prova con un'altra parola chiave</p>
                </div>
            </div>
        );
    }

    // Visualizzazione risultati
    return (
        <div className="results">
            <div className="results-header">
                <h2>Risultati trovati: {filteredResults.length}</h2>
            </div>
            <div className="results-grid">
                {filteredResults.map((item) => (
                    <Card key={`${item.media_type}-${item.id}`} item={item} />
                ))}
            </div>
        </div>
    );
};

export default Results;