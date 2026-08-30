# Skylark Intelligence

### Monday.com Business Intelligence Agent for Sales & Operations

> **A production-ready Business Intelligence application that turns Monday.com sales and operational data into verified, actionable business insights.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://skylark-intelligence-fr31.onrender.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/Manojdokala/skylark-intelligence)

---

## 🚀 Live Application

**Live Demo:**  
https://skylark-intelligence-fr31.onrender.com/

**Source Code:**  
https://github.com/Manojdokala/skylark-intelligence

---

## 📌 Overview

**Skylark Intelligence** is a full-stack Business Intelligence application designed to provide leadership and business teams with a conversational interface for analyzing sales pipeline and operational fulfillment data.

The application connects to **Monday.com** and transforms business records from Deals and Work Orders boards into structured, explainable insights.

Instead of manually inspecting boards or spreadsheets, users can ask natural-language questions such as:

- How is our pipeline looking?
- What is the total pipeline value?
- Show me pipeline by sector.
- What are our current work-order statuses?
- How much revenue has been billed?
- Compare pipeline with operational workload.
- Which sectors need attention?

The system combines:

- Conversational business intelligence
- Monday.com GraphQL integration
- Deterministic analytics
- Data normalization
- Data-quality auditing
- Evidence-based responses
- Executive leadership summaries
- Responsive React user interface

A central design principle of the application is:

> **Business metrics are calculated by deterministic backend logic rather than allowing an AI model to invent or independently calculate business figures.**

---

# ✨ Key Features

## 1. Conversational Business Intelligence

Users can interact with the system using natural-language business questions.

### Example Questions

```text
How is our pipeline looking?

What is the total pipeline value?

Show me pipeline by sector.

What are our work order statuses?

How much revenue has been billed?

Compare pipeline with operational workload.

Which sectors need attention?
```

The application interprets the user's analytical intent and routes the request to the appropriate backend analytics logic.

---

## 2. Deterministic Quantitative Analytics

The application is designed so that important business calculations are performed by backend TypeScript logic.

This includes:

- Pipeline totals
- Deal counts
- Sector-level analysis
- Work-order counts
- Billed amounts
- Aggregations
- Ratios
- Business comparisons
- Data-quality metrics

The system follows the principle:

> **Calculate first. Explain second.**

This helps prevent fabricated or unsupported business figures.

---

## 3. Monday.com Integration

Skylark Intelligence integrates with the **Monday.com GraphQL API** to retrieve business data from configured boards.

The integration supports the application's:

- Deals data
- Work Orders data
- Board information
- Board records
- Business metrics
- Operational analysis

### Configured Boards

**Deals Board**

https://manojdokala215s-team.monday.com/boards/5030963217

**Work Orders Board**

https://manojdokala215s-team.monday.com/boards/5030962938

> These Monday.com board links may require appropriate account permissions to access.

---

## 4. Data Quality Auditing

Data quality is treated as an important part of the analytics workflow rather than being ignored.

The system can identify issues such as:

- Missing values
- Missing dates
- Missing deal values
- Invalid numeric values
- Incomplete records
- Inconsistent sector values
- Other normalization issues

When required source data is unavailable, the system avoids silently fabricating a value.

For example:

```text
Metric cannot be calculated due to missing [Field Name].
```

This makes analytical limitations visible to the user.

---

## 5. Source & Evidence Information

Analytical responses are designed to provide context around the result.

Depending on the analysis, the interface can surface information such as:

- Source board
- Records analyzed
- Valid records
- Calculated metrics
- Refresh information
- Data-quality considerations

This provides greater transparency and makes business insights easier to verify.

---

## 6. Leadership Brief

The application provides an executive-oriented leadership brief for quickly understanding the organization's current business position.

The brief can summarize areas such as:

### Sales

- Pipeline position
- Sector performance
- Deal activity
- Sales opportunities

### Operations

- Work-order workload
- Operational status
- Fulfillment activity

### Strategic Signals

- Strong-performing sectors
- Areas requiring attention
- Pipeline versus operational workload

### Risks

- Data-quality issues
- Missing information
- Potential gaps between sales pipeline and execution

The goal is to provide leadership with concise, decision-oriented information without requiring manual inspection of individual records.

---

## 7. Interactive Ambiguity Resolution

The application can handle broad or ambiguous questions by guiding the user toward a more specific analysis.

For example:

```text
User:
How is our pipeline?

Application:
What would you like to analyze?

[Total Pipeline Value]
[Pipeline by Sector]
[Pipeline by Status]
[Pipeline Analysis]
```

This improves the conversational experience while reducing unsupported assumptions.

---

## 8. Secure Server-Side Credentials

Sensitive API credentials are kept on the server and configured through environment variables.

Credentials such as:

```text
MONDAY_API_TOKEN
```

are not intended to be exposed through the frontend.

The repository uses:

```text
.env
```

for local secrets and:

```text
.env.example
```

as a safe configuration template.

The real `.env` file is excluded from source control through `.gitignore`.

> **Never commit API tokens, passwords, or other private credentials to GitHub.**

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│                                                              │
│  Conversational Chat │ Leadership Brief │ Data Quality       │
│  Connection Status    │ Evidence Information │ Navigation    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ REST API
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   Express Backend API                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Intent Detection & Query Routing                            │
│                                                              │
│  Deterministic Analytics Engine                              │
│                                                              │
│  Data Normalization & Quality Validation                     │
│                                                              │
│  Monday.com GraphQL API Integration                          │
│                                                              │
│  Business Insight & Response Processing                      │
│                                                              │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │ GraphQL API
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         Monday.com                           │
│                                                              │
│               Deals Board │ Work Orders Board                │
└──────────────────────────────────────────────────────────────┘
```

---

# 🔄 Data Flow

The application follows a structured data-processing pipeline:

```text
Monday.com
     │
     ▼
GraphQL API
     │
     ▼
Monday.com Service
     │
     ▼
Raw Business Data
     │
     ▼
Data Normalization
     │
     ▼
Data Quality Validation
     │
     ▼
Deterministic Analytics
     │
     ▼
Evidence / Metrics Package
     │
     ▼
Business Response
     │
     ▼
React Frontend
```

---

# 🧠 Analytics Architecture

The analytics workflow is designed around separation between **data retrieval**, **calculation**, and **presentation**.

## Step 1 — User Query

The user enters a natural-language business question.

Example:

```text
Show me pipeline by sector.
```

## Step 2 — Intent Detection

The backend determines what type of analysis is required.

Example:

```text
PIPELINE_BY_SECTOR
```

## Step 3 — Data Retrieval

The appropriate Monday.com data is retrieved through the backend integration.

## Step 4 — Data Normalization

Raw values are cleaned and converted into consistent formats.

## Step 5 — Deterministic Calculation

The analytics service performs the requested calculation using backend code.

## Step 6 — Evidence Packaging

Relevant information is assembled, including:

- Source
- Record counts
- Valid records
- Calculated metrics
- Data-quality information
- Refresh information

## Step 7 — Frontend Presentation

The final result is displayed through the React interface in a business-friendly format.

---

# 🧹 Data Handling & Normalization

The backend normalization layer is designed to handle messy real-world business data.

## Null & Missing Values

Common representations such as:

```text
""
"N/A"
"NA"
"-"
"unknown"
"null"
```

can be normalized into clean `null` values where appropriate.

## Date Standardization

The normalization layer handles different date representations and standardizes valid dates into a consistent format.

Example:

```text
YYYY-MM-DD
```

Excel serial date values can also be handled during normalization.

## Currency & Numeric Parsing

The system handles common formatting issues such as:

```text
Rs.
Commas
Whitespace
NaN
```

This allows business values to be safely converted into numbers before calculations are performed.

## Sector Standardization

Sector values can be normalized into consistent business categories where required.

Examples include:

```text
Mining
Powerline
Service + Spectra
Pure Service
Infrastructure
```

## No Metric Fabrication

If a required field is unavailable in the source data, the system communicates the limitation instead of inventing a number.

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## Backend

- Node.js
- Express.js
- TypeScript

## Data Integration

- Monday.com GraphQL API
- Fetch API
- XLSX data parsing
- Local dataset fixtures

## Testing

- Python
- Python `unittest`
- OpenPyXL

---

# 📂 Project Structure

```text
skylark-intelligence/
│
├── server/
│   ├── index.ts
│   ├── routes/
│   │   └── api.ts
│   │
│   └── services/
│       ├── agentService.ts
│       ├── analyticsService.ts
│       ├── mondayService.ts
│       └── normalizationService.ts
│
├── src/
│   ├── App.tsx
│   │
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ConnectionView.tsx
│   │   ├── DataQualityView.tsx
│   │   ├── Header.tsx
│   │   ├── LeadershipBrief.tsx
│   │   └── Navigation.tsx
│   │
│   ├── index.css
│   └── main.tsx
│
├── tests/
│   └── run_tests.py
│
├── .env.example
├── .gitignore
├── DECISION_LOG.md
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.server.json
└── vite.config.ts
```

---

# 🔐 Environment Configuration

Create a `.env` file in the project root for local development.

Example:

```env
PORT=5000

MONDAY_API_TOKEN=your_personal_access_token

MONDAY_DEALS_BOARD_ID=1234567890

MONDAY_WORK_ORDERS_BOARD_ID=0987654321
```

Do not use real credentials in the README or source code.

The repository provides `.env.example` as the configuration template.

---

# 🔑 Monday.com Setup

To connect the application to Monday.com:

1. Log in to your Monday.com account.
2. Open the Deals and Work Orders boards.
3. Obtain the required Monday.com API credentials.
4. Obtain the Board IDs.
5. Add the credentials and Board IDs to your `.env` file.
6. Start the application.

### Deals Board

https://manojdokala215s-team.monday.com/boards/5030963217

### Work Orders Board

https://manojdokala215s-team.monday.com/boards/5030962938

---

# 🚀 Local Development

## Prerequisites

Install:

- Node.js 18+
- npm 9+
- Python 3+
- Git

## Clone the Repository

```bash
git clone https://github.com/Manojdokala/skylark-intelligence.git
cd skylark-intelligence
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create:

```text
.env
```

and configure the required Monday.com values.

## Build the Application

```bash
npm run build
```

## Start Development Mode

```bash
npm run dev
```

## Start the Production Server

```bash
npm start
```

---

# 🌐 Deployment

The application is deployed using **Render** and connected to the GitHub repository.

### Repository

https://github.com/Manojdokala/skylark-intelligence

### Production Service

https://skylark-intelligence-fr31.onrender.com/

The deployed service has been verified to start successfully and expose the application through the Render URL.

The deployment configuration shown for the project uses:

```text
Branch:
master

Build Command:
npm install; npm run build

Start Command:
npm run start
```

Environment variables are configured on the deployment platform rather than committed to the repository.

---

# 🧪 Testing

The repository includes a Python-based verification suite.

Run:

```bash
npm test
```

Or run the test file directly:

```bash
python tests/run_tests.py
```

The testing layer is intended to verify important project and dataset assumptions, including:

- Dataset availability
- Dataset integrity
- Deals board structure
- Work Orders board structure
- Required fields
- Deterministic business calculations
- Cross-board sector dimensions

---

# 📊 Supported Business Analysis

## Sales Pipeline

Example questions:

```text
What is the total pipeline value?

How many deals are in the pipeline?

Show pipeline by sector.

Which sectors have the largest pipeline?

How is our pipeline distributed?
```

## Work Orders

Example questions:

```text
What are our current work order statuses?

How many work orders are active?

Show operational workload by sector.

What is the distribution of work order statuses?
```

## Revenue

Example questions:

```text
How much revenue has been billed?

What is the billed amount by sector?

Which sectors contribute the most billed revenue?
```

## Cross-Board Analysis

Example questions:

```text
Compare pipeline with operational workload.

Which sectors have strong pipeline but low operational workload?

Which sectors need attention?

Compare sales activity with fulfillment activity.
```

---

# 📈 Data Quality & Reliability

A key objective of Skylark Intelligence is to make business analytics transparent.

The application distinguishes between:

```text
Verified / Calculated Result
```

and:

```text
Result affected by incomplete source data
```

This approach helps users understand not only **what the result is**, but also **how trustworthy the underlying data is**.

---

# 📋 Leadership Decision Support

The Leadership Brief is intended to help decision-makers quickly identify:

- Sales opportunities
- Operational workload
- Sector-level performance
- Strategic signals
- Potential risks
- Data-quality concerns

Rather than presenting raw records alone, the application focuses on converting operational data into concise business signals.

---

# 🛡️ Design Principles

## Accuracy

Business metrics should be derived from the underlying source data.

## Deterministic Calculations

Numerical calculations are handled by backend analytics logic.

## Transparency

Responses provide supporting context wherever applicable.

## Data Quality

Missing or inconsistent data is surfaced rather than silently ignored.

## Security

Sensitive API credentials remain server-side.

## Separation of Concerns

The application separates:

```text
Frontend
   ↓
API Layer
   ↓
Business Logic
   ↓
Data Integration
   ↓
Source Data
```

## Graceful Failure

Core deterministic analytics should remain useful even when optional external services are unavailable.

---

# 📝 Decision Log

The repository includes:

```text
DECISION_LOG.md
```

which documents important implementation decisions and architectural considerations made during development.

---

# ⚠️ Assumptions & Limitations

## Assumptions

- The Deals and Work Orders boards contain compatible business dimensions such as `Sector`.
- Required fields are available for the requested analysis.
- Source data is sufficiently complete for the requested metric.

## Limitations

- Cross-board analysis depends on common dimensions between the available datasets.
- The initial Excel fixture does not provide direct Deal ID foreign-key relationships for every cross-board analysis.
- Some cross-board comparisons therefore rely on sector-level mapping rather than direct record-level relationships.
- Data-quality issues in the source system can affect the completeness of analytical results.
- Monday.com board access requires appropriate permissions.

---

# 🔮 Future Improvements

Potential future enhancements include:

- Real-time Monday.com webhook synchronization
- Automated data refresh
- Dynamic board-column mapping
- Historical KPI tracking
- Advanced trend analysis
- Improved cross-board relationships
- Downloadable PDF executive reports
- Custom analytics dashboards
- Role-based access control
- Enhanced audit trails
- Advanced business forecasting
- More configurable executive reporting

---

# 🔗 Project Links

### Live Application

https://skylark-intelligence-fr31.onrender.com/

### GitHub Repository

https://github.com/Manojdokala/skylark-intelligence

### Monday.com Deals Board

https://manojdokala215s-team.monday.com/boards/5030963217

### Monday.com Work Orders Board

https://manojdokala215s-team.monday.com/boards/5030962938

---

# 🎯 Project Objective

Skylark Intelligence is designed to provide a reliable business intelligence layer over sales and operational data stored in Monday.com.

Instead of requiring leadership teams to manually inspect boards, spreadsheets, or individual records, the application provides a conversational interface that converts business questions into structured, explainable analytical insights.

The project prioritizes:

**Accuracy → Transparency → Data Quality → Security → Actionable Insights**

---

# 👨‍💻 Project Information

**Project:** Skylark Intelligence  
**Purpose:** Monday.com Business Intelligence Agent  
**Domain:** Business Intelligence / Sales Analytics / Operations Analytics  
**Frontend:** React + TypeScript  
**Backend:** Node.js + Express + TypeScript  
**Data Source:** Monday.com  
**Deployment:** Render

### Repository

https://github.com/Manojdokala/skylark-intelligence

### Live Application

https://skylark-intelligence-fr31.onrender.com/

---

## ⭐ If you find this project useful

Feel free to explore the repository, review the architecture, and try the live application.

**Skylark Intelligence — turning business data into actionable intelligence.**
