# SarnFund 📊

**SarnFund** is a comprehensive mutual fund analytics dashboard for Thai tax-saving investment funds. Track, compare, and analyze performance data for RMF (Retirement Mutual Fund), ThaiESG, LTF (Long-Term Equity Fund), and SSF (Super Savings Fund) with real-time data visualization.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

## 🌟 Features

- **📈 Real-time Fund Data** - Automated daily scraping from SET Trade API
- **🎯 Multiple Fund Types** - RMF, ThaiESG, LTF, and SSF support
- **📊 Interactive Charts** - Performance visualization with Recharts
- **🏢 Multi-AMC Tracking** - Coverage of 18+ Asset Management Companies
- **⚡ Smart Caching** - 24-hour dual-layer caching (backend + frontend)
- **🐳 Docker Ready** - Complete containerization with Docker Compose
- **🔒 Zero Trust** - Transparent data sourcing with verification links
- **📱 Responsive Design** - Mobile-friendly Tailwind CSS interface

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SarnFund System                         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
      ┌───────▼────────┐            ┌────────▼────────┐
      │    Backend     │            │    Frontend     │
      │   (Node.js)    │            │     (React)     │
      │                │            │                 │
      │  • Express API │◄───────────┤  • Vite Build   │
      │  • Data Scraper│            │  • Tailwind CSS │
      │  • Cron Jobs   │            │  • Recharts     │
      │  • JSON Cache  │            │  • React Router │
      └───────┬────────┘            └─────────────────┘
              │
              │ curl/fetch
              │
      ┌───────▼────────┐
      │  SET Trade API │
      │ (settrade.com) │
      └────────────────┘
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/zr0aces/SarnFund.git
cd SarnFund

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:8091
# Backend API: http://localhost:3001/api/health
```

### Option 2: Local Development

**Backend:**
```bash
cd backend
npm install
npm run scrape    # Initial data fetch
npm start         # Start API server on port 3001
```

**Frontend:**
```bash
npm install
npm run dev       # Start Vite dev server on port 5173
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+ (Alpine)
- **Framework:** Express.js 4.x
- **Scheduler:** node-cron 3.x
- **Data Source:** SET Trade API

### Frontend
- **Framework:** React 18.x
- **Build Tool:** Vite 5.x
- **Styling:** Tailwind CSS 3.x
- **Charts:** Recharts 2.x
- **Routing:** React Router 6.x
- **Icons:** Lucide React

### Infrastructure
- **Containers:** Docker & Docker Compose
- **Web Server:** Nginx (frontend)
- **Caching:** JSON files + localStorage

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/funds/rmf` | GET | Get RMF fund data |
| `/api/funds/tesg` | GET | Get ThaiESG fund data |
| `/api/funds/ltf` | GET | Get LTF fund data |
| `/api/funds/ssf` | GET | Get SSF fund data |
| `/api/funds/all` | GET | Get all fund types |
| `/api/health` | GET | Health check with cache status |
| `/api/stats` | GET | Fund statistics (counts) |

## 📂 Project Structure

```
SarnFund/
├── backend/                  # Backend API and scraper
│   ├── server.js            # Express server with cron
│   ├── scraper.js           # Data processing logic
│   ├── refetch_funds_v2.sh  # Shell script for API calls
│   ├── data/                # Cached JSON files
│   ├── Dockerfile           # Backend container
│   └── package.json         # Backend dependencies
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.jsx          # Main application
│   ├── Dockerfile           # Frontend container
│   └── package.json         # Frontend dependencies
│
├── documents/               # Project documentation
├── .github/                 # GitHub configurations
│   └── copilot_instructions.md
├── docker-compose.yml       # Container orchestration
└── README.md               # This file
```

## 🎯 Supported AMCs

SarnFund tracks funds from 18+ Asset Management Companies:

- **KKP** (เกียรตินาคินภัทร)
- **Krungsri** (กรุงศรี)
- **BBL** (บัวหลวง)
- **TISCO** (ทิสโก้)
- **SCB** (ไทยพาณิชย์)
- **KAsset**, **KTAM**, **ONE**, **UOB**
- **Principal**, **Eastspring**, **MFC**
- And more...

## 🔧 Configuration

### Backend Environment Variables

```bash
PORT=3001                    # API server port (default: 3001)
```

### Frontend Environment Variables

```bash
VITE_API_URL=http://localhost:3001  # Backend API URL
```

## 📊 Data Flow

1. **Automated Scraping** - Daily at 1:00 AM via node-cron
2. **API Fetching** - Shell script uses curl to fetch from SET Trade
3. **Data Processing** - Normalize AMC names and transform structure
4. **Backend Cache** - Save as JSON files (24-hour TTL)
5. **API Serving** - Express endpoints serve cached data
6. **Frontend Fetch** - React hooks fetch via relative paths
7. **Client Cache** - localStorage provides secondary cache
8. **Visualization** - Render charts, tables, and KPI cards

## 🧪 Manual Testing

```bash
# Test backend health
curl http://localhost:3001/api/health

# Fetch RMF data
curl http://localhost:3001/api/funds/rmf

# Manual data scrape
cd backend && npm run scrape

# Get fund statistics
curl http://localhost:3001/api/stats
```

## 📖 Documentation

Detailed documentation is available in the `/documents` directory:

- **[Setup Guide](documents/SETUP_GUIDE.md)** - Installation and deployment
- **[Implementation Summary](documents/IMPLEMENTATION_SUMMARY.md)** - Technical details
- **[Copilot Instructions](.github/copilot_instructions.md)** - Development guidelines

## 🐳 Docker Deployment

```yaml
services:
  backend:
    build: ./backend
    ports: ["3001:3001"]
    volumes: ["./backend/data:/app/data"]
    
  frontend:
    build: ./frontend
    ports: ["8091:80"]
    depends_on: [backend]
```

### Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 🔒 Security Considerations

- ✅ No hardcoded secrets or API keys
- ✅ CORS configuration for production
- ✅ Input validation on all data processing
- ✅ Manual scrape endpoint disabled by default
- ✅ Regular dependency updates with `npm audit`
- ✅ Docker image security scanning

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **SarnFund Team** - Initial work

## 🙏 Acknowledgments

- Data sourced from [SET Trade](https://www.settrade.com/)
- Built with ❤️ for the Thai investment community
- Inspired by the need for transparent fund analytics

## 📞 Support

For issues, questions, or suggestions:

- Open an [Issue](https://github.com/zr0aces/SarnFund/issues)
- Check [Documentation](documents/)
- Review [Copilot Instructions](.github/copilot_instructions.md)

---

**Made with ☕ and 💻 by the SarnFund Team**
