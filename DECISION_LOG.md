# Skylark Intelligence - Decision Log

**Author**: Senior Product & Full-Stack Engineer  
**Project**: Skylark Drones - Monday.com Business Intelligence Agent MVP  
**Date**: August 30, 2026  

---

### 1. Architectural Choice: Modular Monolith vs. Microservices

**Decision**: Implemented a unified, modular full-stack application using **React + TypeScript + Vite** for the frontend and **Express + Node.js** for the backend API.

**Rationale**:  
For a 6-hour assignment deadline, enterprise microservices, Docker orchestration, message queues, and complex RAG/vector databases introduce unnecessary operational overhead and failure points without improving business intelligence accuracy. A single modular application ensures fast local setup, instant builds, type safety across client/server, and effortless deployment to platforms like Render or Vercel.

---

### 2. Monday.com Integration & Security Strategy

**Decision**: Utilized server-side GraphQL API integration targeting `https://api.monday.com/v2` combined with an isolated local `xlsx` parser fallback for demo fixture testing. Strict security rules prohibit exposing `MONDAY_API_TOKEN` to the frontend.

**Rationale**:  
Monday.com uses GraphQL for board querying. Keeping API tokens exclusively in server `.env` variables prevents credential leakage in client bundles. To ensure the application is immediately reviewable without requiring reviewers to configure active Monday boards prior to testing, an isolated `xlsx` fixture parser (`Deal funnel Data.xlsx` and `Work_Order_Tracker Data.xlsx`) was implemented. The UI explicitly communicates whether the app is running in **Monday.com Connected Mode** or **Demo/Fixture Mode**.

---

### 3. Data Normalization & Data Quality Handling

**Decision**: Built an explicit `normalizationService` layer to standardize messy real-world data before running analytics.

**Rationale**:  
Real-world operational boards contain inconsistent formats (`N/A`, `-`, empty strings, unparseable dates, currency symbols). The normalization layer standardizes:
- **Null Values**: Converts `N/A`, `NA`, `-`, `unknown`, `null`, `""` to clean TypeScript `null`.
- **Dates**: Resolves Excel serial timestamps (e.g. `45000`) and standardizes dates to `YYYY-MM-DD`.
- **Numbers**: Strips currency prefixes (`Rs.`), commas, and whitespace, safely parsing numeric floats.
- **Sectors**: Groups sector variations into unified categories (`Mining`, `Powerline`, `Service + Spectra`, `Infrastructure`).
- **No Metric Fabrication**: If a required metric field is missing in raw source data, the system explicitly states that the metric cannot be calculated rather than inventing numbers.

---

### 4. AI Approach: Deterministic Math + LLM Explanation

**Decision**: 100% of numerical calculations (pipeline sums, sector totals, billed values, counts) are executed by deterministic backend TypeScript functions. The LLM (Gemini 1.5 Flash) is used *only* for natural language summary formatting.

**Rationale**:  
LLMs are notoriously unreliable at arithmetic on raw dataset dumps and prone to hallucination. Founder-level business intelligence requires mathematically verified numbers. By calculating metrics deterministically in code and passing structured JSON results to the LLM, we guarantee 100% mathematical precision while maintaining conversational fluency. If the LLM API key is unconfigured or offline, the app seamlessly falls back to structured deterministic response cards with zero disruption.

---

### 5. Ambiguity & Clarification Flow

**Decision**: Implemented an explicit intent classifier that identifies vague queries (e.g., "How is our pipeline?") and returns interactive clarification chips.

**Rationale**:  
Founders ask broad questions. Rather than guessing intent and presenting incomplete data, the agent presents 4 structured perspectives: (1) Total Pipeline Valuation, (2) Pipeline by Sector, (3) Pipeline by Deal Stage, and (4) Deals Needing Attention. This aligns with human business analyst workflows.

---

### 6. Leadership Brief Feature Interpretation

**Decision**: Created a dedicated **Leadership Brief** tab and API endpoint providing a 1-click executive update with a copy-to-clipboard button.

**Rationale**:  
Founders need concise executive summaries for weekly updates. The brief synthesizes: Executive Snapshot, Sales & Operations Totals, Strategic Signals, and Data Quality Caveats into a clean text block that can be copied directly into Slack or email.

---

### 7. Engineering Trade-offs

| Kept Simple | Reason / Rationale |
| :--- | :--- |
| **Simple REST API over WebSockets** | HTTP POST/GET endpoints are simpler to debug, test, and host within 6 hours. |
| **Sector-based Cross-Board Join** | Raw Excel fixtures lacked direct foreign keys between Deal IDs and Work Order IDs; sector-level aggregation provided valid common dimensions without fabricating non-existent relationships. |
| **No Complex Auth System** | Focused effort on BI analytics, data quality, and UI polish as permitted by prompt guidelines. |

---

### 8. Future Work (With More Time)

1. **Monday.com Webhooks**: Real-time push updates when board items change.
2. **Interactive Column Mapping**: UI for mapping custom board columns dynamically.
3. **PDF Executive Export**: One-click PDF report download for quarterly board meetings.
