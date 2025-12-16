import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Leaf } from 'lucide-react';

const AMC_COLORS_ESG = {
    KKP: '#6F42C1',
    Krungsri: '#F59E0B',
    Bualuang: '#1E3A8A',
    TISCO: '#CC0000',
    All: '#059669'
};

const INITIAL_ESG = [
    { id: 'k1', code: 'KKP EQ THAI ESG', name: 'เคเคพี หุ้นไทยเพื่อความยั่งยืน', amc: 'KKP', nav: 10.45, ytd: 4.2, return1y: 6.5, risk: 6, type: 'Equity ESG', isNew: false },
    { id: 'ks1', code: 'KFTHAIESG', name: 'กรุงศรีไทยเพื่อความยั่งยืน', amc: 'Krungsri', nav: 9.85, ytd: 3.5, return1y: 5.8, risk: 6, type: 'Equity ESG', isNew: false },
    { id: 'b1', code: 'B-TOP-THAIESG', name: 'บัวหลวงทศพลไทยเพื่อความยั่งยืน', amc: 'Bualuang', nav: 10.80, ytd: 5.5, return1y: 8.2, risk: 6, type: 'Equity ESG', isNew: false },
    { id: 't1', code: 'TISCOThaiESG-A', name: 'ทิสโก้ หุ้นไทยเพื่อความยั่งยืน', amc: 'TISCO', nav: 10.60, ytd: 4.5, return1y: 7.2, risk: 6, type: 'Equity ESG', isNew: false },
];

const ThaiEsgPage = () => {
    return (
        <DashboardLayout
            title="ThaiESG Dashboard"
            icon={Leaf}
            fundType="thaiesg"
            initialFunds={INITIAL_ESG}
            AMC_COLORS={AMC_COLORS_ESG}
        />
    );
};

export default ThaiEsgPage;
