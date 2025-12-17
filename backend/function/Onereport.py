from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/onereport"
API_Key = os.getenv("OnereportKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## onereport/sbo/{report_year}/product_income/{language}
def onereport_sbo_info(report_year , language):

    # Set full URL
    CallUrl = "{}/sbo/{}/info/{}".format(API_URL , report_year, language)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/sbo/{report_year}/product_income/{unique_id}
def onereport_sbo_product_income(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/sbo/{}/product_income/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/sbo/{report_year}/risk/{unique_id}
def onereport_sbo_risk(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/sbo/{}/risk/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/sustainability/{report_year}/detail/{unique_id}
def onereport_sustainability_detail(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/sustainability/{}/detail/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/sustainability/{report_year}/humanrights_issue/{unique_id}
def onereport_sustainability_humanrights_issue(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/sustainability/{}/humanrights_issue/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/scp/{report_year}/labor_dispute/{unique_id}
def onereport_scp_labor_dispute(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/scp/{}/labor_dispute/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/scp/{report_year}/csr_activity/{unique_id}
def onereport_scp_csr_activity(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/scp/{}/csr_activity/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/cgp/{report_year}/governance/{unique_id}
def onereport_cgp_governance(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/cgp/{}/governance/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/cgp/{report_year}/director/{unique_id}
def onereport_cgp_director(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/cgp/{}/director/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/cgp/{report_year}/code_of_conduct/{unique_id}
def onereport_cgp_code_of_conduct(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/cgp/{}/code_of_conduct/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/cgs/{report_year}/board/{unique_id}
def onereport_cgs_board(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/cgs/{}/board/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/cgs/{report_year}/auditor_company/{unique_id}
def onereport_cgs_auditor_company(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/cgs/{}/auditor_company/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp

## onereport/cgs/{report_year}/director_performance/{unique_id}
def onereport_cgs_director_performance(report_year , unique_id):

    # Set full URL
    CallUrl = "{}/cgs/{}/director_performance/{}".format(API_URL , report_year, unique_id)

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None, headers=headers, url=CallUrl)

    return resp