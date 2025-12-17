from function.AllFunction import *
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

# Load dot env file
load_dotenv(Path(".env"))

# Declare variable
API_URL = os.getenv("Url") + "/common/ref"
API_Key = os.getenv("CommonKey")
headers = {
    "Content-type":"application/json",
    "Accept":"application/json",
    "cache-control" : "no-cache",
    "Ocp-Apim-Subscription-Key" : API_Key,
}

# set call limit 
lmtr = RateLimiter(headers)

# Call API

## common/ref/license_type/company
def ref_license_type_company():

    # Set full URL
    CallUrl = API_URL + "/license_type/company"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/business_act/company
def ref_business_act_company():

    # Set full URL
    CallUrl = API_URL + "/business_act/company"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/license_type/person
def ref_license_type_person():

    # Set full URL
    CallUrl = API_URL + "/license_type/person"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/role/person
def ref_role_person():

    # Set full URL
    CallUrl = API_URL + "/role/person"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/fund/portfolio/asset_type
def ref_fund_portfolio_asset_type():

    # Set full URL
    CallUrl = API_URL + "/fund/portfolio/asset_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/product/secu_type
def ref_product_secu_type():

    # Set full URL
    CallUrl = API_URL + "/product/secu_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/product/offering_type
def ref_product_offering_type():

    # Set full URL
    CallUrl = API_URL + "/product/offering_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/product/currency_code
def ref_product_currency_code():

    # Set full URL
    CallUrl = API_URL + "/product/currency_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/product/debenture/coupon_code
def ref_product_debenture_coupon_code():

    # Set full URL
    CallUrl = API_URL + "/product/debenture/coupon_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/product/debenture/redemption_code
def ref_product_debenture_redemption_code():

    # Set full URL
    CallUrl = API_URL + "/product/debenture/redemption_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/product/debenture/embedded_code
def ref_product_debenture_embedded_code():

    # Set full URL
    CallUrl = API_URL + "/product/debenture/embedded_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/product/debenture/secured_code
def ref_product_debenture_secured_code():

    # Set full URL
    CallUrl = API_URL + "/product/debenture/secured_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/investoralert/action_type
def ref_investoralert_action_type():

    # Set full URL
    CallUrl = API_URL + "/investoralert/action_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/bond/function_type
def ref_bond_function_type():

    # Set full URL
    CallUrl = API_URL + "/bond/function_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/bond/corporation_type
def ref_bond_corporation_type():

    # Set full URL
    CallUrl = API_URL + "/bond/corporation_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/digitalasset/customer_type
def ref_digitalasset_customer_type():

    # Set full URL
    CallUrl = API_URL + "/digitalasset/customer_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/digitalasset/asset_type
def ref_digitalasset_asset_type():

    # Set full URL
    CallUrl = API_URL + "/digitalasset/asset_type"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/pvd/policy_code
def ref_pvd_policy_code():

    # Set full URL
    CallUrl = API_URL + "/pvd/policy_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/onereport/financial_statement
def ref_onereport_financial_statement():

    # Set full URL
    CallUrl = API_URL + "/onereport/financial_statement"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/onereport/social_performance_code
def ref_onereport_social_performance_code():

    # Set full URL
    CallUrl = API_URL + "/onereport/social_performance_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/onereport/risk_code
def ref_onereport_risk_code():

    # Set full URL
    CallUrl = API_URL + "/onereport/risk_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/onereport/export_code
def ref_onereport_export_code():

    # Set full URL
    CallUrl = API_URL + "/onereport/export_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp

## common/ref/onereport/environment_code
def ref_onereport_environment_code():

    # Set full URL
    CallUrl = API_URL + "/onereport/environment_code"

    # Call API
    print("preparing to call the API [{}]".format(CallUrl))
    resp = RateLimiter.CallGetAPI(self=None ,headers=headers , url=CallUrl)

    return resp
