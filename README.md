# Vidya Vichar - Backend (MongoDB)

Simplified backend for the Vidya Vichar implementation using:
- Node.js (ES modules)
- Express
- MongoDB (Mongoose)
- JWT auth

## Quick start
1. Copy `.env.example` to `.env` and adjust settings.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (requires nodemon) or `npm start`
4. Use Postman to register users, create courses, and enroll students.

## Data Models

### User Model
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student","instructor","ta","admin"], default: "student" },
  createdAt: { type: Date, default: Date.now }
}
```

### Course Model
```javascript
{
  title: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
}
```

### Lecture Model
```javascript
{
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ["scheduled","ongoing","completed","cancelled"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now }
}
```

### Question Model
```javascript
{
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["open","answered","dismissed","important"], default: "open" }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get JWT token

### Courses
- `POST /api/courses` - Create a new course (no auth required)
- `GET /api/courses` - List all courses (no auth required)
- `POST /api/courses/enroll` - Enroll a user in a course (no auth required)

**Note:** Lecture and Question models are retained for data structure consistency but their corresponding API endpoints have been removed from this simplified version.
