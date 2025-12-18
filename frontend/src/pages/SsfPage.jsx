import { Leaf } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { INITIAL_SSF, AMC_COLORS_SSF } from '../data/funds';

const SsfPage = () => {
    return (
        <DashboardLayout
            title="SSF Dashboard"
            icon={Leaf}
            fundType="ssf"
            AMC_COLORS={AMC_COLORS_SSF}
            initialMockData={INITIAL_SSF}
        />
    );
};

export default SsfPage;
