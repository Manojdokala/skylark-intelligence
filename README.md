# Skylark Intelligence | Monday.com Business Intelligence Agent

> **Founder-level business intelligence from Monday.com Deals and Work Orders boards.**

Skylark Intelligence is a production-minded, full-stack Business Intelligence (BI) application built for Skylark Drones. It connects directly to Monday.com GraphQL API to deliver verified quantitative insights, executive briefings, data-quality audits, and natural language analytics across sales pipeline and operational fulfillment.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
│ (Conversational Chat | Leadership Brief | Data Quality │
│  Connection Status | "Last Refreshed" Bar)              │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (/api/chat, /api/monday/status, etc.)
┌──────────────────────────▼──────────────────────────────┐
│                    Express Backend API                  │
├─────────────────────────────────────────────────────────┤
│ 1. Intent Detection & Query Router                      │
│ 2. 100% Deterministic Analytics Engine (Zero LLM math)  │
│ 3. Data Normalization & Data Quality Audit Layer        │
│ 4. Monday.com GraphQL API Client                        │
│    (With xlsx parser for local fixture fallback)        │
│ 5. Gemini LLM Formatter (With graceful fallback)        │
└──────────────────────────┬──────────────────────────────┘
                           │ GraphQL Query (https://api.monday.com/v2)
┌──────────────────────────▼──────────────────────────────┐
│                  Monday.com API / Data                  │
│         (Deals Board & Work Orders Board)              │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- 💬 **Conversational BI Interface**: Ask natural language business questions ("How's our pipeline looking for the energy sector?", "Compare pipeline with operational workload", etc.).
- 🎯 **100% Deterministic Quantitative Math**: All business metrics, pipeline totals, sector breakdowns, and billed amounts are calculated strictly by backend TypeScript code. No LLM hallucinations or invented figures.
- 🔗 **Monday.com GraphQL API Integration**: Directly fetches board schemas and items from `https://api.monday.com/v2`.
- 📁 **Local Fixture Fallback Mode**: Uses `xlsx` npm package to load Excel dataset fixtures (`Deal funnel Data.xlsx` and `Work_Order_Tracker Data.xlsx`) if Monday API credentials are not yet configured.
- 🔒 **Server-Side Security**: `MONDAY_API_TOKEN` is strictly stored on the server and is **NEVER** returned, displayed, or editable on the frontend.
- 📊 **Source & Evidence Drawer**: Every analytical response explicitly displays the board queried, total records analyzed, valid records count, calculated metrics, and last refreshed timestamp.
- 🛡️ **First-Class Data Quality Audit**: Calculates board field completeness percentages, missing close dates, unstated deal values, and explicitly communicates data caveats.
- 📋 **Leadership Brief Generator**: 1-click executive update generator synthesizing sales, ops, strategic signals, and risk warnings with a copy-to-clipboard button.
- ❓ **Interactive Ambiguity Resolution**: Automatically detects vague queries (e.g., "How is our pipeline?") and presents clickable clarification options.
- ⚡ **Graceful Offline / No-LLM Fallback**: Operates smoothly even if Gemini API is unconfigured or unavailable by rendering verified deterministic metrics.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons
- **Backend**: Express.js, TypeScript, Node.js v26
- **Data Parsing & Integration**: `xlsx` npm package, Fetch API (Monday.com v2 GraphQL)
- **AI Synthesis**: `@google/generative-ai` (Optional Gemini 1.5 Flash formatter)
- **Testing**: Python `unittest`, OpenPyXL verification suite

---

## 🔑 Monday.com Setup & Configuration

1. Log into your **Monday.com** account.
2. Create or import your **Deals** and **Work Orders** boards.
3. Obtain your Personal Access Token from **Monday.com -> Admin -> API**.
4. Note your Deals Board ID and Work Orders Board ID from the URL (e.g. `https://work.monday.com/boards/1234567890`).
5. Copy `.env.example` to `.env` in the root project directory:

```bash
PORT=5000
MONDAY_API_TOKEN=your_personal_access_token
MONDAY_DEALS_BOARD_ID=1234567890
MONDAY_WORK_ORDERS_BOARD_ID=0987654321
GEMINI_API_KEY=optional_gemini_api_key
```

---

## 🚀 Local Setup & Running

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python (for test suite)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Build production assets & compile TypeScript server
npm run build

# 3. Run development mode (Concurrent Frontend + Backend)
npm run dev

# 4. Start production server
npm start
```

Access the application in your browser at `http://localhost:3000` (Dev) or `http://localhost:5000` (Production).

---

## 🧪 Testing

Execute the automated verification suite:

```bash
npm test
# Or run directly: py tests/run_tests.py
```

The test suite validates:
1. Presence and integrity of raw Excel dataset files
2. Deals board schema and key column existence
3. Work Orders board schema and key column existence
4. Deterministic valuation math across 165 valid deal records
5. Cross-board overlapping sector dimensions (`Mining`, `Powerline`, `Renewables`, `Railways`, `Construction`, `Others`)

---

## 🧹 Data Handling & Normalization

The backend `normalizationService` cleans messy real-world data:
- **Null & Missing Values**: Normalizes `""`, `"N/A"`, `"NA"`, `"-"`, `"unknown"`, `"null"` into clean `null`.
- **Date Standardizing**: Parses ISO dates, standardizes timestamps to `YYYY-MM-DD`, and resolves Excel serial timestamps (e.g., `45000`).
- **Currency & Numeric Parsing**: Strips `Rs.`, commas, and whitespace; handles `NaN` values safely.
- **Sector Standardization**: Groups sector variants into standard categories (`Mining`, `Powerline`, `Service + Spectra`, `Pure Service`, `Infrastructure`).
- **No Metric Fabrication**: If a required metric field is missing in raw source data, the app explicitly communicates: *"Metric cannot be calculated due to missing [Field Name]"*.

---

## 🤖 AI Architecture & Deterministic Safeguards

Skylark Intelligence employs a **hybrid AI architecture**:
1. **Query Intent Detection**: Analyzes natural language input and routes to deterministic analytics functions.
2. **Deterministic Computation**: 100% of numerical calculations (sums, averages, breakdowns, ratios) are executed by TypeScript code.
3. **Evidence Packaging**: Assembles metadata (board name, record count, timestamp).
4. **Optional LLM Formatting**: Gemini API formats verified results into executive summaries. If Gemini is unavailable, the system falls back to structured deterministic response cards.

---

## 📌 Assumptions & Limitations

- **Assumptions**: Deals and Work Orders boards share common industry categories (`Sector`).
- **Limitations**: Direct Deal ID foreign keys are omitted in the initial Excel dataset fixture; cross-board analysis relies on sector-level mapping.

---

## 🔮 Future Improvements

- Automated Monday.com Webhooks for real-time push sync.
- Custom board column mapping UI for dynamic schema changes.
- Downloadable PDF executive reports.
