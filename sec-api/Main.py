# import function for call SEC-API
from function.FundFactsheet import *
from function.FundDailyInfo import *
from function.LicenseCheck import *
from function.PVDFactSheet import *
from function.DigitalAsset import *
from function.AllFunction import *
from function.Onereport import *
from function.Common import *
from function.Bond import *

from pandas import ExcelWriter
import pandas as pd

# Example
# ==== [ข้อมูลกองทุนรวมที่จดทะเบียนในปี 2022 และยัง Active อยู่ในปัจจุบัน และดูสัดส่วนการลงทุนของกองนั้น ๆ] ====

# ดึงรหัส บลจ.
amc = pd.DataFrame(fund_factsheet_amc())

# ดึงกองทุนทั้งหมดภายใต้ บลจ. นั้น ๆ
AllFund = pd.DataFrame()
for idx, row in amc.iterrows():
    AllFund = pd.concat([AllFund, pd.DataFrame(fund_factsheet_fund(row["unique_id"]))] , ignore_index=True)

# filter ให้เหลือเฉพาะกองทุนที่จดทะเบียนในปี 2022 และยังมีสถานะเป็น "จดทะเบียน" 
RegisFund = AllFund[(AllFund['fund_status'] == 'RG') & (AllFund['regis_date'].str.startswith('2022'))]

# ดึงข้อมูลสัดส่วนการลงทุน
TempAsset = pd.DataFrame()
FundAsset = pd.DataFrame()
for idx, row in RegisFund.iterrows():

    TempAsset = pd.DataFrame(fund_factsheet_asset(row['proj_id']))
    TempAsset['proj_id'] = row['proj_id']
    FundAsset = pd.concat([FundAsset, TempAsset], ignore_index=True)

# print(FundAsset)

# Merge RegisFund & FundAsset
MergeFundDetail = pd.merge(RegisFund,FundAsset,on='proj_id', how='right')
MergeAMC = pd.merge(MergeFundDetail, amc, on='unique_id', how='right')

# Format data frame before export
ExportDF = MergeAMC[['unique_id' , 'name_th' , 'name_en' , 'proj_id' , 'regis_id' , 'regis_date' , 'cancel_date', 'proj_name_th' , 'proj_name_en' , 'proj_abbr_name' , 'fund_status' , 'asset_seq' , 'asset_name', 'asset_ratio']]

# Export data frame to excel file
ExportExcel(Data=ExportDF, FileName=None, SheetName=None)
