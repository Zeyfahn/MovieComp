import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { DuelProvider } from './context/DuelContext';
import { Navbar } from './components/Navbar';
import { DiscoveryPage } from './components/DiscoveryPage';
import { DuelArena } from './components/DuelArena';
import { RecommendationsSection } from './components/RecommendationsSection';
import { WatchlistPage } from './components/WatchlistPage';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { AuthModal } from './components/AuthModal';
import { PreferencesModal } from './components/PreferencesModal';
import { Footer } from './components/Footer';

export function AppContent() {
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#090B10] text-slate-100">
      {/* Sticky Navigation */}
      <Navbar onSelectMovie={(movie) => setSelectedMovieForDetails(movie)} />

      {/* Main Page Routing */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <DiscoveryPage
                onOpenDetails={(movie) => setSelectedMovieForDetails(movie)}
              />
            }
          />
          <Route path="/duel" element={<DuelArena />} />
          <Route
            path="/recommendations"
            element={
              <RecommendationsSection
                onOpenDetails={(movie) => setSelectedMovieForDetails(movie)}
              />
            }
          />
          <Route
            path="/watchlist"
            element={
              <WatchlistPage
                onOpenDetails={(movie) => setSelectedMovieForDetails(movie)}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer with TMDB attribution */}
      <Footer />

      {/* Global Modals */}
      {selectedMovieForDetails && (
        <MovieDetailsModal
          movie={selectedMovieForDetails}
          onClose={() => setSelectedMovieForDetails(null)}
        />
      )}

      <AuthModal />
      <PreferencesModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <DuelProvider>
            <AppContent />
          </DuelProvider>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
