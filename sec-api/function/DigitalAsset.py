from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/DigitalAsset"
API_Key = os.getenv("DigitalAssetKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## DigitalAsset/profile/intermediary
def digitalasset_profile_intermediary(IntermediaryName):

    # Check parameter
    CallUrl = "{}/profile/intermediary".format(API_URL)
    Data = {
        "IntermediaryName" : "{}".format(IntermediaryName)
    }

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## DigitalAsset/monthly/{trade_date}/customer
def digitalasset_monthly_customer(trade_date):

    # Set full URL
    CallUrl = "{}/monthly/{}/customer".format(API_URL , trade_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## DigitalAsset/monthly/{trade_date}/asset
def digitalasset_monthly_asset(trade_date):

    # Set full URL
    CallUrl = "{}/monthly/{}/asset".format(API_URL , trade_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## DigitalAsset/monthly/{trade_date}/active_account
def digitalasset_monthly_active_account(trade_date):

    # Set full URL
    CallUrl = "{}/monthly/{}/active_account".format(API_URL , trade_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## DigitalAsset/weekly/{trade_date}/asset
def digitalasset_weekly_asset(trade_date):

    # Set full URL
    CallUrl = "{}/weekly/{}/asset".format(API_URL , trade_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## DigitalAsset/daily/{trade_date}/surv_trade_summary
def digitalasset_daily_surv_trade_summary(trade_date):

    # Set full URL
    CallUrl = "{}/daily/{}/surv_trade_summary".format(API_URL , trade_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## DigitalAsset/daily/{trade_date}/investor_type_summary
def digitalasset_daily_investor_type_summary(trade_date):

    # Set full URL
    CallUrl = "{}/daily/{}/investor_type_summary".format(API_URL , trade_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## DigitalAsset/daily/{trade_date}/dtw_daily_summary
def digitalasset_daily_dtw_daily_summary(trade_date):

    # Set full URL
    CallUrl = "{}/daily/{}/dtw_daily_summary".format(API_URL , trade_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp