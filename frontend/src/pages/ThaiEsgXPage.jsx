import DashboardLayout from '../components/DashboardLayout';
import { Sprout } from 'lucide-react';
import { AMC_COLORS_ESGX, INITIAL_ESGX } from '../data/funds';

const ThaiEsgXPage = () => {
    return (
        <DashboardLayout
            title="ThaiESGX Dashboard"
            icon={Sprout}
            fundType="esgx"
            AMC_COLORS={AMC_COLORS_ESGX}
            initialMockData={INITIAL_ESGX}
        />
    );
};

export default ThaiEsgXPage;
