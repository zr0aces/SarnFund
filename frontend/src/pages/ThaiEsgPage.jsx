import DashboardLayout from '../components/DashboardLayout';
import { FUND_CATEGORIES, getAmcColorMap } from '../config/fundCategories';

const ThaiEsgPage = () => {
    const cat = FUND_CATEGORIES.esg;
    return (
        <DashboardLayout
            title={cat.title}
            icon={cat.icon}
            fundType="esg"
            AMC_COLORS={getAmcColorMap('esg')}
            initialMockData={[]}
        />
    );
};

export default ThaiEsgPage;
