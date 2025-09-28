# Vidya Vichar

A real-time interactive learning platform that enables students to ask questions during lectures and instructors to manage them efficiently. Built with React, Node.js, Express, MongoDB, and Socket.IO for seamless real-time communication.

## 🚀 Features

### Frontend Features
- **Real-time Question Management**: Students can submit questions that appear instantly for instructors
- **Interactive Whiteboard**: Visual question display with sticky note styling and color coding
- **Role-based UI**: Different interfaces for students, instructors, and TAs
- **Question Filtering**: Filter questions by status (All, Unanswered, Important)
- **Live Participant Count**: Real-time display of active lecture participants
- **Authentication System**: Secure login and role-based access control
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

### Backend Features
- **RESTful API**: Comprehensive endpoints for courses, lectures, and questions
- **Real-time Communication**: Socket.IO integration for instant updates
- **Database Management**: MongoDB with Mongoose for data modeling
- **Authentication & Authorization**: JWT-based authentication with role-based permissions
- **Lecture Management**: Time-based lecture scheduling and access control
- **Question Lifecycle**: Complete question management from submission to resolution

### Socket.IO Integration
- **Real-time Updates**: Instant question broadcasting to all participants
- **Room-based Communication**: Organized by lecture sessions
- **Event-driven Architecture**: Efficient handling of question actions:
  - `askQuestion`: New question submission
  - `toggleImportant`: Mark questions as important
  - `updateQuestionStatus`: Change question status
  - `questionDeleted`: Remove questions
  - `questionsCleared`: Clear all questions
- **Participant Tracking**: Live count of active users in each lecture

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1**: Modern React with hooks for state management
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **Socket.IO Client**: Real-time communication
- **React Icons**: Comprehensive icon library
- **Date-fns**: Modern date utility library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: Object Data Modeling (ODM) library
- **Socket.IO**: Real-time bidirectional event-based communication
- **JWT**: JSON Web Token authentication
- **bcrypt**: Password hashing
- **dotenv**: Environment variable management

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VidyaVichar_23
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/vidya
   PORT=3000
   JWT_SECRET=your-jwt-secret-key
   ```

5. **Start MongoDB**
   Ensure MongoDB is running on your system or update the `MONGO_URI` with your cloud MongoDB connection string.

6. **Run the Application**

   **Start Backend Server:**
   ```bash
   npm run dev
   ```
   This will start the backend server on port 3000 (or your specified PORT).

   **Start Frontend Development Server:**
   In a separate terminal:
   ```bash
   cd frontend
   npm run dev
   ```
   This will start the frontend development server, typically on port 5173.

## 🏗️ Project Structure

```
VidyaVichar_23/
├── src/                    # Backend source code
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── lectureController.js
│   │   └── questionController.js
│   ├── models/            # MongoDB data models
│   │   ├── Course.js
│   │   ├── Lecture.js
│   │   ├── Question.js
│   │   └── User.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── lectures.js
│   │   └── questions.js
│   ├── utils/             # Utility functions
│   │   └── auth.js
│   ├── server.js          # Main server entry point
│   └── socket.js          # Socket.IO event handlers
├── frontend/              # React frontend
│   ├── src/
│   │   ├── api/           # API service functions
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── index.jsx      # React entry point
│   ├── index.html         # HTML template
│   └── package.json
├── package.json           # Backend dependencies
└── README.md             # This file
```

## 🎯 Key Components

### Backend Models
- **User**: Authentication and role management (student, instructor, ta)
- **Course**: Course creation and student enrollment
- **Lecture**: Lecture scheduling and time management
- **Question**: Question content, status, and importance tracking

### Frontend Components
- **LecturePage**: Main lecture interface with real-time updates
- **Whiteboard**: Visual question display with sticky note styling
- **TeacherControls**: Instructor interface for question management
- **StudentControls**: Student interface with filtering options
- **AuthContext**: Authentication state management
- **SocketContext**: Socket.IO connection management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Courses
- `GET /api/courses` - Get user's courses
- `POST /api/courses` - Create new course
- `POST /api/courses/:id/enroll` - Enroll in course

### Lectures
- `GET /api/lectures/course/:id` - Get course lectures
- `POST /api/lectures` - Create new lecture
- `GET /api/lectures/:id` - Get lecture details

### Questions
- `GET /api/questions/lecture/:id` - Get lecture questions
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

## 🌐 Socket Events

### Client to Server
- `joinLecture` - Join a lecture room
- `askQuestion` - Submit a new question
- `toggleImportant` - Mark question as important
- `updateQuestionStatus` - Change question status

### Server to Client
- `lectureData` - Initial lecture data and questions
- `newQuestion` - New question received
- `questionUpdated` - Question status updated
- `questionsCleared` - All questions cleared
- `participantCount` - Updated participant count

## 🎨 UI Features

### Question Display
- **Sticky Note Styling**: Questions appear as colored sticky notes
- **Color Coding**: Important questions have red background, others have random pastel colors
- **Visual Hierarchy**: Enhanced box-shadow for 3D effect
- **Responsive Layout**: Adapts to different screen sizes

### Filtering System
- **All Questions**: Shows all questions in the lecture
- **Unanswered**: Shows only open/unanswered questions
- **Important**: Shows only marked important questions
- **Real-time Updates**: Filters update instantly as questions change

## 🚀 Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create/Join Course**: Instructors can create courses, students can enroll
3. **Schedule Lecture**: Instructors create lectures with start/end times
4. **Join Lecture**: Students join active lectures during scheduled times
5. **Ask Questions**: Students submit questions in real-time
6. **Manage Questions**: Instructors can mark questions as important, answered, or delete them

### Testing
- Frontend: `cd frontend && npm run dev` for development server
- Backend: `npm run dev` for backend with hot reload
- API: Use tools like Postman for API endpoint testing

