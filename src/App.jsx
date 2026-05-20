import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header/Header';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Detail from './pages/Detail';
import { useMoviesAPI } from './hooks/useMoviesAPI';
import './App.css';

const AppContent = () => {
  const { loadGenres } = useMoviesAPI();
  const { isSearching } = useAppContext();

  useEffect(() => {
    loadGenres();
  }, []);

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/detail/:type/:id" element={<Detail />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;