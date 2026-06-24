import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RmfPage from './pages/RmfPage';
import ThaiEsgPage from './pages/ThaiEsgPage';
import ThaiEsgXPage from './pages/ThaiEsgXPage';
import SsfPage from './pages/SsfPage';
import EtfPage from './pages/EtfPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/funds/rmf" element={<RmfPage />} />
                <Route path="/funds/thaiesg" element={<ThaiEsgPage />} />
                <Route path="/funds/thaiesgx" element={<ThaiEsgXPage />} />
                <Route path="/funds/ssf" element={<SsfPage />} />
                <Route path="/funds/etf" element={<EtfPage />} />
                {/* Fallback */}
                <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
