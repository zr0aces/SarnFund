from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/LicenseCheck/licensee"
API_Key = os.getenv("LicenseCheckKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## LicenseCheck/licensee/person
def licensecheck_lcs_person(person_name, regis_sale_no):

    # Check parameter
    CallUrl = "{}/person".format(API_URL)
    Data = {
        "Name" : "{}".format(person_name),
        "regis_sale_no" : "{}".format(regis_sale_no)
    }

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## LicenseCheck/licensee/company
def licensecheck_lcs_company(CompName):

    # Check parameter
    if CompName != None:

        # Set full URL
        CallUrl = API_URL + "/company"

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)
    else:
        CallUrl = "{}/company".format(API_URL)
        Data = {
            "Name" : "{}".format(CompName)
        }

        # Call API
        print("preparing to call the API [{}]".format(CallUrl))
        resp = RateLimiter.CallPostAPI(self=None, headers=headers , data=Data, url=CallUrl)

    return resp

## LicenseCheck/licensee/person/{unique_id}/license
def licensecheck_lcs_person_license(unique_id):

    # Set full URL
    CallUrl = "{}/person/{}/license".format(API_URL , unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## LicenseCheck/licensee/company/{unique_id}/personnel
def licensecheck_lcs_company_personnel(unique_id):

    # Set full URL
    CallUrl = "{}/company/{}/personnel".format(API_URL , unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## LicenseCheck/licensee/person/{unique_id}/work_info
def licensecheck_lcs_person_workinfo(unique_id):

    # Set full URL
    CallUrl = "{}/person/{}/work_info".format(API_URL , unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## LicenseCheck/licensee/company/{unique_id}/license
def licensecheck_lcs_company_license(unique_id):

    # Set full URL
    CallUrl = "{}/company/{}/license".format(API_URL , unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## LicenseCheck/licensee/company/{unique_id}/business_act
def licensecheck_lcs_company_business_act(unique_id):

    # Set full URL
    CallUrl = "{}/company/{}/business_act".format(API_URL , unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## LicenseCheck/licensee/{unique_id}/enforcement/{case_id}
def licensecheck_lcs_enforcement(unique_id, case_id):

    # Set full URL
    if case_id != None:
        CallUrl = "{}/{}/enforcement".format(API_URL , unique_id)
    else:
        CallUrl = "{}/{}/enforcement/{}".format(API_URL, unique_id, case_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## LicenseCheck/licensee/investoralert/alertdetail
def licensecheck_lcs_alertdetail():

    # Set full URL
    CallUrl = "{}/investoralert/alertdetail".format(API_URL)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## LicenseCheck/licensee/investoralert/{case_id}/alertaction
def licensecheck_lcs_alertaction(case_id):

    # Set full URL
    CallUrl = "{}/investoralert/{}/alertaction".format(API_URL, case_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp