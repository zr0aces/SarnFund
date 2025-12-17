from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/FundFactsheet"
API_Key = os.getenv("FundFactsheetKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## FundFactsheet/fund/amc
def fund_factsheet_amc():

    # Set full URL
    CallUrl = API_URL + "/fund/amc"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## FundFactsheet/fund/amc/{unique_id}
def fund_factsheet_fund(FundParam):

    # Check parameter
    if len(FundParam) == 11 or FundParam.startswith("C0"):

        # Set full URL
        CallUrl = API_URL + "/fund/amc/" + FundParam

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)
    else:
        CallUrl = "{}/fund".format(API_URL)
        Data = {
            "name" : "{}".format(FundParam)
        }

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/URLs
def fund_factsheet_urls(proj_fund):

    # Set full URL
    CallUrl = "{}/fund/{}/URLs".format(API_URL , proj_fund)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/IPO
def fund_factsheet_ipo(proj_fund):

    # Set full URL
    CallUrl = "{}/fund/{}/IPO".format(API_URL, proj_fund)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/investment
def fund_factsheet_investment(proj_fund):
    
    # Set full URL
    CallUrl = "{}/fund/{}/investment".format(API_URL, proj_fund)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/project_type
def fund_factsheet_project_type(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/project_type".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/policy
def fund_factsheet_policy(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/policy".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/specification
def fund_factsheet_specification(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/specification".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/feeder_fund
def fund_factsheet_feeder_fund(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/feeder_fund".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/redemption
def fund_factsheet_redemption(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/redemption".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/suitability
def fund_factsheet_suitability(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/suitability".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/risk
def fund_factsheet_risk(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/risk".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/asset
def fund_factsheet_asset(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/asset".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/turnover_ratio
def fund_factsheet_turnover_ratio(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/turnover_ratio".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/return
def fund_factsheet_return(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/return".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/buy_and_hold
def fund_factsheet_buy_and_hold(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/buy_and_hold".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/benchmark
def fund_factsheet_benchmark(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/benchmark".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/fund_compare
def fund_factsheet_fund_compare(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/fund_compare".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/class_fund
def fund_factsheet_class_fund(ClassParam):

    # Check parameter
    if ClassParam.startswith("M0"):

        # Set full URL
        CallUrl = "{}/fund/{}/class_fund".format(API_URL, ClassParam)

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)
    else:
        CallUrl = "{}/fund/class_fund".format(API_URL)
        Data = {
            "name" : "{}".format(ClassParam)
        }

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/performance
def fund_factsheet_performance(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/performance".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/5YearLost
def fund_factsheet_5YearLost(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/5YearLost".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/dividend
def fund_factsheet_dividend(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/dividend".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/fee
def fund_factsheet_fee(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/fee".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/InvolveParty
def fund_factsheet_InvolveParty(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/InvolveParty".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/FundPort/{period}
def fund_factsheet_FundPort(proj_id, period):

    # Set full URL
    CallUrl = "{}/fund/{}/FundPort/{}".format(API_URL, proj_id, period)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/FundFullPort/{period}
def fund_factsheet_FundFullPort(proj_id, period):

    # Set full URL
    CallUrl = "{}/fund/{}/FundFullPort/{}".format(API_URL, proj_id, period)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/FundTop5/{period}
def fund_factsheet_FundTop5(proj_id, period):

    # Set full URL
    CallUrl = "{}/fund/{}/FundTop5/{}".format(API_URL, proj_id, period)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/FundHist
def fund_factsheet_FundHist(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/FundHist".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)

    return resp

## FundFactsheet/fund/{proj_id}/FundTrackingError
def fund_factsheet_FundTrackingError(proj_id):

    # Set full URL
    CallUrl = "{}/fund/{}/FundTrackingError".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self = None, headers=headers, url=CallUrl)
    
    return resp

