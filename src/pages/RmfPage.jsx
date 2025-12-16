import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Trophy } from 'lucide-react';
import { AMC_COLORS_RMF } from '../data/funds';

const RmfPage = () => {
    return (
        <DashboardLayout
            title="RMF Dashboard"
            icon={Trophy}
            fundType="rmf"
            AMC_COLORS={AMC_COLORS_RMF}
        />
    );
};

export default RmfPage;
