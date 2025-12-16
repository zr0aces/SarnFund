URL="https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=RMF"
COOKIE='charlot=36f4fcad-1054-45d9-bcc5-46e96651b2a4; visid_incap_2685215=wpyySu6FSyiUTRZyL3vHRugtQWkAAAAAQUIPAAAAAAAZvTIzd1An4q5/jiYQL0tE; nlbi_2685215=55HJMb9ieGTjaViM2+vbQgAAAAAuU76UNY49bgomRrtCh552; route=d260eeb4244841dbfb0f19b27d56dfe3; incap_ses_373_2685215=vZSkUPnokw9V72tUsiktBfg2QWkAAAAAAdjLrtsOUsnBpEuSjS+oNA=='
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'

# Ensure data directory exists and is writable
mkdir -p backend/data
chmod 777 backend/data

curl "$URL" \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.8' \
  -H 'cache-control: no-cache' \
  -b "$COOKIE" \
  -H 'pragma: no-cache' \
  -H 'priority: u=1, i' \
  -H 'referer: https://www.settrade.com/th/mutualfund/screening' \
  -H 'sec-ch-ua: "Brave";v="143", "Chromium";v="143", "Not A(Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-gpc: 1' \
  -H "user-agent: $UA" \
  --compressed > backend/data/rmf-fetched.json

# TESG
URL_TESG="https://www.settrade.com/api/set-fund/fund-compare/list?lang=th&amcId=ALL&aimcType=ALL&specificationCode=TESG"
curl "$URL_TESG" \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.8' \
  -H 'cache-control: no-cache' \
  -b "$COOKIE" \
  -H 'pragma: no-cache' \
  -H 'priority: u=1, i' \
  -H 'referer: https://www.settrade.com/th/mutualfund/screening' \
  -H 'sec-ch-ua: "Brave";v="143", "Chromium";v="143", "Not A(Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'sec-gpc: 1' \
  -H "user-agent: $UA" \
  --compressed > backend/data/tesg-fetched.json
