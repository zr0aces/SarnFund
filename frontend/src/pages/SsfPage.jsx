import DashboardLayout from '../components/DashboardLayout';
import { FUND_CATEGORIES, getAmcColorMap } from '../config/fundCategories';

const SsfPage = () => {
    const cat = FUND_CATEGORIES.ssf;
    return (
        <DashboardLayout
            title={cat.title}
            icon={cat.icon}
            fundType="ssf"
            AMC_COLORS={getAmcColorMap('ssf')}
            initialMockData={[]}
        />
    );
};

export default SsfPage;
