
import os
import json
import time
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv

# Import functions from the local function directory
# Assuming 'function' folder is in the same directory as this script
from function.FundFactsheet import fund_factsheet_amc, fund_factsheet_fund, fund_factsheet_return
from function.Common import RateLimiter

# Load environment variables
load_dotenv()

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'all_funds.json')

def get_fund_type(abbr_name, name_th):
    abbr = str(abbr_name).upper()
    name = str(name_th).upper()
    
    if 'RMF' in abbr or 'RMF' in name:
        return 'RMF'
    if 'SSF' in abbr or 'SSF' in name:
        return 'SSF'
    if 'THAIESG' in abbr or 'THAIESG' in name or 'TESG' in abbr:
        return 'ThaiESG'
    return None

def fetch_all_funds():
    print("Fetching AMCs...")
    try:
        amc_data = fund_factsheet_amc()
        amc_df = pd.DataFrame(amc_data)
    except Exception as e:
        print(f"Error fetching AMCs: {e}")
        return

    print(f"Found {len(amc_df)} AMCs.")
    
    all_funds_list = []
    
    # 1. Collect all funds first
    for idx, row in amc_df.iterrows():
        unique_id = row['unique_id']
        amc_code = row['unique_id'] # Usually the code is here or we map it. 
        # Actually Main.py uses unique_id to fetch funds.
        # We might want to keep the AMC name/code.
        
        # Try to find a short code for AMC if possible, or just use unique_id
        # In v2.html AMC_COLORS uses codes like 'SCB', 'K', etc. 
        # We might need to map unique_id to these codes or parse them from fund names.
        
        print(f"Fetching funds for AMC: {row.get('name_th', unique_id)}...")
        try:
            funds_data = fund_factsheet_fund(unique_id)
            if funds_data:
                funds_df = pd.DataFrame(funds_data)
                # Add AMC info
                funds_df['amc_unique_id'] = unique_id
                funds_df['amc_name_th'] = row.get('name_th', '')
                all_funds_list.append(funds_df)
        except Exception as e:
            print(f"Error fetching funds for {unique_id}: {e}")
            
    if not all_funds_list:
        print("No funds found.")
        return

    all_funds = pd.concat(all_funds_list, ignore_index=True)
    print(f"Total funds found: {len(all_funds)}")
    
    # 2. Filter for Target Funds (Registered + Type Match)
    # Check column names from cached/sample data or assumption. 
    # Main.py used: 'fund_status', 'proj_abbr_name', 'proj_name_th'
    
    # Filter active only
    active_funds = all_funds[all_funds['fund_status'] == 'RG'].copy()
    
    # Tag types
    active_funds['fund_type'] = active_funds.apply(
        lambda x: get_fund_type(x.get('proj_abbr_name', ''), x.get('proj_name_th', '')), 
        axis=1
    )
    
    # Keep only relevant types
    target_funds = active_funds[active_funds['fund_type'].notna()].copy()
    print(f"Target funds (RMF/SSF/ThaiESG): {len(target_funds)}")
    
    # 3. Fetch Performance (Return) for each target fund
    final_data = []
    
    for idx, row in target_funds.iterrows():
        proj_id = row['proj_id']
        print(f"[{idx+1}/{len(target_funds)}] Fetching return for {row['proj_abbr_name']} ({proj_id})...")
        
        fund_item = {
            "id": proj_id,
            "amc": row.get('amc_name_th', 'OTHER'), # We might need to parse Short Code later
            "proj_name_th": row.get('proj_name_th', ''),
            "proj_abbr_name": row.get('proj_abbr_name', ''),
            "fund_type": row['fund_type'],
            "last_upd_date": datetime.now().isoformat(),
            # Initialize with N/A
            "last_val": 0,
            "return_ytd": 0,
            "return_3m": 0,
            "return_6m": 0,
            "return_1y": 0,
            "return_3y": 0,
            "return_5y": 0,
        }
        
        # Attempt to get AMC short code from abbr (e.g. K-RMF -> K)
        # This is heuristics based on v2.html logic
        if row.get('proj_abbr_name'):
            parts = row['proj_abbr_name'].split('-')
            if parts:
                fund_item['amc'] = parts[0] # roughly
        
        try:
            return_data = fund_factsheet_return(proj_id)
            # return_data is likely a list or dict. 
            # We need to inspect the structure or iterate.
            # Assuming it returns a list of records for different periods or a dict.
            
            if return_data and isinstance(return_data, list) and len(return_data) > 0:
                # Based on typical SEC API, it might list returns by date. 
                # Or it is a single object. 
                # Let's assume it assigns fields if they exist.
                # Since I cannot see the output structure without running, I will check if fields exist directly.
                # However, usually there is a specific field mapping.
                pass
                
                # NOTE: Without knowing the exact return structure of fund_factsheet_return,
                # I will assume standard fields or try to dump one to see.
                # But for now, I'll attempt to map common keys if it's a dict, or grab the latest if list.
                
                # Logic from similar projects: usually returns a list of time periods.
                # Or just one object with many keys.
                # I will modify to just dump the raw response into the item for now, 
                # OR parse safely.
                
                # Let's just save the first item if it's a list
                first_ret = return_data[0] if isinstance(return_data, list) else return_data
                
                # Mapping (Adjust keys based on actual API response)
                # This is a GUESS based on standard finance API naming. 
                # Real keys might be 'returnPeriod1Year', etc.
                # If fail, we will debug.
                
                # Heuristic: Copy all keys to fund_item so we can see them in frontend at least
                for k,v in first_ret.items():
                    fund_item[k] = v
                    
        except Exception as e:
            print(f"Error fetching return for {proj_id}: {e}")
            
        final_data.append(fund_item)
        
        # Rate limit nice-ness (Common.py has its own limiter but adding a small sleep safe)
        # time.sleep(0.1)

    # Save to JSON
    os.makedirs(DATA_DIR, exist_ok=True)
    
    output_data = {
        "timestamp": int(time.time() * 1000),
        "data": final_data
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully saved {len(final_data)} funds to {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_all_funds()
