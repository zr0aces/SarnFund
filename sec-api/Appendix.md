# Function list
---

## **Bond API**

| **API** | **Function** |
| :-------- | :-------- |
| [01.ชื่อผู้ออกและเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=01-Outstanding-issuer) | `bond_outs_issuer(IssuerName)` |
| [02.ชื่อตราสารหนี้](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=02-Outstanding-Issue) | `bond_outs_issue(SecurityCode)` |
| [03.ลักษณะการเสนอขาย](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=03-Outstanding-OfferType) | `bond_outs_offer_type(issued_ref_id)` |
| [04.ประเภทและอัตราดอกเบี้ยหรือผลตอบแทน](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=04-Outstanding-Coupon) | `bond_outs_coupon(issued_ref_id)` |
| [05.อายุตราสาร](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=05-Outstanding-IssueAge) | `bond_outs_issue_age(issued_ref_id)` |
| [06.จำนวนและมูลค่าที่เสนอขาย](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=06-Outstanding-OfferingUnit) | `bond_outs_offering_unit(issued_ref_id)` |
| [07. การจัดอันดับความน่าเชื่อถือของตราสาร](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=07-Outstanding-IssueRating) | `bond_outs_issue_rating(issued_ref_id)` |
| [08.รูปแบบการไถ่ถอนเงินต้น](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=08-Outstanding-Redemption) | `bond_outs_redemption(issued_ref_id)` |
| [09.ผู้เกี่ยวข้องกับการเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=09-Outstanding-InvolveParty) | `bond_outs_involve_party(issued_ref_id)` |
| [10.ประเภทผู้ลงทุน](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=10-Outstanding-InvestorType) | `bond_outs_investor_type(issued_ref_id)` |
| [11.ประเภทกลุ่มหมวดอุตสาหกรรม](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=11-Outstanding-SectorType) | `bond_outs_sector_type(issued_ref_id)` |
| [12.มูลค่าคงค้างตราสารหนี้](https://api-portal.sec.or.th/api-details#api=630c841b63d23a78fd602ffe&operation=12-Outstanding-OutstandingValue) | `bond_outs_outstanding_value(issued_ref_id, outstanding_date)` |

---

## **Common API**

| **API** | **Function** |
| :-------- | :-------- |
| [01.ประเภทความเห็นชอบนิติบุคคลของสำนักงาน](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_license_type_company()` |
| [02.การประกอบธุรกิจของนิติบุคคลที่ได้รับความเห็นชอบจากสำนักงาน](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_business_act_company()` |
| [03.ประเภทความเห็นชอบชอบบุคคลของสำนักงาน](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_license_type_person()` |
| [04.การปฏิบัติหน้าที่ของบุคคลที่ได้รับความเห็นชอบของสำนักงาน](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_role_person()` |
| [05.ประเภท สินทรัพย์/หนี้สิน ใน Fund Portfolio](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_fund_portfolio_asset_type()` |
| [06.ประเภทหลักทรัพย์ในการออกและเสนอขายหลักทรัพย์](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_product_secu_type()` |
| [07.ประเภทการเสนอขายในการออกและเสนอขายหลักทรัพย์](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_product_offering_type()` |
| [08.สกุลเงิน](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_product_currency_code()` |
| [09.ประเภทและอัตราดอกเบี้ยหรืออัตราผลตอบแทนในการออกและเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_product_debenture_coupon_code()` |
| [10.ประเภทการชำระคืนเงินต้นในการออกและเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_product_debenture_redemption_code()` |
| [11.ประเภทสิทธิเรียกไถ่ถอนในการออกและเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_product_debenture_embedded_code()` |
| [12.ประเภทการมีประกันในการออกและเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_product_debenture_secured_code()` |
| [13.ประเภทลักษณะการกระทำ](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_investoralert_action_type()` |
| [14.ผู้เกี่ยวข้องกับการออกและเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_bond_function_type()` |
| [15.ประเภทบริษัทที่ออกและเสนอขายตราสารหนี้](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_bond_corporation_type()` |
| [16.ประเภทผู้ลงทุนในสินทรัพย์ดิจิทัล](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_digitalasset_customer_type()` |
| [17.ประเภทสกุลเงินดิจิทัล](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_digitalasset_asset_type()` |
| [18.นโยบายการลงทุนของ PVD](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_pvd_policy_code()` |
| [19.งบการเงินและอัตราส่วนทางการเงิน](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_onereport_financial_statement()` |
| [20.ประเภทผลการดำเนินงานด้านสังคม](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_onereport_social_performance_code()` |
| [21.ประเภทความเสี่ยง](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_onereport_risk_code()` |
| [22.ประเภทรายได้จากต่างประเทศ](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_onereport_export_code()` |
| [23.ประเภทสิ่งแวดล้อม](https://api-portal.sec.or.th/api-details#api=common-api) | `ref_onereport_environment_code()` |

---

## **Digital Asset API**

| **API** | **Function** |
| :-------- | :-------- |
| [01. ผู้ประกอบธุรกิจสินทรัพย์ดิจิทัล](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_profile_intermediary(IntermediaryName)` |
| [02. มูลค่าซื้อขายรายเดือนจำแนกตามประเภทผู้ลงทุน](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_monthly_customer(trade_date)` |
| [03. มูลค่าซื้อขายรายเดือน จำแนกตามสินทรัพย์ดิจิทัล](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_monthly_asset(trade_date)` |
| [04. จำนวนบัญชีซื้อขายสินทรัพย์ดิจิทัลที่ active รายเดือน แยกตามประเภทผู้ลงทุน](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_monthly_active_account(trade_date)` |
| [05. มูลค่าซื้อขายรายสัปดาห์ จำแนกตามสินทรัพย์ดิจิทัล](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_weekly_asset(trade_date)` |
| [06. ข้อมูลซื้อขาย ohlcv แต่ละคู่ asset-currency แต่ละผู้ประกอบธุรกิจ แบบรายวัน](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_daily_surv_trade_summary(trade_date)` |
| [07. ข้อมูลการซื้อขายตามประเภทของผู้ลงทุน แต่ละคู่ asset-currency แบบรายวัน](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_daily_investor_type_summary(trade_date)` |
| [08. ข้อมูลการฝากถอนและโอนสินทรัพย์ตามประเภทผู้ลงทุน แต่ละสินทรัพย์ แต่ละประเภทธุรกรรม แบบรายวัน](https://api-portal.sec.or.th/api-details#api=digital-asset-api) | `digitalasset_daily_dtw_daily_summary(trade_date)` |

---

## **Fund Daily Info API**

| **API** | **Function** |
| :-------- | :-------- |
| [01. NAV กองทุนรวมรายวัน](https://api-portal.sec.or.th/api-details#api=fund-daily-info) | `fund_dailyinfo_dailynav(proj_fund, nav_date)` |
| [02. ประวัติการจ่ายเงินปันผลของกองทุน](https://api-portal.sec.or.th/api-details#api=fund-daily-info) | `fund_dailyinfo_dividend(proj_fund)` |
| [03. รายชื่อบริษัทที่ส่งข้อมูลรายวัน](https://api-portal.sec.or.th/api-details#api=fund-daily-info) | `fund_dailyinfo_amc()` |

---

## **Fund Factsheet API**

| **API** | **Function** |
| :-------- | :-------- |
| [01. รายชื่อ บลจ.](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_amc()` |
| [02. กองทุนภายใต้การบริหารจัดการของบลจ.](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_fund(FundParam)` |
| [03. ค้นหาชื่อกองทุนด้วยชื่อย่อหรือชื่อกองทุนบางส่วน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_fund(FundParam)` |
| [04. URL ของ Fact Sheet และรายงานประจำปีของกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_urls(proj_fund)` |
| [05. การเสนอขาย](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_ipo(proj_fund)` |
| [06. มูลค่าหน่วยลงทุน/จำนวนหน่วยลงทุนในการสั่งซื้อขาย/คงเหลือ](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_investment(proj_fund)` |
| [07. ลักษณะและอายุโครงการ](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_project_type(proj_id)` |
| [08. ประเภทกองทุนตามนโยบายกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_policy(proj_id)` |
| [09. ประเภทกองทุนตามลักษณะพิเศษ](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_specification(proj_id)` |
| [10. ประเภทกองทุน Feeder Fund (เฉพาะกรณีที่เป็น Feeder Fund เท่านั้น)](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_feeder_fund(proj_id)` |
| [11. ระยะเวลาขายและรับซื้อคืน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_redemption(proj_id)` |
| [12. ความเหมาะสมกับผู้ลงทุนและความเสี่ยงของกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_suitability(proj_id)` |
| [13. ปัจจัยความเสี่ยงที่สำคัญ](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_risk(proj_id)` |
| [14. สัดส่วนประเภททรัพย์สินที่ลงทุนของกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_asset(proj_id)` |
| [15. อัตราส่วนหมุนเวียนการลงทุนของกองทุนรวม](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_turnover_ratio(proj_id)` |
| [16. ประมาณผลตอบแทนและระยะเวลาการลงทุนที่กองทุนจะได้รับ (โดยประมาณ)](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_return(proj_id)` |
| [17. ประมาณการพอร์ตการลงทุนของกองทุน Buy & Hold](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_buy_and_hold(proj_id)` |
| [18. ดัชนีชี้วัดกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_benchmark(proj_id)` |
| [19. ประเภทกองทุนรวมเพื่อใช้เปรียบเทียบผลการดำเนินงาน ณ จุดขาย](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_fund_compare(proj_id)` |
| [20. ประเภทหน่วยลงทุนที่มีในกองทุน (ถ้ามีมากกว่า 1 ประเภท)](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_class_fund(ClassParam)` |
| [21. ค้นหารหัสกองลงทุนด้วยชื่อย่อกองทุนหรือชื่อย่อชนิดหน่วยลงทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_class_fund(ClassParam)` |
| [22. ผลการดำเนินงานย้อนหลังของกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_performance(proj_id)` |
| [23. ผลขาดทุนสูงสุดในช่วง 5 ปีและความผันผวนของผลการดำเนินงานย้อนหลัง 5 ปี](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_5YearLost(proj_id)` |
| [24. นโยบายการจ่ายเงินปันผลตามชนิดหน่วยลงทุนของกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_dividend(proj_id)` |
| [25. ค่าธรรมเนียมกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_fee(proj_id)` |
| [26. ผู้เกี่ยวข้องกับกองทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_InvolveParty(proj_id)` |
| [27. การลงทุนของกองทุนรวม ณ สิ้นสุดวันทำการแต่ละรอบไตรมาส](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_FundPort(proj_id, period)` |
| [28. สัดส่วนของการลงทุนของกองทุนรวม](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_FundFullPort(proj_id, period)` |
| [29. หลักทรัพย์ 5 อันดับแรกที่ลงทุน](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_FundTop5(proj_id, period)` |
| [30. ประวัติการเปลี่ยนชื่อ / นโยบาย / การลงทุนต่างประเทศ / ลักษณะโครงการ](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_FundHist(proj_id)` |
| [31. ความผันผวนของส่วนต่างของผลตอบแทนเฉลี่ยของกองทุนรวมและผลตอบแทนของดัชนีอ้างอิงย้อนหลัง 1 ปี (Tracking Error)](https://api-portal.sec.or.th/api-details#api=5a28f6df2b3a6d1788d2025c) | `fund_factsheet_FundTrackingError(proj_id)` |

---

## **License Check API**

| **API** | **Function** |
| :-------- | :-------- |
| [01. ค้นหาบุคคลที่ได้รับความเห็นชอบจากสำนักงานด้วยส่วนหนึ่งของชื่อหรือเลขทะเบียน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_person(person_name, regis_sale_no)` |
| [02. นิติบุคคลที่เคยได้รับใบอนุญาตจากสำนักงาน หรือเคยจดทะเบียนประกอบธุรกิจกับสำนักงาน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_company(CompName)` |
| [03. นิติบุคคลที่ได้รับความเห็นชอบจากสำนักงานด้วยส่วนหนึ่งของชื่อ](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_person_license(unique_id)` |
| [04. ประเภทความเห็นชอบของบุคคลที่ได้รับความเห็นชอบจากสำนักงาน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_company_personnel(unique_id)` |
| [05. การปฏิบัติหน้าที่ของบุคคลภายใต้นิติบุคคล](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_person_workinfo(unique_id)` |
| [06. การปฎิบัติหน้าที่บุคคลที่ได้รับความเห็นชอบจากสำนักงาน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_company_license(unique_id)` |
| [07. ประเภทใบอนุญาต/การจดทะเบียนของนิติบุคคลที่ได้รับใบอนุญาตจากสำนักงาน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_company_business_act(unique_id)` |
| [08. การประกอบธุรกิจในปัจจุบันของนิติบุคคลที่ได้รับใบอนุญาตจากสำนักงาน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_enforcement(unique_id, case_id)` |
| [09. ประเภทความผิดและการกระทำของบุคคล/นิติบุคคลที่ได้รับความเห็นชอบ/ใบอนุญาตของสำนักงาน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_enforcement(unique_id, case_id)` |
| [10. การดำเนินการกับความผิดของบุคคล/นิติบุคคลที่ได้รับความเห็นชอบ/ใบอนุญาตของสำนักงาน](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_alertdetail()` |
| [11. รายละเอียดข้อมูลเตือนผู้ลงทุน (Investor Alert)](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `licensecheck_lcs_alertaction(case_id)` |
| [12. ลักษณะการกระทำ (Investor Alert)](https://api-portal.sec.or.th/api-details#api=5a28f5682b3a6d1788d2025b) | `` |

---

## **PVD Dashboard API**

| **API** | **Function** |
| :-------- | :-------- |
| [01.รายชื่อบริษัทหลักทรัพย์จัดการกองทุน](https://api-portal.sec.or.th/api-details#api=pvd-factsheet) | `pvd_factsheet_amc()` |
| [02.กองทุนภายใต้การบริหารจัดการของบริษัทหลักทรัพย์จัดการกองทุน](https://api-portal.sec.or.th/api-details#api=pvd-factsheet) | `pvd_factsheet_fund(uniique_id)` |
| [03.กองทุนภายใต้การบริหารจัดการของบริษัทหลักทรัพย์จัดการกองทุน](https://api-portal.sec.or.th/api-details#api=pvd-factsheet) | `pvd_factsheet_policy(proj_id)` |
| [04.นโยบายการลงทุนของกองทุนสำรองเลี้ยงชีพ](https://api-portal.sec.or.th/api-details#api=pvd-factsheet) | `pvd_factsheet_return(proj_id)` |
| [05.ผลตอบแทนย้อนหลัง](https://api-portal.sec.or.th/api-details#api=pvd-factsheet) | `pvd_factsheet_fee(proj_id)` |
| [06.ค่าธรรมเนียม](https://api-portal.sec.or.th/api-details#api=pvd-factsheet) | `pvd_factsheet_pvdFullPort(proj_id, period)` |
| [07.สัดส่วนของการลงทุนของกองทุนสำรองเลี้ยงชีพ](https://api-portal.sec.or.th/api-details#api=pvd-factsheet) | `` |

---