import React, { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header/Header';
import Main from './components/Main/Main';
import { useMoviesAPI } from './hooks/useMoviesAPI';
import './App.css';

const AppContent = () => {
  const { loadGenres } = useMoviesAPI();

  useEffect(() => {
    loadGenres();
  }, []);

  return (
    <div className="app">
      <Header />
      <Main />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;