import React, { createContext, useState, useContext } from 'react';

// Creiamo il Context che conterrà tutti i dati globali
const AppContext = createContext();

// Hook personalizzato per usare il Context più facilmente
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};

// Provider che avvolge tutta l'app e fornisce i dati
export const AppProvider = ({ children }) => {
    // STATI PER LA RICERCA
    const [movies, setMovies] = useState([]);        // Array dei film trovati dalla ricerca
    const [series, setSeries] = useState([]);        // Array delle serie trovate dalla ricerca
    const [search, setSearch] = useState('');        // Testo della ricerca effettuata
    const [isLoading, setIsLoading] = useState(false); // Flag: sta caricando i risultati?
    const [isSearching, setIsSearching] = useState(false); // Flag: l'utente ha effettuato una ricerca?

    // STATI PER I FILTRI
    const [selectedGenre, setSelectedGenre] = useState(''); // Genere selezionato per filtrare

    // STATI PER L'HOMEPAGE
    const [showHomepage, setShowHomepage] = useState(true); // Flag: mostra homepage o risultati ricerca?
    const [homepageData, setHomepageData] = useState({     // Dati della homepage (opzionale)
        trending: [],
        popular: [],
        topRated: []
    });

    // STATI PER L'INTERFACCIA UTENTE
    const [error, setError] = useState(null);              // Messaggio di errore globale
    const [activeTab, setActiveTab] = useState('all');     // Tab attivo: 'all', 'movies', 'tv'

    // Unisco film e serie in un unico array per visualizzarli insieme
    const combinedResults = [...movies, ...series];

    // Filtro i risultati in base al tab selezionato
    const getFilteredByTab = () => {
        if (activeTab === 'movies') {
            return movies;
        }
        if (activeTab === 'tv') {
            return series;
        }
        return combinedResults;
    };

    // Contatore totale dei risultati
    const totalResults = movies.length + series.length;

    // Funzione per resettare la ricerca e tornare alla homepage
    const resetSearch = () => {
        setMovies([]);
        setSeries([]);
        setSearch('');
        setIsSearching(false);
        setShowHomepage(true);
        setError(null);
        setActiveTab('all');
    };

    // Funzione per impostare un errore
    const setErrorMsg = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000); // Auto-cancella dopo 5 secondi
    };

    // Funzione per pulire tutti gli stati
    const clearAll = () => {
        setMovies([]);
        setSeries([]);
        setSearch('');
        setIsLoading(false);
        setIsSearching(false);
        setSelectedGenre('');
        setShowHomepage(true);
        setError(null);
        setActiveTab('all');
    };

    // Tutti i valori che rendiamo disponibili ai componenti figli
    const value = {
        // Stati
        movies,
        series,
        search,
        isLoading,
        isSearching,
        selectedGenre,
        showHomepage,
        homepageData,
        error,
        activeTab,

        // Setter per modificare gli stati
        setMovies,
        setSeries,
        setSearch,
        setIsLoading,
        setIsSearching,
        setSelectedGenre,
        setShowHomepage,
        setHomepageData,
        setError,
        setActiveTab,

        // Valori derivati / calcolati
        combinedResults,
        totalResults,

        // Funzioni di utilità
        resetSearch,
        setErrorMsg,
        clearAll,
        getFilteredByTab
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};