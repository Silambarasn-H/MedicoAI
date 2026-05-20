# 🏥 MedicoAI – AI Powered Hospital & Patient Management System

![MedicoAI Banner](docs/banner.png)

> A full-stack, production-grade hospital management system with AI-powered features, built with **React.js** (frontend) and **Java Spring Boot** (backend).

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Tables](#database-tables)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [GitHub Push Instructions](#github-push-instructions)

---

## ✨ Features

### 🔐 Authentication
- User Registration & Login
- JWT-based Authentication (Access + Refresh Tokens)
- Role-based Access Control: **Admin**, **Doctor**, **Patient**
- Password Encryption (BCrypt)
- Forgot/Reset Password via Email

### 👨‍💼 Admin Dashboard
- Manage Doctors & Patients
- View & Manage All Appointments
- Analytics Dashboard (Charts & Stats)
- Revenue Statistics
- Generate Reports

### 👨‍⚕️ Doctor Dashboard
- View Scheduled Appointments
- Manage Patient Records
- Add Prescriptions
- Upload Medical Reports
- AI-Assisted Suggestions

### 🧑‍🤝‍🧑 Patient Dashboard
- Book / Cancel / Reschedule Appointments
- View Prescriptions
- Download Medical Reports
- Payment History
- Profile Management

### 🤖 AI Features
- AI Chatbot for Medical Guidance
- Symptom Analysis
- Basic Disease Prediction
- Health Recommendations

### 💳 Payments
- Online Payment Integration (Razorpay/Stripe)
- Payment History & Receipts
- Refund Management

### 🔔 Notifications
- Email Notifications (SMTP)
- Appointment Reminders
- In-App Notifications

---

## 🛠 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React.js 18, React Router v6, Axios, Redux Toolkit, Chart.js |
| Backend    | Java 17, Spring Boot 3.2, Spring Security, JWT  |
| Database   | MySQL 8.0, JPA/Hibernate                        |
| Build Tool | Maven (Backend), Vite (Frontend)                |
| API Docs   | Swagger UI (SpringDoc OpenAPI)                  |
| Email      | Spring Mail (Gmail SMTP)                        |

---

## 📁 Project Structure

```
MedicoAI/
├── backend/                          # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/medicoai/
│   │   │   │   ├── MedicoAiApplication.java
│   │   │   │   ├── config/           # Security, CORS, Swagger config
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   ├── dto/
│   │   │   │   │   ├── request/      # Request DTOs
│   │   │   │   │   └── response/     # Response DTOs
│   │   │   │   ├── entity/           # JPA Entities
│   │   │   │   ├── enums/            # Enumerations
│   │   │   │   ├── exception/        # Custom Exceptions & Handler
│   │   │   │   ├── repository/       # JPA Repositories
│   │   │   │   ├── security/         # JWT Filter, UserDetails
│   │   │   │   ├── service/          # Service Interfaces
│   │   │   │   │   └── impl/         # Service Implementations
│   │   │   │   └── util/             # Utility Classes
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/                         # React Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── styles/               # Global CSS
│   │   ├── components/
│   │   │   ├── common/               # Navbar, Sidebar, Footer, Cards
│   │   │   ├── admin/                # Admin-specific components
│   │   │   ├── doctor/               # Doctor-specific components
│   │   │   ├── patient/              # Patient-specific components
│   │   │   ├── auth/                 # Login, Register forms
│   │   │   └── ai/                   # AI Chatbot component
│   │   ├── pages/
│   │   │   ├── admin/                # Admin pages
│   │   │   ├── doctor/               # Doctor pages
│   │   │   ├── patient/              # Patient pages
│   │   │   └── auth/                 # Auth pages
│   │   ├── context/                  # React Context (Auth, Theme)
│   │   ├── hooks/                    # Custom React Hooks
│   │   ├── services/                 # Axios API service calls
│   │   ├── utils/                    # Helper functions
│   │   ├── routes/                   # Protected route components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql                    # Full DB schema with seed data
│
├── docs/
│   └── API_DOCUMENTATION.md          # Complete API reference
│
└── README.md
```

---

## 🗄 Database Tables

| Table             | Description                              |
|-------------------|------------------------------------------|
| `users`           | All users (Admin, Doctor, Patient)       |
| `doctors`         | Doctor profiles & availability           |
| `patients`        | Patient profiles & medical history       |
| `appointments`    | Appointment bookings & status            |
| `prescriptions`   | Doctor prescriptions per appointment     |
| `reports`         | Medical reports & file references        |
| `payments`        | Payment transactions & status            |
| `notifications`   | In-app & email notification records      |
| `ai_chat_history` | AI chatbot conversation history          |

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool        | Version   | Download                              |
|-------------|-----------|---------------------------------------|
| Java JDK    | 17+       | https://adoptium.net/                 |
| Maven       | 3.9+      | https://maven.apache.org/             |
| Node.js     | 18+       | https://nodejs.org/                   |
| MySQL       | 8.0+      | https://dev.mysql.com/downloads/      |
| Git         | Latest    | https://git-scm.com/                  |

---

## 🚀 Setup Guide

### Step 1 – Clone the Repository
```bash
git clone https://github.com/yourusername/MedicoAI.git
cd MedicoAI
```

### Step 2 – Database Setup
```sql
-- Open MySQL and run:
CREATE DATABASE medicoai_db;
-- Then run the schema file:
mysql -u root -p medicoai_db < database/schema.sql
```

### Step 3 – Backend Configuration
```bash
cd backend
# Edit src/main/resources/application.properties
# Update:
#   spring.datasource.password=YOUR_MYSQL_PASSWORD
#   spring.mail.username=YOUR_EMAIL
#   spring.mail.password=YOUR_APP_PASSWORD
#   app.jwt.secret=YOUR_STRONG_SECRET_KEY
```

### Step 4 – Run Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Backend starts at: http://localhost:8080
# Swagger UI at:     http://localhost:8080/api/swagger-ui.html
```

### Step 5 – Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend starts at: http://localhost:3000
```

---

## 🏃 Running the Application

| Service   | URL                                          |
|-----------|----------------------------------------------|
| Frontend  | http://localhost:3000                        |
| Backend   | http://localhost:8080/api                    |
| Swagger   | http://localhost:8080/api/swagger-ui.html    |

### Default Login Credentials
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@medicoai.com     | Admin@123   |

---

## 📖 API Documentation

Full API reference is available at:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **Markdown**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 🚢 Deployment

### Backend – Deploy to AWS EC2 / Render / Railway

```bash
# Build JAR
cd backend
mvn clean package -DskipTests

# Run JAR
java -jar target/medicoai-backend-1.0.0.jar \
  --spring.datasource.url=jdbc:mysql://YOUR_DB_HOST:3306/medicoai_db \
  --spring.datasource.password=YOUR_PASSWORD \
  --app.jwt.secret=YOUR_SECRET
```

### Frontend – Deploy to Vercel / Netlify

```bash
cd frontend
npm run build
# Upload the 'dist' folder to Vercel/Netlify
# Set environment variable: VITE_API_BASE_URL=https://your-backend-url.com/api
```

### Docker (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🧪 Testing Guide

### Backend Tests
```bash
cd backend
mvn test                          # Run all unit tests
mvn test -Dtest=AuthControllerTest # Run specific test
```

### Frontend Tests
```bash
cd frontend
npm test                          # Run all tests
npm run test:coverage             # With coverage report
```

### Manual API Testing
- Import `docs/MedicoAI.postman_collection.json` into Postman
- Or use Swagger UI at http://localhost:8080/api/swagger-ui.html

---

## 📤 GitHub Push Instructions

```bash
# 1. Initialize git (if not already)
git init

# 2. Add all files
git add .

# 3. Initial commit
git commit -m "feat: initial MedicoAI project setup"

# 4. Create repo on GitHub, then add remote
git remote add origin https://github.com/yourusername/MedicoAI.git

# 5. Push to main branch
git branch -M main
git push -u origin main
```

### Recommended Branch Strategy
```
main          → Production-ready code
develop       → Integration branch
feature/*     → New features
bugfix/*      → Bug fixes
hotfix/*      → Critical production fixes
```

---

## 👥 Default Roles & Permissions

| Feature                  | Admin | Doctor | Patient |
|--------------------------|-------|--------|---------|
| Manage Users             | ✅    | ❌     | ❌      |
| View All Appointments    | ✅    | ❌     | ❌      |
| Manage Own Appointments  | ✅    | ✅     | ✅      |
| Add Prescriptions        | ❌    | ✅     | ❌      |
| View Prescriptions       | ✅    | ✅     | ✅      |
| Upload Reports           | ✅    | ✅     | ❌      |
| Download Reports         | ✅    | ✅     | ✅      |
| View Analytics           | ✅    | ❌     | ❌      |
| Use AI Chatbot           | ✅    | ✅     | ✅      |
| Make Payments            | ❌    | ❌     | ✅      |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'feat: add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

*Built with ❤️ using React.js & Spring Boot*
