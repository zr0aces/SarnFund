from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/FundDailyInfo"
API_Key = os.getenv("FundDailyInfoKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## FundDailyInfo/{proj_id}/dailynav/{nav_date}
def fund_dailyinfo_dailynav(proj_fund, nav_date):

    # Set full URL
    CallUrl = "{}/{}/dailynav/{}".format(API_URL, proj_fund, nav_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## FundDailyInfo/{proj_id}/dividend
def fund_dailyinfo_dividend(proj_fund):

    # Set full URL
    CallUrl = "{}/{}/dividend".format(API_URL, proj_fund)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## FundDailyInfo/amc
def fund_dailyinfo_amc():

    # Set full URL
    CallUrl = "{}/amc".format(API_URL)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp