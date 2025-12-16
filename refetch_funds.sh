# Ensure data directory exists and is writable
mkdir -p backend/data
chmod 777 backend/data

# RMF Fetch - Removed dividendPolicy=N
curl 'https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=RMF' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'origin: https://www.settrade.com' \
  -H 'referer: https://www.settrade.com/th/mutualfund/screening' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
  --compressed > backend/data/rmf-fetched.json

# ThaiESG Fetch - Removed dividendPolicy=N
curl 'https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=TESG' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'origin: https://www.settrade.com' \
  -H 'referer: https://www.settrade.com/th/mutualfund/screening' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
  --compressed > backend/data/tesg-fetched.json
