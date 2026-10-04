# 🩺 MediLog Edge

### Offline-first healthcare for low-connectivity environments

MediLog Edge is an offline-first healthcare platform designed for rural health workers, community health workers, and primary healthcare centers where reliable internet connectivity is not always available.

It combines React, PWA technology, IndexedDB, MERN, TensorFlow.js, Google Speech-to-Text, and Gemini to keep essential healthcare workflows running even when the network goes down.

When connectivity returns, locally stored records are synchronized with the central MongoDB database.

<p align="center">







\

</p>

<p align="center">
Built for the <strong>GDGoC PSIT Hacktoberfest Initiative</strong>
</p>

---

## 🌍 Why MediLog Edge?

Healthcare workers in low-connectivity environments often face:

* Unstable or unavailable internet
* Manual patient records
* Difficulty accessing previous medical history
* Delayed data synchronization
* Limited access to basic screening tools
* Time-consuming manual data entry

Traditional web applications often become unusable when the internet disappears.

MediLog Edge takes a different approach:

> The application works locally first and synchronizes when connectivity returns.

---

## 💡 What MediLog Edge Provides

| Capability               | What it does                                             |
| ------------------------ | -------------------------------------------------------- |
| 📱 Offline-first records | Patient records remain accessible without internet       |
| 💾 Local storage         | Uses IndexedDB for local persistence                     |
| 🔄 Smart synchronization | Queues offline operations and syncs when online          |
| 🤖 Edge AI               | TensorFlow.js enables lightweight on-device screening    |
| 🎙️ Voice entry          | Converts spoken patient information into structured data |
| 🔐 Secure access         | JWT-based authentication protects patient information    |
| 📲 PWA                   | Designed to work like an installable web application     |

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │    Healthcare Worker │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      React PWA       │
                    │ Dashboard • Records  │
                    │ Forms • Services     │
                    └──────────┬───────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │    IndexedDB     │      │     AI Layer     │
        │                  │      │                  │
        │ Patient Records  │      │ TensorFlow.js    │
        │ Local Cache      │      │ Camera Screening │
        │ Sync Queue       │      │ Speech-to-Text   │
        └────────┬─────────┘      │ Gemini API       │
                 │                └──────────────────┘
                 │
                 │ Internet Available
                 ▼
        ┌──────────────────┐
        │ Node.js + Express │
        │                  │
        │ REST APIs        │
        │ Authentication   │
        │ Validation       │
        │ Sync Engine      │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │     MongoDB      │
        │                  │
        │ Users            │
        │ Patients         │
        │ Medical Records  │
        │ Sync Metadata    │
        └──────────────────┘
```

---

## 🔄 How the Offline-First Flow Works

```text
User Action
     ↓
Create / Update Patient
     ↓
IndexedDB
     ↓
Sync Queue
     ↓
Continue Working Offline
     ↓
Internet Returns
     ↓
Sync Engine
     ↓
Express REST API
     ↓
Data Validation
     ↓
MongoDB
     ↓
Sync Confirmed
```

The synchronization layer is designed to reduce:

* Duplicate records
* Lost updates
* Failed synchronization
* Inconsistent local state

---

## 🤖 AI-Assisted Camera Screening

MediLog Edge uses TensorFlow.js for lightweight AI inference directly on the user's device.

```text
Device Camera
     ↓
React Camera Component
     ↓
TensorFlow.js Model
     ↓
On-Device Inference
     ↓
Screening Result
     ↓
Patient Record
```

This reduces dependency on continuous internet connectivity.

The AI functionality is intended for screening and decision support, not as a replacement for professional medical diagnosis.

---

## 🎙️ Voice-Based Medical Data Entry

Healthcare workers can provide patient information through voice instead of manually entering every field.

```text
Healthcare Worker
       ↓
Voice Input
       ↓
Google Speech-to-Text
       ↓
Transcribed Text
       ↓
Gemini API
       ↓
Structured Patient JSON
       ↓
Schema Validation
       ↓
Patient Record
       ↓
IndexedDB / MongoDB
```

Example input:

```text
Patient is 42 years old and has fever and cough
for the last three days.
```

Example structured output:

```json
{
  "patientName": "Example Patient",
  "age": 42,
  "symptoms": ["fever", "cough"],
  "duration": "3 days"
}
```

AI-generated information must be validated before being stored as patient data.

---

## 🔐 Authentication

MediLog Edge uses JWT-based authentication.

```text
User
 ↓
Login
 ↓
Express API
 ↓
Credential Validation
 ↓
JWT Generation
 ↓
React Application
 ↓
Authenticated Requests
 ↓
Protected API Routes
```

Patient information should only be accessible to authenticated and authorized users.

---

## 🧰 Technology Stack

| Layer          | Technologies          |
| -------------- | --------------------- |
| Frontend       | React.js, JavaScript  |
| Web Platform   | PWA, Service Workers  |
| Local Storage  | IndexedDB             |
| Backend        | Node.js, Express.js   |
| API            | REST APIs             |
| Database       | MongoDB               |
| Authentication | JWT                   |
| Edge AI        | TensorFlow.js         |
| Voice          | Google Speech-to-Text |
| Generative AI  | Gemini API            |

---

## 📂 Project Structure

```text
MediLog-Edge/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── ai/
│   │   ├── db/
│   │   └── utils/
│   │
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── README.md
├── .env.example
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* Git
* MongoDB or MongoDB Atlas

### Clone the repository

```bash
git clone <repository-url>
cd MediLog-Edge
```

### Install frontend dependencies

```bash
cd client
npm install
```

### Install backend dependencies

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=your_google_credentials
```

For contributors, use `.env.example`:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
```

### Security

Never commit secrets to GitHub.

Do not commit:

* API keys
* JWT secrets
* Google credentials
* Database passwords
* `.env` files
* Service-account JSON files

Make sure sensitive files are included in `.gitignore`.

---

## ▶️ Run the Project

Start the backend:

```bash
cd server
npm run dev
```

Open another terminal and start the frontend:

```bash
cd client
npm run dev
```

Then open the local development URL provided by Vite.

---

## 🧪 Testing Checklist

Before submitting a Pull Request, contributors should verify their changes.

### Offline functionality

* [ ] Create a patient while offline
* [ ] Update a patient while offline
* [ ] Refresh the application
* [ ] Verify local data remains available
* [ ] Reconnect to the internet
* [ ] Verify queued operations synchronize
* [ ] Verify duplicate records are not created

### Authentication

* [ ] Valid login
* [ ] Invalid credentials
* [ ] Invalid or expired JWT
* [ ] Protected routes
* [ ] Unauthorized access handling

### AI

* [ ] Camera permission handling
* [ ] TensorFlow.js model loading
* [ ] Camera screening
* [ ] Voice input
* [ ] Speech-to-Text conversion
* [ ] Gemini JSON extraction
* [ ] Invalid AI response handling
* [ ] JSON/schema validation

---

## 🤝 Contributing

MediLog Edge is part of the GDGoC PSIT Hacktoberfest initiative.

### Contribution Flow

```text
Explore Issues
      ↓
Choose an Issue
      ↓
Claim / Get Assigned
      ↓
Fork Repository
      ↓
Create Feature Branch
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
Changes Requested
      ↓
Make Changes
      ↓
Review Again
      ↓
Approved
      ↓
Merged
```

---

## 🌱 Contribution Areas

| Area              | Possible Contributions                                                         |
| ----------------- | ------------------------------------------------------------------------------ |
| 🎨 Frontend       | Patient UI, dashboard, PWA, responsive design, accessibility                   |
| 📱 Offline System | IndexedDB, caching, sync queue, background sync, conflict handling             |
| ⚙️ Backend        | REST APIs, MongoDB schemas, authentication, authorization, validation          |
| 🤖 AI             | TensorFlow.js, camera integration, Speech-to-Text, Gemini, response validation |
| 🧪 Testing        | Unit tests, API tests, offline tests, integration tests, error handling        |
| 📚 Documentation  | Developer docs, API docs, setup guides, user guides                            |

---

## 📌 Contribution Rules

1. Check existing Issues before starting work.
2. Do not work on an issue without claiming it or receiving maintainer approval.
3. Keep your Pull Request focused on the assigned issue.
4. Do not make unrelated changes.
5. Follow the existing project structure.
6. Test your changes locally.
7. Never commit secrets or credentials.
8. Clearly describe your implementation in the PR.
9. Mention the issue being resolved.
10. Respond to maintainer review comments.

---

## 🔀 Branch Naming

Use descriptive branch names.

```text
feature/patient-dashboard
feature/indexeddb-sync
feature/jwt-auth
feature/tensorflow-screening
fix/offline-sync
docs/setup-guide
test/patient-api
```

---

## 📝 Commit Convention

Use clear and meaningful commit messages.

```text
feat: add patient registration
fix: resolve offline sync issue
docs: update setup instructions
test: add patient API tests
refactor: improve sync service
```

---

## 🔮 Future Scope

Potential future improvements include:

* Multi-language voice support
* Advanced edge-AI screening
* Improved conflict resolution
* Automatic medical report generation
* Healthcare device integration
* Patient analytics
* Better offline synchronization
* Federated or on-device learning
* Additional accessibility features

---

## 🎯 SDG 3 Alignment

### Good Health and Well-Being

MediLog Edge supports Sustainable Development Goal 3 by exploring accessible digital healthcare solutions for communities where connectivity and digital infrastructure may be limited.

The project focuses on improving:

* Healthcare data accessibility
* Continuity of digital records
* Basic screening support
* Healthcare worker efficiency
* Access to technology in low-connectivity environments

---

## ⚠️ Medical Disclaimer

MediLog Edge is an educational and open-source technology project.

AI-generated outputs and screening results are intended to provide assistance and decision support. They should not be treated as definitive medical diagnoses.

Healthcare professionals should make final clinical decisions.

---

## 👥 Maintainers

GDGoC PSIT Kanpur

This project is developed as part of the GDGoC PSIT Hacktoberfest initiative.

---

## 📄 License

The project license will be finalized by the maintainers.
