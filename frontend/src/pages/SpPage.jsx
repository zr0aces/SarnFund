import DashboardLayout from '../components/DashboardLayout';
import { FUND_CATEGORIES, getAmcColorMap } from '../config/fundCategories';

const SpPage = () => {
    const cat = FUND_CATEGORIES.sp;
    return (
        <DashboardLayout
            title={cat.title}
            icon={cat.icon}
            fundType="sp"
            AMC_COLORS={getAmcColorMap('sp')}
            initialMockData={[]}
        />
    );
};

export default SpPage;
