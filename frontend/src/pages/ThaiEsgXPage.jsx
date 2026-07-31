import DashboardLayout from '../components/DashboardLayout';
import { FUND_CATEGORIES, getAmcColorMap } from '../config/fundCategories';

const ThaiEsgXPage = () => {
    const cat = FUND_CATEGORIES.esgx;
    return (
        <DashboardLayout
            title={cat.title}
            icon={cat.icon}
            fundType="esgx"
            AMC_COLORS={getAmcColorMap('esgx')}
            initialMockData={[]}
        />
    );
};

export default ThaiEsgXPage;
