import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Trophy } from 'lucide-react';

const AMC_COLORS_RMF = {
    KKP: '#6F42C1',
    SCB: '#4F46E5',
    KBank: '#047857',
    Bualuang: '#1E3A8A',
    TISCO: '#CC0000',
    All: '#4F46E5'
};

const INITIAL_RMF = [
    { id: '1', code: 'KKP GNP RMF-H', name: 'เคเคพี โกลบอล นิว เพอร์สเปกทีฟ RMF', amc: 'KKP', nav: 14.50, ytd: 12.5, return1y: 15.2, return3y: 8.5, return5y: 45.2, risk: 6, policy: 'Global Equity', isNew: false },
    { id: '2', code: 'SCBRMFA', name: 'SCB RMF Active Equity', amc: 'SCB', nav: 18.20, ytd: 8.2, return1y: 11.5, return3y: 5.2, return5y: 35.8, risk: 6, policy: 'Thai Equity', isNew: false },
    { id: '3', code: 'K-CHANGE-RMF', name: 'K Climate Change RMF', amc: 'KBank', nav: 11.80, ytd: 15.2, return1y: 18.9, return3y: 12.5, return5y: 55.4, risk: 7, policy: 'Global Equity ESG', isNew: false },
    { id: '4', code: 'B-INNOTECH-RMF', name: 'Bualuang Global Innovation RMF', amc: 'Bualuang', nav: 22.40, ytd: 22.5, return1y: 28.4, return3y: 15.8, return5y: 85.2, risk: 7, policy: 'Global Tech', isNew: false },
    { id: '5', code: 'TISCOUS-RMF', name: 'TISCO US Equity RMF', amc: 'TISCO', nav: 16.90, ytd: 18.5, return1y: 22.1, return3y: 14.2, return5y: 65.8, risk: 7, policy: 'US Equity', isNew: false },
];

const RmfPage = () => {
    return (
        <DashboardLayout
            title="RMF Dashboard"
            icon={Trophy}
            fundType="rmf"
            initialFunds={INITIAL_RMF}
            AMC_COLORS={AMC_COLORS_RMF}
        />
    );
};

export default RmfPage;
