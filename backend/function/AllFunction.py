from dotenv import load_dotenv
from datetime import datetime
from pathlib import Path
from ratelimit import *
import pandas as pd
import requests
import json
import os



# Load dot env file
load_dotenv(Path(".env"))
  
def ExportExcel(Data, FileName, SheetName):

    if Data.empty:
        print("Can't export excel file : Dataset is empty")
    else:
        # Declare variable and set value
        now = datetime.now()
        FormatNow = now.strftime("%Y%m%d%H%M%S")
        FileName = ("Export_{}.xlsx".format(FormatNow) if FileName == None else ("{}.xlsx".format(FileName) if (FileName in ".xlsx" or FileName in ".xls") else FileName))
        SheetName = ("Data" if SheetName == None else SheetName)
        ExportDF = pd.DataFrame(Data)

        # Export data to excel
        print("Exporting to folder [data]")
        ExportDF.to_excel(excel_writer="data/{}".format(FileName), sheet_name=SheetName , header=True , engine="xlsxwriter")

        print("Export to Excel file Complete! file name [{}]".format(FileName))

def WriteResponseLog(Message,ErrorCode):
    
    now = datetime.now()
    FileName = "log_{}.txt".format(now.strftime("%Y%m%d"))

    # Check if the file exists.
    if os.path.isfile("log/{}".format(FileName)):
        # File exists, write data to file
        file = open('log/{}'.format(FileName), 'a')
    else:
        # file does not exists, create new text file
        file = open('log/{}'.format(FileName), 'w')
    
    # Write text to file
    file.write('{}|{}|{}\n'.format(datetime.now(),ErrorCode,Message))
    file.close()

# rate limit class
## call 10 time in 1 second
class RateLimiter:
    def __init__(self, headers):
        headers = headers
        return
    
    @rate_limited(3000, 300)
    def CallGetAPI(self, headers, url):
        response = requests.get(url, headers=headers)
        if response.status_code != 200 :
            print('Cannot call API: {}'.format(response.status_code))
            WriteResponseLog(url,response.status_code)
            return None
        else:
            return response.json()
        
    @rate_limited(3000 , 300)
    def CallPostAPI(self, headers, data, url):
        DataJson = json.dumps(data , ensure_ascii=False)
        response = requests.post(url=url, data=DataJson, headers=headers)
        if response.status_code != 200 :
            print('Cannot call API: {}'.format(response.status_code))
            WriteResponseLog(url,response.status_code)
            return None
        else:
            return response.json()
      