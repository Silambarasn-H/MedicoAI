# MedicoAI – REST API Documentation

Base URL: `http://localhost:8080/api`

---

## Authentication Endpoints

| Method | Endpoint                  | Description              | Access  |
|--------|---------------------------|--------------------------|---------|
| POST   | `/auth/register`          | Register new user        | Public  |
| POST   | `/auth/login`             | Login & get JWT token    | Public  |
| POST   | `/auth/refresh-token`     | Refresh JWT token        | Public  |
| POST   | `/auth/logout`            | Logout user              | Auth    |
| POST   | `/auth/forgot-password`   | Send reset email         | Public  |
| POST   | `/auth/reset-password`    | Reset password           | Public  |

---

## User Endpoints

| Method | Endpoint                  | Description              | Access  |
|--------|---------------------------|--------------------------|---------|
| GET    | `/users/me`               | Get current user profile | Auth    |
| PUT    | `/users/me`               | Update profile           | Auth    |
| PUT    | `/users/me/password`      | Change password          | Auth    |
| POST   | `/users/me/avatar`        | Upload profile image     | Auth    |

---

## Admin Endpoints

| Method | Endpoint                        | Description              | Access  |
|--------|---------------------------------|--------------------------|---------|
| GET    | `/admin/dashboard`              | Dashboard analytics      | ADMIN   |
| GET    | `/admin/users`                  | List all users           | ADMIN   |
| PUT    | `/admin/users/{id}/status`      | Activate/deactivate user | ADMIN   |
| DELETE | `/admin/users/{id}`             | Delete user              | ADMIN   |
| GET    | `/admin/reports/revenue`        | Revenue report           | ADMIN   |
| GET    | `/admin/reports/appointments`   | Appointment report       | ADMIN   |

---

## Doctor Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| GET    | `/doctors`                            | List all doctors         | Public  |
| GET    | `/doctors/{id}`                       | Get doctor by ID         | Public  |
| GET    | `/doctors/specialization/{spec}`      | Filter by specialization | Public  |
| POST   | `/doctors`                            | Create doctor profile    | ADMIN   |
| PUT    | `/doctors/{id}`                       | Update doctor profile    | ADMIN/DOCTOR |
| GET    | `/doctors/me/appointments`            | My appointments          | DOCTOR  |
| GET    | `/doctors/me/patients`                | My patients              | DOCTOR  |

---

## Patient Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| GET    | `/patients`                           | List all patients        | ADMIN   |
| GET    | `/patients/{id}`                      | Get patient by ID        | ADMIN/DOCTOR |
| POST   | `/patients`                           | Create patient profile   | Auth    |
| PUT    | `/patients/{id}`                      | Update patient profile   | Auth    |
| GET    | `/patients/me`                        | My patient profile       | PATIENT |

---

## Appointment Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| GET    | `/appointments`                       | List appointments        | ADMIN   |
| GET    | `/appointments/{id}`                  | Get appointment by ID    | Auth    |
| POST   | `/appointments`                       | Book appointment         | PATIENT |
| PUT    | `/appointments/{id}`                  | Update appointment       | Auth    |
| PUT    | `/appointments/{id}/cancel`           | Cancel appointment       | Auth    |
| PUT    | `/appointments/{id}/reschedule`       | Reschedule appointment   | Auth    |
| PUT    | `/appointments/{id}/confirm`          | Confirm appointment      | DOCTOR/ADMIN |
| PUT    | `/appointments/{id}/complete`         | Mark as completed        | DOCTOR  |
| GET    | `/appointments/patient/{patientId}`   | Patient's appointments   | Auth    |
| GET    | `/appointments/doctor/{doctorId}`     | Doctor's appointments    | Auth    |

---

## Prescription Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| GET    | `/prescriptions/{id}`                 | Get prescription         | Auth    |
| POST   | `/prescriptions`                      | Create prescription      | DOCTOR  |
| PUT    | `/prescriptions/{id}`                 | Update prescription      | DOCTOR  |
| GET    | `/prescriptions/patient/{patientId}`  | Patient prescriptions    | Auth    |
| GET    | `/prescriptions/appointment/{apptId}` | Appointment prescription | Auth    |

---

## Report Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| GET    | `/reports/{id}`                       | Get report               | Auth    |
| POST   | `/reports/upload`                     | Upload report            | DOCTOR/ADMIN |
| GET    | `/reports/patient/{patientId}`        | Patient reports          | Auth    |
| GET    | `/reports/{id}/download`              | Download report          | Auth    |
| DELETE | `/reports/{id}`                       | Delete report            | ADMIN   |

---

## Payment Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| POST   | `/payments/initiate`                  | Initiate payment         | PATIENT |
| POST   | `/payments/verify`                    | Verify payment           | PATIENT |
| GET    | `/payments/{id}`                      | Get payment details      | Auth    |
| GET    | `/payments/patient/{patientId}`       | Patient payment history  | Auth    |
| POST   | `/payments/{id}/refund`               | Refund payment           | ADMIN   |

---

## Notification Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| GET    | `/notifications`                      | My notifications         | Auth    |
| PUT    | `/notifications/{id}/read`            | Mark as read             | Auth    |
| PUT    | `/notifications/read-all`             | Mark all as read         | Auth    |
| DELETE | `/notifications/{id}`                 | Delete notification      | Auth    |

---

## AI Endpoints

| Method | Endpoint                              | Description              | Access  |
|--------|---------------------------------------|--------------------------|---------|
| POST   | `/ai/chat`                            | AI chatbot message       | Auth    |
| POST   | `/ai/symptom-analysis`                | Analyze symptoms         | Auth    |
| GET    | `/ai/chat/history`                    | Chat history             | Auth    |

---

## Request / Response Format

### Login Request
```json
{
  "email": "patient@example.com",
  "password": "Password@123"
}
```

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "patient@example.com",
      "role": "PATIENT"
    }
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/auth/login"
}
```
