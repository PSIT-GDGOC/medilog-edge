# 🩺 MediLog Edge – Offline-First Healthcare Platform

<p align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb\&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-4285F4?logo=pwa\&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI-FF6F00?logo=tensorflow\&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini%20API-AI-8E75B2)
![License](https://img.shields.io/badge/License-MIT-green)
![GDGoC](https://img.shields.io/badge/GDGoC-PSIT-4285F4)

</p>

<p align="center">
  <strong>Offline-first healthcare for communities where connectivity cannot be guaranteed.</strong>
</p>

---

## 🌍 Overview

**MediLog Edge** is an offline-first healthcare platform designed for rural health workers, community health workers, and primary healthcare centers operating in low-connectivity environments.

The platform allows healthcare workers to continue managing essential patient information even when internet connectivity is unavailable.

When connectivity returns, locally stored records can be synchronized with the central backend.

MediLog Edge combines **React, PWA, IndexedDB, Node.js, Express, MongoDB, TensorFlow.js, Google Speech-to-Text, and Gemini API** into a single healthcare-focused platform.

---

## ✨ Pitch & Core Features

### 📱 Offline-First Patient Records

Healthcare workers can continue accessing and managing patient information without an active internet connection.

* Local patient record storage
* IndexedDB persistence
* Offline data access
* Sync queue for pending operations

### 🔄 Smart Synchronization

Changes made while offline can be synchronized once the internet connection becomes available.

* Offline operation queue
* Automatic synchronization
* Duplicate prevention
* Failed-sync retry handling

### 🤖 Edge AI Screening

TensorFlow.js enables lightweight AI processing directly on the user's device.

* Camera-based screening
* On-device inference
* Reduced dependency on cloud connectivity
* Screening and decision-support capabilities

### 🎙️ Voice-Based Data Entry

Healthcare workers can provide patient information using voice instead of manually entering every field.

```text
Voice Input
     ↓
Google Speech-to-Text
     ↓
Transcribed Text
     ↓
Gemini API
     ↓
Structured Patient Data
```

### 🔐 Secure Authentication

JWT-based authentication protects access to healthcare data and backend resources.

### 📲 Progressive Web App

MediLog Edge is designed as a PWA so it can provide an app-like experience across supported devices.

---

## 🏗️ System Architecture

```text
                    Healthcare Worker
                           │
                           ▼
                    ┌──────────────┐
                    │   React PWA  │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌──────────────┐          ┌──────────────┐
       │   IndexedDB  │          │    Edge AI   │
       │              │          │ TensorFlow.js│
       │ Patient Data │          │ Camera       │
       │ Sync Queue   │          │ Screening    │
       └──────┬───────┘          └──────────────┘
              │
              │ Internet Available
              ▼
       ┌──────────────┐
       │ Node +       │
       │ Express API  │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │   MongoDB    │
       │              │
       │ Users        │
       │ Patients     │
       │ Records      │
       └──────────────┘
```

---

## 🧰 Technology Stack

| Technology            | Purpose                            |
| --------------------- | ---------------------------------- |
| React.js              | Frontend application               |
| PWA                   | Offline-capable web application    |
| IndexedDB             | Local patient data storage         |
| Node.js               | Backend runtime                    |
| Express.js            | REST API layer                     |
| MongoDB               | Central database                   |
| JWT                   | Authentication                     |
| TensorFlow.js         | On-device AI screening             |
| Google Speech-to-Text | Voice transcription                |
| Gemini API            | Structured medical data extraction |
| Git & GitHub          | Version control and collaboration  |

---

## 📂 Project Structure

```text
MediLog-Edge/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── .github/
│   └── ISSUE_TEMPLATE/
│
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── package.json
```

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MediLog-Edge
```

### 2. Install Dependencies

For the frontend:

```bash
cd frontend
npm install
```

For the backend:

```bash
cd ../backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=your_google_credentials
```

Never commit `.env` files, API keys, database credentials, or service-account credentials.

### 4. Start the Backend

```bash
cd backend
npm run dev
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend will be available at the local development URL provided by Vite.

---

## 🧪 Testing

Before creating a Pull Request, contributors should verify:

### Offline Functionality

* Create patient while offline
* Update patient while offline
* Refresh the application
* Verify local records remain available
* Reconnect to the internet
* Verify synchronization
* Verify duplicate records are not created

### Authentication

* Valid login
* Invalid credentials
* Protected routes
* Expired JWT handling
* Unauthorized access handling

### AI

* Camera permissions
* TensorFlow.js model loading
* Camera screening
* Voice input
* Speech-to-Text conversion
* Gemini response handling
* JSON validation

---

## 🔒 Security Configuration

MediLog Edge integrates production-ready security middleware to safeguard sensitive healthcare records and mitigate web vulnerabilities and automated brute-force attacks.

### 1. HTTP Security Headers (Helmet Middleware)

The backend employs [Helmet](https://helmetjs.github.io/) (`helmet`) mounted at the top of the middleware stack in `backend/server.js` (configured via `backend/middleware/security.js`). This automatically configures standard security headers on all HTTP responses:

| HTTP Header | Configuration / Value | Security Purpose |
| :--- | :--- | :--- |
| `Content-Security-Policy` | Restricted directives (`default-src 'self'`, etc.) | Mitigates Cross-Site Scripting (XSS) and code injection |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing attacks |
| `X-Frame-Options` | `SAMEORIGIN` | Protects against Clickjacking attacks |
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` | Enforces secure (HTTPS) connections |
| `Referrer-Policy` | `no-referrer` | Protects sensitive URL referrers from leaking |
| `X-DNS-Prefetch-Control` | `off` | Controls browser DNS prefetching |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Allows legitimate cross-origin asset/API access without CORS regressions |
| `X-Powered-By` | Removed / Disabled | Prevents server framework fingerprinting |

### 2. Rate Limiting Configuration (`express-rate-limit`)

Rate limiting is enforced using `express-rate-limit` to protect critical authentication endpoints against brute-force password guessing, credential stuffing, and Denial-of-Service (DoS) attacks.

#### Protected Authentication Endpoints
- `POST /api/auth/login`: Restricted to protect user accounts from dictionary and brute-force attacks.
- `POST /api/auth/register`: Restricted to prevent automated mass user registration abuse.

#### General API Endpoints
- `/api/*`: General routes (e.g. `/api/health`, `/api/patients`) are governed by `apiRateLimiter` to protect server resources while ensuring uninterrupted normal healthcare operations.

#### Environment Variables & Defaults

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `AUTH_RATE_LIMIT_WINDOW_MS` | `900000` (15 minutes) | Sliding time window in milliseconds for authentication endpoints |
| `AUTH_RATE_LIMIT_MAX` | `5` | Maximum allowed authentication attempts per IP per window |
| `API_RATE_LIMIT_WINDOW_MS` | `900000` (15 minutes) | Sliding time window in milliseconds for general API routes |
| `API_RATE_LIMIT_MAX` | `100` | Maximum allowed API requests per IP per window |

Standard headers (`RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` / `RateLimit-Policy`) are exposed on responses (`standardHeaders: true`), while obsolete `X-RateLimit-*` headers are disabled (`legacyHeaders: false`).

### 3. Rate-Limit Error Response Format

When an IP address exceeds the allowed threshold, the server rejects the request with HTTP status `429 Too Many Requests` and returns a standardized JSON payload:

```json
{
  "success": false,
  "status": 429,
  "error": "Too Many Requests",
  "message": "Too many authentication attempts from this IP, please try again after 15 minutes."
}
```

For general API routes exceeding limits:
```json
{
  "success": false,
  "status": 429,
  "error": "Too Many Requests",
  "message": "Too many requests from this IP, please try again after 15 minutes."
}
```

### 4. Verification & Testing Instructions

#### Automated Test Suite Execution
Run the comprehensive automated security test suite using Jest and Supertest:

```bash
# From repository root:
npm test

# Or directly from the backend directory:
cd backend
npm test
```

#### Manual Verification Steps
1. **Verify Security Headers**:
   ```bash
   curl -I http://localhost:5000/api/health
   ```
   Confirm presence of `x-content-type-options: nosniff`, `x-frame-options`, `strict-transport-security`, and absence of `x-powered-by`.

2. **Verify Rate Limiting & 429 Rejection**:
   Send 6 rapid sequential POST requests to `http://localhost:5000/api/auth/login`:
   ```bash
   for i in {1..6}; do curl -i -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"bad"}'; done
   ```
   The first 5 requests will return status 400 or 401; the 6th request will return HTTP 429 with the JSON message and standard `RateLimit-*` headers.

---

## 🤝 Contributing

MediLog Edge is an open-source project developed as part of the **GDGoC PSIT Hacktoberfest Initiative**.

We welcome contributions in:

* Frontend development
* Offline-first functionality
* Backend APIs
* Database development
* AI/ML integration
* Testing
* Documentation
* Accessibility and UI/UX

### Contribution Workflow

```text
Choose an Issue
      ↓
Claim / Get Assigned
      ↓
Fork Repository
      ↓
Create Branch
      ↓
Implement Changes
      ↓
Test Locally
      ↓
Push Branch
      ↓
Create Pull Request
      ↓
Maintainer Review
      ↓
Merge
```

### Before Opening a Pull Request

* Read `CONTRIBUTING.md`
* Check existing Issues
* Work only on the assigned issue
* Keep the PR focused
* Test your changes locally
* Do not commit secrets
* Clearly describe your changes
* Link the relevant issue

---

## 🐛 Issues & Feature Requests

Found a bug or have an improvement in mind?

Open an issue with:

* Clear title
* Problem description
* Steps to reproduce, if applicable
* Expected behaviour
* Actual behaviour
* Screenshots or logs when useful

For Hacktoberfest contributions, please check the existing Issues before starting work.

---

## 🎯 SDG 3 — Good Health and Well-Being

MediLog Edge aligns with **United Nations Sustainable Development Goal 3: Good Health and Well-Being**.

The project focuses on improving healthcare accessibility and continuity in environments where reliable connectivity may not always be available.

Key areas include:

* Accessible digital patient records
* Offline healthcare workflows
* Basic AI-assisted screening
* Healthcare worker efficiency
* Continuity of digital information

---

## 🔮 Future Scope

Potential future improvements include:

* Multi-language voice support
* Advanced edge-AI screening
* Improved offline conflict resolution
* Healthcare device integration
* Automated medical report generation
* Patient analytics
* Advanced synchronization
* Federated or on-device learning
* Improved accessibility

---

## 📜 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.

---

## 👥 Maintainers & Community

MediLog Edge is maintained by the **GDGoC PSIT community and contributors**.

Built as part of the **GDGoC PSIT Hacktoberfest Initiative**.

For questions, discussions, contribution opportunities, or mentorship, connect with the GDGoC PSIT community.

---

<p align="center">
  Made with ❤️ for accessible healthcare
</p>
