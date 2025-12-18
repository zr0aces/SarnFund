import { BarChart3 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { INITIAL_RMF, AMC_COLORS_RMF } from '../data/funds';

const LtfPage = () => {
    return (
        <DashboardLayout
            title="LTF Dashboard"
            icon={BarChart3}
            fundType="ltf"
            AMC_COLORS={AMC_COLORS_RMF}
            initialMockData={INITIAL_RMF} // Using RMF mock data as placeholder if needed
        />
    );
};

export default LtfPage;
