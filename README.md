# SAMS API

REST API for a small hospital or clinic management system built with `Node.js`, `TypeScript`, `Express`, `Prisma`, `MySQL`, `JWT`, and `Zod`.

The project supports:
- User authentication
- Patient and doctor registration
- Admin management
- Doctor management
- Doctor schedules
- Patient appointments
- Swagger API documentation

## Tech Stack

- `Node.js`
- `TypeScript`
- `Express 5`
- `Prisma`
- `MySQL / MariaDB`
- `JWT`
- `bcrypt`
- `Zod`
- `Swagger`

## Project Structure

```text
src/
  controller/    Request handlers
  routes/        API routes
  services/      Business logic
  validator/     Zod schemas
  middleware/    Auth and validation middleware
  lib/           Prisma and JWT helpers
prisma/
  schema.prisma  Database schema
  migrations/    Prisma migrations
```

## Roles

The system uses three roles:

- `patient`
- `doctor`
- `admin`

Role behavior:
- `patient` can create and manage their own appointments.
- `doctor` can manage their own schedules and view/update appointments related to them.
- `admin` can manage admins and doctors, and can access all appointments.

## Database Models

Main entities in the system:

- `User`
  - stores common account data for patients, doctors, and admins
- `DoctorProfile`
  - stores doctor-specific profile data like specialization and consultation fee
- `Schedule`
  - stores doctor weekly availability
- `Appointment`
  - stores patient bookings with doctors

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
DATABASE_USER="root"
DATABASE_PASSWORD="your_password"
DATABASE_NAME="sams_db"
DATABASE_HOST="localhost"
DATABASE_PORT=3306
JWT_SECRET="your_jwt_secret"
```

Notes:
- Do not commit real credentials.
- `JWT_SECRET` is required for login, auth middleware, and password reset tokens.

## Installation

```bash
npm install
```

## Database Setup

Run migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client if needed:

```bash
npx prisma generate
```

## Run the Project

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start compiled app:

```bash
npm start
```

Default server URL:

```text
http://localhost:3000
```

## Scripts

- `npm run dev` - start with nodemon
- `npm run build` - compile TypeScript
- `npm run lint` - type-check project
- `npm run test` - build and run tests from `dist`
- `npm start` - run compiled build

## API Documentation

Swagger UI:

```text
GET /api-docs
```

Swagger JSON:

```text
GET /api-docs.json
```

## Authentication

Protected routes require this header:

```http
Authorization: Bearer <jwt_token>
```

Login returns a JWT token in the response body.

## Response Format

Most endpoints return this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error example:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

## API Endpoints

Base URL:

```text
http://localhost:3000/api
```

---

## 1. Auth APIs

### 1.1 Login

- Method: `POST`
- Endpoint: `/auth/login`
- Access: Public

Request body:

```json
{
  "username": "john_doe",
  "password": "StrongPass123"
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | Yes | Username or email, minimum 3 chars |
| `password` | string | Yes | Minimum 8 chars |

### 1.2 Register

- Method: `POST`
- Endpoint: `/auth/register`
- Access: Public

Request body for patient:

```json
{
  "email": "patient@example.com",
  "username": "patient_1",
  "password": "StrongPass123",
  "fullName": "Patient One",
  "role": "patient"
}
```

Request body for doctor:

```json
{
  "email": "doctor@example.com",
  "username": "doctor_1",
  "password": "StrongPass123",
  "fullName": "Doctor One",
  "role": "doctor",
  "specialization": "Cardiology",
  "bio": "Cardiologist with 10 years of experience.",
  "consultationFee": 3000,
  "experienceYears": 10
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Must be a valid email |
| `username` | string | Yes | 3 to 20 chars, letters/numbers/underscore only |
| `password` | string | Yes | At least 8 chars, must contain uppercase, lowercase, and number |
| `fullName` | string | Yes | 2 to 100 chars |
| `role` | string | Yes | `patient` or `doctor` |
| `specialization` | string | Doctor only | Required when `role` is `doctor` |
| `bio` | string | No | Max 1000 chars |
| `consultationFee` | number | Doctor only | Must be positive |
| `experienceYears` | number | Doctor only | Whole number, minimum 0 |

### 1.3 Forgot Password

- Method: `POST`
- Endpoint: `/auth/forgot-password`
- Access: Public

Request body:

```json
{
  "identifier": "john@example.com"
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `identifier` | string | Yes | Username or email |

Note:
- The current implementation returns a reset token in the response for valid accounts.

### 1.4 Reset Password

- Method: `POST`
- Endpoint: `/auth/reset-password`
- Access: Public

Request body:

```json
{
  "token": "reset-token-value",
  "newPassword": "NewStrongPass123",
  "confirmPassword": "NewStrongPass123"
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `token` | string | Yes | Password reset token |
| `newPassword` | string | Yes | At least 8 chars, must contain uppercase, lowercase, and number |
| `confirmPassword` | string | Yes | Must match `newPassword` |

### 1.5 Change Password

- Method: `POST`
- Endpoint: `/auth/change-password`
- Access: Protected

Request body:

```json
{
  "currentPassword": "CurrentPass123",
  "newPassword": "NewStrongPass123"
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `currentPassword` | string | Yes | Current account password |
| `newPassword` | string | Yes | Must be different from current password |

### 1.6 Logout

- Method: `POST`
- Endpoint: `/auth/logout`
- Access: Protected
- Request body: None

### 1.7 Get Current User

- Method: `GET`
- Endpoint: `/auth/me`
- Access: Protected
- Request body: None

Alias:

- `GET /auth/user`

---

## 2. Doctor APIs

### 2.1 List Doctors

- Method: `GET`
- Endpoint: `/doctors`
- Access: Public
- Request body: None

Optional query params:

| Query Param | Type | Notes |
|---|---|---|
| `specialization` | string | Filter by specialization |
| `search` | string | Search in name, username, or email |

### 2.2 Get Current Doctor

- Method: `GET`
- Endpoint: `/doctors/me`
- Access: Protected, `doctor` only
- Request body: None

Behavior:
- Returns the currently logged-in doctor's profile from the database.
- Also returns these top-level profile fields when available:
  - `specialization`
  - `bio`
  - `consultationFee`
  - `experienceYears`

### 2.3 Get Doctor By ID

- Method: `GET`
- Endpoint: `/doctors/:id`
- Access: Public
- Request body: None

Path params:

| Param | Type | Notes |
|---|---|---|
| `id` | number | Doctor user id |

### 2.4 Create Doctor

- Method: `POST`
- Endpoint: `/doctors`
- Access: Protected, `admin` only

Request body:

```json
{
  "username": "dr_khan",
  "email": "dr.khan@example.com",
  "password": "DoctorPass123",
  "fullName": "Dr. Khan",
  "phone": "+923001112223",
  "specialization": "Dermatology",
  "bio": "Experienced dermatologist.",
  "consultationFee": 2500,
  "experienceYears": 7,
  "isActive": true
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | Yes | 3 to 30 chars |
| `email` | string | Yes | Valid email |
| `password` | string | Yes | 8 to 72 chars |
| `fullName` | string | Yes | 2 to 120 chars |
| `phone` | string | No | 7 to 20 chars |
| `specialization` | string | Yes | 2 to 120 chars |
| `bio` | string | No | Max 1000 chars |
| `consultationFee` | number | Yes | Positive number |
| `experienceYears` | number | No | Whole number, 0 to 70 |
| `isActive` | boolean | No | Defaults to `true` |

### 2.5 Update Current Doctor

- Method: `PATCH`
- Endpoint: `/doctors/me`
- Access: Protected, `doctor` only

Request body example:

```json
{
  "fullName": "Dr. K. Khan",
  "consultationFee": 2800,
  "experienceYears": 8,
  "bio": "Updated bio."
}
```

Allowed fields:

| Field | Type |
|---|---|
| `username` | string |
| `email` | string |
| `fullName` | string |
| `phone` | string or null |
| `specialization` | string |
| `bio` | string or null |
| `consultationFee` | number |
| `experienceYears` | number |

Rules:
- Only the authenticated doctor can update this endpoint.
- At least one field must be provided.
- `phone` can be `null`.
- `bio` can be `null`.
- Doctors cannot change `isActive` from this endpoint.

Response:
- Returns the updated doctor record and also includes top-level `specialization`, `bio`, `consultationFee`, and `experienceYears`.

### 2.6 Update Doctor

- Method: `PATCH`
- Endpoint: `/doctors/:id`
- Access: Protected, `admin` only

Request body example:

```json
{
  "fullName": "Dr. K. Khan",
  "consultationFee": 2800,
  "experienceYears": 8,
  "bio": "Updated bio."
}
```

Rules:
- At least one field must be provided.
- `phone` can be `null`.
- `bio` can be `null`.

Allowed fields:

| Field | Type |
|---|---|
| `username` | string |
| `email` | string |
| `fullName` | string |
| `phone` | string or null |
| `specialization` | string |
| `bio` | string or null |
| `consultationFee` | number |
| `experienceYears` | number |
| `isActive` | boolean |

### 2.7 Delete Doctor

- Method: `DELETE`
- Endpoint: `/doctors/:id`
- Access: Protected, `admin` only
- Request body: None

Note:
- This is a soft delete. It sets `isActive` to `false`.

---

## 3. Schedule APIs

### 3.1 List Doctor Schedules

- Method: `GET`
- Endpoint: `/doctors/:id/schedules`
- Access: Public
- Request body: None

Path params:

| Param | Type | Notes |
|---|---|---|
| `id` | number | Doctor user id |

### 3.2 Get Schedule By ID

- Method: `GET`
- Endpoint: `/schedules/:id`
- Access: Public
- Request body: None

### 3.3 Create Schedule

- Method: `POST`
- Endpoint: `/schedules`
- Access: Protected, `doctor` only

Request body:

```json
{
  "date": "2026-03-10",
  "startTime": "09:00",
  "endTime": "12:00",
  "isAvailable": true
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `date` | string | Yes | Format `YYYY-MM-DD` |
| `dayOfWeek` | string | No | Optional, but if sent it must match the provided `date` |
| `startTime` | string | Yes | Format `HH:mm` |
| `endTime` | string | Yes | Format `HH:mm`, must be later than `startTime` |
| `isAvailable` | boolean | No | Defaults to `true` |

Rules:
- Only the authenticated doctor can create their own schedule.
- Overlapping schedules on the same date are rejected.
- The stored `dayOfWeek` is derived from the selected `date`.

### 3.4 Update Schedule

- Method: `PATCH`
- Endpoint: `/schedules/:id`
- Access: Protected, `doctor` only

Request body example:

```json
{
  "date": "2026-03-10",
  "startTime": "10:00",
  "endTime": "13:00",
  "isAvailable": true
}
```

Rules:
- At least one field must be provided.
- If both `startTime` and `endTime` are sent, `startTime` must be earlier.
- Overlapping schedules on the same day are rejected.

Allowed fields:

| Field | Type |
|---|---|
| `date` | string |
| `dayOfWeek` | string |
| `startTime` | string |
| `endTime` | string |
| `isAvailable` | boolean |

### 3.5 Delete Schedule

- Method: `DELETE`
- Endpoint: `/schedules/:id`
- Access: Protected, `doctor` only
- Request body: None

---

## 4. Appointment APIs

### 4.1 List Appointments

- Method: `GET`
- Endpoint: `/appointments`
- Access: Protected
- Request body: None

Behavior:
- `patient` gets own appointments
- `doctor` gets appointments assigned to them
- `admin` gets all appointments

Optional query params:

| Query Param | Type | Notes |
|---|---|---|
| `status` | string | One of `pending`, `accepted`, `cancelled`, `done` |

### 4.2 Get Appointment By ID

- Method: `GET`
- Endpoint: `/appointments/:id`
- Access: Protected
- Request body: None

Behavior:
- Accessible by appointment owner patient, assigned doctor, or admin.

### 4.3 Create Appointment

- Method: `POST`
- Endpoint: `/appointments`
- Access: Protected, `patient` only

Request body:

```json
{
  "doctorId": 10,
  "date": "2026-03-10",
  "startTime": "11:00",
  "endTime": "11:30",
  "notes": "Routine follow-up"
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `doctorId` | number | Yes | Must belong to an active doctor |
| `date` | string | Yes | Format `YYYY-MM-DD` |
| `startTime` | string | Yes | Format `HH:mm` |
| `endTime` | string | Yes | Format `HH:mm`, must be later than `startTime` |
| `notes` | string | No | Max 500 chars |

Rules:
- Only patients can create appointments.
- Appointment time must not overlap with another non-cancelled appointment for the same doctor.

### 4.4 Update Appointment

- Method: `PATCH`
- Endpoint: `/appointments/:id`
- Access: Protected

Request body example:

```json
{
  "date": "2026-03-11",
  "startTime": "12:00",
  "endTime": "12:30",
  "notes": "Updated notes",
  "status": "accepted"
}
```

Allowed fields:

| Field | Type | Notes |
|---|---|---|
| `date` | string | Format `YYYY-MM-DD` |
| `startTime` | string | Format `HH:mm` |
| `endTime` | string | Format `HH:mm` |
| `notes` | string or null | Max 500 chars |
| `status` | string | `pending`, `accepted`, `cancelled`, `done` |

Rules:
- At least one field must be provided.
- Patient, doctor, and admin can update if authorized.
- Patients cannot change appointment `status`.
- Updated time slot must remain available.
- When an appointment becomes `accepted`, the matching doctor schedule slot for that weekday and exact time range is marked as unavailable.

### 4.5 Delete Appointment

- Method: `DELETE`
- Endpoint: `/appointments/:id`
- Access: Protected
- Request body: None

Behavior:
- Allowed for the appointment owner patient, assigned doctor, or admin.

---

## 5. Admin APIs

### 5.1 List Admins

- Method: `GET`
- Endpoint: `/admins`
- Access: Protected, `admin` only
- Request body: None

Optional query params:

| Query Param | Type | Notes |
|---|---|---|
| `search` | string | Search by full name, username, or email |
| `isActive` | boolean string | Use `true` or `false` |

### 5.2 Get Admin By ID

- Method: `GET`
- Endpoint: `/admins/:id`
- Access: Protected, `admin` only
- Request body: None

### 5.3 Create Admin

- Method: `POST`
- Endpoint: `/admins`
- Access: Protected, `admin` only

Request body:

```json
{
  "username": "admin_new",
  "email": "admin@example.com",
  "password": "AdminPass123",
  "fullName": "Admin User",
  "phone": "+923001234567",
  "isActive": true
}
```

Required fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | Yes | 3 to 30 chars |
| `email` | string | Yes | Valid email |
| `password` | string | Yes | 8 to 72 chars |
| `fullName` | string | Yes | 2 to 120 chars |
| `phone` | string | No | 7 to 20 chars |
| `isActive` | boolean | No | Defaults to `true` |

### 5.4 Update Admin

- Method: `PATCH`
- Endpoint: `/admins/:id`
- Access: Protected, `admin` only

Request body example:

```json
{
  "fullName": "Updated Admin",
  "phone": "+923009998887",
  "isActive": true
}
```

Allowed fields:

| Field | Type |
|---|---|
| `username` | string |
| `email` | string |
| `password` | string |
| `fullName` | string |
| `phone` | string or null |
| `isActive` | boolean |

Rules:
- At least one field must be provided.
- An admin cannot deactivate their own account.

### 5.5 Delete Admin

- Method: `DELETE`
- Endpoint: `/admins/:id`
- Access: Protected, `admin` only
- Request body: None

Rules:
- An admin cannot delete their own account.
- This is a soft delete and sets `isActive` to `false`.

---

## Important Validation Rules

- Passwords for registration and password reset must contain uppercase, lowercase, and numeric characters.
- Time values use `HH:mm`.
- Appointment dates use `YYYY-MM-DD`.
- Schedule and appointment `startTime` must be earlier than `endTime`.
- Update APIs usually require at least one field in the request body.
- Unique fields such as `email` and `username` can trigger conflict errors.

## Common Status Codes

- `200` Success
- `201` Created
- `400` Validation or business rule error
- `401` Unauthorized
- `403` Forbidden
- `404` Not found
- `409` Conflict
- `500` Internal server error

## Quick Testing Flow

1. Register a `patient` or `doctor` using `/api/auth/register`.
2. Login using `/api/auth/login`.
3. Copy the returned JWT token.
4. Use `Authorization: Bearer <token>` for protected routes.
5. As a doctor, create schedules.
6. As a patient, create appointments with a doctor.
7. Use `/api-docs` for interactive testing.
