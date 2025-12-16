import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Leaf } from 'lucide-react';
import { INITIAL_ESG, AMC_COLORS_ESG } from '../data/funds';

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
