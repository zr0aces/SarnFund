import { Leaf } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { INITIAL_ESG, AMC_COLORS_ESG } from '../data/funds';

const SsfPage = () => {
    return (
        <DashboardLayout
            title="SSF Dashboard"
            icon={Leaf}
            fundType="ssf"
            AMC_COLORS={AMC_COLORS_ESG} // Reuse ESG colors or define new ones if needed
            initialMockData={INITIAL_ESG} // Using ESG mock data as placeholder
        />
    );
};

export default SsfPage;
