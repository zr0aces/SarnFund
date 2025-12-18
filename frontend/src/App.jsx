import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RmfPage from './pages/RmfPage';
import ThaiEsgPage from './pages/ThaiEsgPage';
import LtfPage from './pages/LtfPage';
import SsfPage from './pages/SsfPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/funds/rmf" element={<RmfPage />} />
                <Route path="/funds/thaiesg" element={<ThaiEsgPage />} />
                <Route path="/funds/ltf" element={<LtfPage />} />
                <Route path="/funds/ssf" element={<SsfPage />} />
                {/* Fallback */}
                <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
