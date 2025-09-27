# Postman Sample Data for Vidya Vichar API

This document contains sample data for testing the simplified Vidya Vichar API endpoints using Postman.

## Base URL
```
http://localhost:3000/api
```

## 1. User Authentication

### Register User
**Endpoint:** `POST /auth/register`

**Sample Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "student"
}
```

**Sample Responses for Different Roles:**

**Student:**
```json
{
  "name": "Alice Johnson",
  "email": "alice.student@example.com",
  "password": "student123",
  "role": "student"
}
```

**Instructor:**
```json
{
  "name": "Dr. Sarah Smith",
  "email": "sarah.instructor@example.com",
  "password": "instructor123",
  "role": "instructor"
}
```

**Teaching Assistant:**
```json
{
  "name": "Mike Wilson",
  "email": "mike.ta@example.com",
  "password": "ta123",
  "role": "ta"
}
```

**Admin:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### Login User
**Endpoint:** `POST /auth/login`

**Sample Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Sample Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f7a8b9c0d1e2f3a4b5c6d7",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student"
  }
}
```

## 2. Courses Management

### Create Course
**Endpoint:** `POST /courses`
**Headers:** No authentication required

**Sample Request Body:**
```json
{
  "title": "Introduction to Web Development",
  "instructorId": "64f7a8b9c0d1e2f3a4b5c6d7"
}
```

**Sample Response:**
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6d8",
  "title": "Introduction to Web Development",
  "instructorId": "64f7a8b9c0d1e2f3a4b5c6d7",
  "students": [],
  "createdAt": "2023-09-05T10:30:00.000Z"
}
```

**Note:** The `instructorId` should be the MongoDB ObjectId of an existing user who will be the instructor of the course.

### List All Courses
**Endpoint:** `GET /courses`
**Headers:** No authentication required

**Sample Response:**
```json
[
  {
    "_id": "64f7a8b9c0d1e2f3a4b5c6d8",
    "title": "Introduction to Web Development",
    "instructorId": "64f7a8b9c0d1e2f3a4b5c6d7",
    "students": [],
    "createdAt": "2023-09-05T10:30:00.000Z"
  },
  {
    "_id": "64f7a8b9c0d1e2f3a4b5c6d9",
    "title": "Advanced JavaScript",
    "instructorId": "64f7a8b9c0d1e2f3a4b5c6d7",
    "students": [
      "64f7a8b9c0d1e2f3a4b5c6da",
      "64f7a8b9c0d1e2f3a4b5c6db"
    ],
    "createdAt": "2023-09-05T10:35:00.000Z"
  }
]
```

### Enroll User in Course
**Endpoint:** `POST /courses/enroll`
**Headers:** No authentication required

**Sample Request Body:**
```json
{
  "userId": "64f7a8b9c0d1e2f3a4b5c6d7",
  "courseId": "64f7a8b9c0d1e2f3a4b5c6d8"
}
```

**Sample Response:**
```json
{
  "message": "User enrolled successfully",
  "courseId": "64f7a8b9c0d1e2f3a4b5c6d8",
  "userId": "64f7a8b9c0d1e2f3a4b5c6d7",
  "totalStudents": 1
}
```

**Note:** The `userId` should be the MongoDB ObjectId of an existing user. The system will automatically add the user to the course's students array.

## 3. Testing Workflow

### Step 1: Create Users
1. Register an instructor user
2. Register a student user
3. Register a TA user

### Step 5: List Courses
1. No authentication required - anyone can list all courses
2. Verify course details, instructor information, and enrolled students

## 4. Postman Collection Setup

### Environment Variables
Create environment variables in Postman:
- `BASE_URL`: `http://localhost:3000/api`
- `INSTRUCTOR_TOKEN`: (will be set after login)
- `STUDENT_TOKEN`: (will be set after login)
- `TA_TOKEN`: (will be set after login)
- `ADMIN_TOKEN`: (will be set after login)

### Request Examples

**Register Request:**
- Method: POST
- URL: `{{BASE_URL}}/auth/register`
- Body: raw JSON
- Headers: Content-Type: application/json

**Login Request:**
- Method: POST
- URL: `{{BASE_URL}}/auth/login`
- Body: raw JSON
- Headers: Content-Type: application/json
- Tests: Set token variable based on user role

**Create Course Request:**
- Method: POST
- URL: `{{BASE_URL}}/courses`
- Body: raw JSON (include instructorId)
- Headers: 
  - Content-Type: application/json

**List Courses Request:**
- Method: GET
- URL: `{{BASE_URL}}/courses`
- Headers: No authentication required

**Enroll User Request:**
- Method: POST
- URL: `{{BASE_URL}}/courses/enroll`
- Body: raw JSON (include both userId and courseId)
- Headers: 
  - Content-Type: application/json
