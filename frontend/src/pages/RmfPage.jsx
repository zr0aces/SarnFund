import DashboardLayout from '../components/DashboardLayout';
import { FUND_CATEGORIES, getAmcColorMap } from '../config/fundCategories';

const RmfPage = () => {
    const cat = FUND_CATEGORIES.rmf;
    return (
        <DashboardLayout
            title={cat.title}
            icon={cat.icon}
            fundType="rmf"
            AMC_COLORS={getAmcColorMap('rmf')}
            initialMockData={[]}
        />
    );
};

export default RmfPage;
