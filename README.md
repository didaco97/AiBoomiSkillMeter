# 🎓 SkillMeter AI - Complete Tech Stack Documentation

<div align="center">
  <img src="public/logo.png" alt="SkillMeter Logo" width="120"/>
  
  **AI-Powered Personalized Learning Platform**
  
  [![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)](https://vitejs.dev/)
  [![Django](https://img.shields.io/badge/Django-5.2.10-092E20?logo=django)](https://djangoproject.com/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
  [![Google Gemini](https://img.shields.io/badge/Gemini_AI-3_Flash_Preview-4285F4?logo=google)](https://ai.google.dev/)
</div>

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Frontend Tech Stack](#-frontend-tech-stack)
4. [Backend Tech Stack](#-backend-tech-stack)
5. [Database Schema](#-database-schema)
6. [AI & External APIs](#-ai--external-apis)
7. [New Features (Detailed)](#-new-features-detailed)
    - [Mentor Connect & Mock Interview](#mentor-connect--mock-interview)
    - [AI Study Room](#ai-study-room)
    - [Certificate Verification System](#certificate-verification-system)
    - [Notification System](#notification-system)
8. [Setup & Installation](#-setup--installation)

---

## 🎯 Project Overview

SkillMeter AI is a comprehensive, AI-powered learning management system that creates personalized learning roadmaps. It goes beyond simple courses by integrating real-time AI monitoring, mock interviews, and automated certification verification.

**Key Highlights:**
- 🤖 **AI-Generated Roadmaps**: Personalized course structures using Gemini AI.
- 📹 **Smart Content**: Integrates real YouTube videos and auto-generated notes.
- 🧠 **AI Study Room**: Real-time focus tracking using Computer Vision (MediaPipe).
- 🤝 **Mentor Connect**: Find experts and practice mock interviews in a simulator.
- 📜 **Verifiable Certificates**: QR-code backed certificates generated server-side.
- 🔔 **Multi-Channel Alerts**: WhatsApp and Email notifications via Twilio.
- 🎨 **Neo-Brutalist UI**: Distinctive, high-contrast, fun aesthetic.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │ Components  │  │     Contexts            │  │
│  │ (16 views)  │  │ (60+ UI)    │  │ Auth | Learning         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST (JWT Auth)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Django REST Framework)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Views     │  │ Serializers │  │     Services            │  │
│  │ (API Views) │  │ (DRF)       │  │ AI | YouTube | PDF      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ SQLite3  │   │ Gemini   │   │ Twilio   │
        │ Database │   │ AI API   │   │ Notify   │
        └──────────┘   └──────────┘   └──────────┘
```

---

## 🚀 New Features (Detailed)

### Mentor Connect & Mock Interview
**File:** `src/pages/MentorConnect.jsx`

A comprehensive module combining social connection with technical preparation.

1.  **Dual-Mode Interface**:
    *   **Find Mentors**: A marketplace grid to browse and connect with industry experts.
    *   **Mock Interview**: A fully interactive simulator for self-practice.

2.  **Advanced Layout Engine**:
    *   **Independent Scroll Architecture**: The page features a fixed header and sidebar with an independently scrolling content area (`h-[170vh]`), allowing for a "dashboard" feel while scrolling deep content.
    *   **3D Header Transitions**: The main page title uses `AnimatePresence` and `rotateX` transforms to 3D-flip between "Mentor Connect" and "Mock Interview" when tabs are switched.

3.  **Dynamic Sidebar**:
    *   Context-aware sidebar that switches between **Trending Articles** (in Mentor Mode) and **Interview Topics** (in Simulator Mode).
    *   **Topic Selector**: Allows users to choose question categories (React, Node.js, System Design, Behavioral, DSA).

4.  **Interactive Interview Simulator**:
    *   **Real-time Voice Interactions**: Integrated client-side Speech-to-Text (`webkitSpeechRecognition`) allows users to verbally answer questions.
    *   **Context-Aware AI**: The AI (Gemini 1.5 Flash) listens to the candidate's answer and generates follow-up questions dynamically (no pre-canned scripts).
    *   **Live Performance Analysis**: Post-session reports with Score (0-100), detailed Feedback, and Transcript analysis.
    *   **Webcam & Avatar**: Split-screen interface with user video and AI Interviewer avatar (LiveKit integration).
    *   **Dynamic Question Bank**: Questions update in real-time based on the selected sidebar topic.

5.  **Mentor Cards**:
    *   **Visuals**: Custom illustration avatars (DiceBear Lorelei styling).
    *   **Localization**: Pricing displayed in Indian Rupees (₹/min).
    *   **Socials**: Direct LinkedIn integration buttons on every card.

---

### AI Study Room
**File:** `src/pages/StudyRoom.jsx`

A "Proctoring-lite" feature that helps users maintain focus during study sessions.

1.  **Technology**: Uses `@mediapipe/face_mesh` for real-time, client-side computer vision.
2.  **Features**:
    *   **Landmark Detection**: Tracks 468 facial landmarks to determine head orientation in 3D space.
    *   **Distraction Logic**: Detects if user looks Left, Right, or Up for extended periods. (Looking down is allowed for taking notes).
    *   **Alert System**: Triggers visual red-screen flashes and audio beeps when distracted.
    *   **Session Analytics**: Tracks "Focus Percentage" and "Distraction Count", saving detailed sessions to the database.

---

### Certificate Verification System
**File:** `backend/utils/certificate.py` & `src/pages/VerifyCertificate.jsx`

A robust system to ensure credential authenticity.

1.  **Server-Side Generation**: Uses Python `reportlab` to generate high-resolution PDFs with vector graphics.
2.  **Security**:
    *   **Unique ID**: Each certificate has a SHA-256 based unique identifier.
    *   **QR Code**: Embedded QR code links directly to the public verification page.
3.  **Public Verification Page**:
    *   Route: `/verify-certificate/:certificateId`
    *   Fetches live data from the backend to validate the certificate's existence and ownership.
    *   Displays a digital replica of the certificate for validation.

---

### Notification System
**File:** `backend/utils/notifications.py`

Multi-channel alert system to keep learners engaged.

1.  **Twilio Integration**: Sends automated messages via **WhatsApp** and **Email**.
2.  **Triggers**:
    *   **Course Completion**: "Congratulations on finishing React!"
    *   **Certificate Earned**: Link to download the new certificate.
3.  **Logging**: Maintains a history of all sent notifications in the database (`NotificationLog` model).

---

## 💻 Frontend Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for building component-based interfaces |
| **Vite** | 5.4.19 | Next-generation frontend build tool with HMR |
| **React Router DOM** | 6.30.1 | Client-side routing and navigation |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **TailwindCSS** | 3.4.17 | Utility-first CSS framework |
| **Framer Motion** | 12.26.2 | Complex animations (3D flips, layout transitions) |
| **Lucide React** | 0.462.0 | Iconography (LinkedIn, Camera, etc.) |
| **Radix UI** | Various | Headless accessible UI primitives |
| **shadcn/ui** | Latest | Re-usable component library |

### Computer Vision

| Library | Version | Purpose |
|---------|---------|---------|
| **livekit-client** | 1.15.x | WebRTC video/audio handling for Mock Interview |
| **@mediapipe/face_mesh** | 0.4.x | Face landmark detection for Study Room |
| **@mediapipe/camera_utils** | 0.3.x | Camera stream management |

---

## 🐍 Backend Tech Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Django** | 5.2.10 | Python web framework |
| **Django REST Framework** | Latest | API Toolkit |
| **Python** | 3.10+ | Runtime |

### New Integrations

| Library | Purpose |
|---------|---------|
| **django-channels** | WebSocket support for real-time signaling (Daphne) |
| **google-genai** | Gemini 1.5 Flash integration for conversational AI |
| **livekit-api** | Real-time video/audio room management |
| **twilio** | Sending WhatsApp and Email notifications |
| **qrcode** | Generating verification QR codes for certificates |
| **reportlab** | PDF Certificate generation |

### Database Models (Expanded)

1.  **StudySession**: Tracks user focus sessions (duration, distractions, focus score).
2.  **NotificationLog**: Records history of sent alerts.
3.  **Roadmap**: Updated with `certificate_id` and `completed_at` for verification.

---

## 📂 Project Structure

```
SkillMeterAi/
├── 📁 src/
│   ├── 📁 pages/
│   │   ├── MentorConnect.jsx       # NEW: Mentors + Simulator
│   │   ├── StudyRoom.jsx           # NEW: AI Focus Tracking
│   │   ├── VerifyCertificate.jsx   # NEW: Public Verification
│   │   └── ...
│   ├── 📁 components/
│   │   ├── 📁 layout/              # Dashboard interactions
│   │   └── ...
│
├── 📁 backend/
│   ├── 📁 api/
│   │   ├── 📁 utils/
│   │   │   ├── certificate.py      # PDF & QR Logic
│   │   │   └── notifications.py    # Twilio Logic
│   │   ├── services.py             # Gemini & YouTube Logic
│   │   └── ...
```

---

## 🚀 Setup & Installation

### Frontend Setup

```bash
# Install dependencies (includes new mediapipe packages)
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Install Python dependencies (includes twilio, qrcode, reportlab)
pip install django djangorestframework django-cors-headers python-dotenv google-generativeai requests reportlab qrcode twilio

# Run migrations (for new StudySession/Notification models)
python manage.py migrate

# Start server
python manage.py runserver 0.0.0.0:8000
```
