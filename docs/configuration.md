# Configuration

All configuration variables are defined in the single root-level `.env` file.

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `SEC_FACTSHEET_KEY` | **Yes** | — | Primary subscription key for the SEC Fund Factsheet API. |
| `SEC_FACTSHEET_KEY_2` | No | — | Secondary subscription key for the SEC Fund Factsheet API. Used for zero-downtime key rotation and automatic 401 failover. |
| `SEC_DAILYINFO_KEY` | **Yes** | — | Primary subscription key for the SEC Fund Daily Info API. |
| `SEC_DAILYINFO_KEY_2` | No | — | Secondary subscription key for the SEC Fund Daily Info API. Used for zero-downtime key rotation and automatic 401 failover. |
| `SCRAPE_TOKEN` | **Yes** | — | Secret string used to authenticate manual scraping requests. Must be passed in the `X-Scrape-Token` header during manual POST requests to `/api/scrape`. |
| `CORS_ORIGIN` | No | `*` | Restricts CORS origin requests. Set to your production domain (e.g. `https://sarnfund.com`) to secure the backend API. |
| `PORT` | No | `3001` | The network port the Express backend server listens on internally. |
| `VITE_API_URL` | No | `http://localhost:3001` | URL of the backend API used during React local development builds. |

## Key Rotation Workflow (Zero Downtime)

When rotating a key on the SEC developer portal:
1. Subscribing to a product provides two keys: **Primary** and **Secondary**.
2. Put the new key as the secondary key (`SEC_FACTSHEET_KEY_2` or `SEC_DAILYINFO_KEY_2`) and restart the backend.
3. Revoke the old primary key in the SEC portal.
4. The backend connector will automatically detect the 401 on the primary key and fall back to the secondary key without throwing errors or restarting.
5. In the next maintenance window, copy the secondary key to the primary variable, clear the secondary key, and restart.
