from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/pvd/factsheet"
API_Key = os.getenv("PVDFactsheetKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## pvd/factsheet/amc
def pvd_factsheet_amc():

    # Set full URL
    CallUrl = "{}/amc".format(API_URL)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## pvd/factsheet/{unique_id}/fund
def pvd_factsheet_fund(uniique_id):

    # Set full URL
    CallUrl = "{}/{}/fund".format(API_URL, uniique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## pvd/factsheet/{unique_id}/fund
def pvd_factsheet_fund(uniique_id):

    # Check parameter
    if len(uniique_id) == 11 or uniique_id.startswith("C0"):

        # Set full URL
        CallUrl = API_URL + "/{}/fund".format(uniique_id)

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)
    else:
        CallUrl = "{}/fund".format(API_URL)
        Data = {
            "FundName" : "{}".format(uniique_id)
        }

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## pvd/factsheet/{unique_id}/policy
def pvd_factsheet_policy(proj_id):

    # Set full URL
    CallUrl = "{}/{}/policy".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## pvd/factsheet/{unique_id}/return
def pvd_factsheet_return(proj_id):

    # Set full URL
    CallUrl = "{}/{}/return".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## pvd/factsheet/{unique_id}/fee
def pvd_factsheet_fee(proj_id):

    # Set full URL
    CallUrl = "{}/{}/fee".format(API_URL, proj_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## pvd/factsheet/{proj_id}/PVDFullPort/{period}
def pvd_factsheet_pvdFullPort(proj_id, period):

    # Set full URL
    CallUrl = "{}/{}/PVDFullPort/{}".format(API_URL, proj_id, period)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp
