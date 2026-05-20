import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useMoviesAPI } from '../../hooks/useMoviesAPI';
import './SearchBar.css';

const SearchBar = () => {
    // Stato locale per il testo nell'input
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);     // Suggerimenti per l'autocomplete
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Refs
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Context
    const {
        setMovies,
        setSeries,
        setIsLoading,
        setIsSearching,
        setSearch,
        setShowHomepage,
        setErrorMsg,
        resetSearch,
        activeTab,
        setActiveTab
    } = useAppContext();

    // Hooks personalizzati
    const { searchAll, searchSuggestions } = useMoviesAPI();

    // Effetto per il debounce della ricerca suggerimenti
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (inputValue.trim().length >= 2) {
                fetchSuggestions(inputValue);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue]);

    // Chiudi suggerimenti quando clicchi fuori
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Funzione per ottenere suggerimenti
    const fetchSuggestions = async (query) => {
        if (searchSuggestions) {
            const results = await searchSuggestions(query);
            setSuggestions(results.slice(0, 5)); // Solo i primi 5 suggerimenti
            setShowSuggestions(true);
        }
    };

    // Funzione principale di ricerca
    const handleSearch = async (searchQuery = inputValue) => {
        // Validazione input
        if (!searchQuery.trim()) {
            setErrorMsg('Per favore, inserisci un titolo da cercare');
            return;
        }

        // Se è uguale alla ricerca corrente, non rifare la chiamata
        if (searchQuery === inputValue && !isTyping) {
            // Forza comunque un refresh se vuoi
        }

        // Attiva stati di caricamento
        setIsLoading(true);
        setIsSearching(true);
        setSearch(searchQuery);
        setShowHomepage(false); // Nasconde la homepage quando si cerca
        setShowSuggestions(false); // Chiude i suggerimenti
        setIsTyping(false);

        try {
            // Esegue la ricerca di film e serie in parallelo
            const { movies, series } = await searchAll(searchQuery);

            // Aggiorna i risultati nel Context
            setMovies(movies);
            setSeries(series);

            // Se non ci sono risultati, mostra un messaggio
            if (movies.length === 0 && series.length === 0) {
                setErrorMsg(`Nessun risultato trovato per "${searchQuery}"`);
            }
        } catch (error) {
            console.error('Errore durante la ricerca:', error);
            setErrorMsg('Si è verificato un errore durante la ricerca. Riprova più tardi.');
        } finally {
            // Disattiva stato di caricamento
            setIsLoading(false);
        }
    };

    // Gestisce il cambio di tab (film/serie/tutti)
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Gestisce la pressione del tasto Invio
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Gestisce il click su un suggerimento
    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion.title || suggestion.name);
        setShowSuggestions(false);
        handleSearch(suggestion.title || suggestion.name);
    };

    // Gestisce il reset della ricerca
    const handleReset = () => {
        setInputValue('');
        resetSearch();
        setSuggestions([]);
        setShowSuggestions(false);
        setIsTyping(false);
    };

    // Gestisce il focus sull'input
    const handleFocus = () => {
        if (inputValue.trim().length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    return (
        <div className="search-bar-container">
            <div className="search-wrapper">
                {/* Input di ricerca */}
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Cerca un film o una serie TV..."
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsTyping(true);
                        }}
                        onKeyPress={handleKeyPress}
                        onFocus={handleFocus}
                    />

                    {/* Bottone reset (X) - appare solo se c'è testo */}
                    {inputValue && (
                        <button className="search-clear" onClick={handleReset}>
                            ✕
                        </button>
                    )}

                    {/* Bottone cerca */}
                    <button className="search-button" onClick={() => handleSearch()}>
                        Cerca
                    </button>
                </div>

                {/* Suggerimenti autocomplete */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="search-suggestions" ref={suggestionsRef}>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.id}-${index}`}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.poster_path && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${suggestion.poster_path}`}
                                        alt={suggestion.title || suggestion.name}
                                        className="suggestion-poster"
                                    />
                                )}
                                <div className="suggestion-info">
                                    <div className="suggestion-title">
                                        {suggestion.title || suggestion.name}
                                    </div>
                                    <div className="suggestion-year">
                                        {suggestion.release_date?.split('-')[0] ||
                                            suggestion.first_air_date?.split('-')[0] ||
                                            'Anno sconosciuto'}
                                    </div>
                                </div>
                                <div className="suggestion-type">
                                    {suggestion.title ? '🎬 Film' : '📺 Serie'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs per filtrare i risultati (visibili solo durante la ricerca) */}
            {useAppContext().isSearching && (
                <div className="search-tabs">
                    <button
                        className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => handleTabChange('all')}
                    >
                        Tutti
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'movies' ? 'active' : ''}`}
                        onClick={() => handleTabChange('movies')}
                    >
                        🎬 Film
                    </button>
                    <button
                        className={`search-tab ${activeTab === 'tv' ? 'active' : ''}`}
                        onClick={() => handleTabChange('tv')}
                    >
                        📺 Serie TV
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchBar;