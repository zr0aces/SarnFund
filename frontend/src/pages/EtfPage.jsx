import DashboardLayout from '../components/DashboardLayout';
import { FUND_CATEGORIES, getAmcColorMap } from '../config/fundCategories';

const EtfPage = () => {
    const cat = FUND_CATEGORIES.etf;
    return (
        <DashboardLayout
            title={cat.title}
            icon={cat.icon}
            fundType="etf"
            AMC_COLORS={getAmcColorMap('etf')}
            initialMockData={[]}
        />
    );
};

export default EtfPage;
