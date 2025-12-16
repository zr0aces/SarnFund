import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RmfPage from './pages/RmfPage';
import ThaiEsgPage from './pages/ThaiEsgPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/funds/rmf" replace />} />
                <Route path="/funds/rmf" element={<RmfPage />} />
                <Route path="/funds/thaiesg" element={<ThaiEsgPage />} />
                {/* Fallback */}
                <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
