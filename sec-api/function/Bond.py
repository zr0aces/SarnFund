from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/bond"
API_Key = os.getenv("BondKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## bond/outstanding/issuer
def bond_outs_issuer(IssuerName):

    # Check parameter
    CallUrl = "{}/outstanding/issuer".format(API_URL)
    Data = {
        "IssuerName" : "{}".format(IssuerName)
    }

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## bond/outstanding/issue
def bond_outs_issue(SecurityCode):

    # Check parameter
    CallUrl = "{}/outstanding/issue".format(API_URL)
    Data = {
        "SecurityCode" : "{}".format(SecurityCode)
    }

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/offer_type
def bond_outs_offer_type(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/offer_type".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/coupon
def bond_outs_coupon(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/coupon".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/issue_age
def bond_outs_issue_age(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/issue_age".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/offering_unit
def bond_outs_offering_unit(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/offering_unit".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/issue_rating
def bond_outs_issue_rating(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/issue_rating".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/redemption
def bond_outs_redemption(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/redemption".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/involve_party
def bond_outs_involve_party(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/involve_party".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/investor_type
def bond_outs_investor_type(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/investor_type".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/sector_type
def bond_outs_sector_type(issued_ref_id):

    # Set full URL
    CallUrl = "{}/outstanding/{}/sector_type".format(API_URL , issued_ref_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## bond/outstanding/{issued_ref_id}/outstanding_value/{outstanding_date}
def bond_outs_outstanding_value(issued_ref_id, outstanding_date):

    # Set full URL
    CallUrl = "{}/outstanding/{}/outstanding_value/{}".format(API_URL, issued_ref_id, outstanding_date)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp