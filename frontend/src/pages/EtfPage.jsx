import DashboardLayout from '../components/DashboardLayout';
import { TrendingUp } from 'lucide-react';
import { AMC_COLORS_ETF, INITIAL_ETF } from '../data/funds';

const EtfPage = () => {
    return (
        <DashboardLayout
            title="ETF Dashboard"
            icon={TrendingUp}
            fundType="etf"
            AMC_COLORS={AMC_COLORS_ETF}
            initialMockData={INITIAL_ETF}
        />
    );
};

export default EtfPage;
