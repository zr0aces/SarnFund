import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Leaf } from 'lucide-react';
import { AMC_COLORS_ESG, INITIAL_ESG } from '../data/funds';

const ThaiEsgPage = () => {
    return (
        <DashboardLayout
            title="ThaiESG Dashboard"
            icon={Leaf}
            fundType="thaiesg"
            AMC_COLORS={AMC_COLORS_ESG}
            initialMockData={INITIAL_ESG}
        />
    );
};

export default ThaiEsgPage;
