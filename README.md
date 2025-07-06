# Healthcare Platform - Full Stack Application

A comprehensive healthcare management system built with React frontend and Node.js backend, featuring patient-doctor appointment booking, AI-powered symptom analysis, and administrative management tools.

## 🏥 Project Overview

This healthcare platform provides a complete solution for managing patient-doctor interactions, appointment scheduling, and healthcare administration. The system supports three user roles: patients, doctors, and administrators, each with specific functionalities and access levels.

## 🏗️ Architecture

- **Frontend**: React.js with Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js with Express.js, MongoDB
- **Authentication**: JWT-based authentication with role-based access control
- **AI Integration**: Python Flask service for symptom analysis
- **Database**: MongoDB with Mongoose ODM

## 📁 Project Structure

```
project 1/
├── frontend/                 # React frontend application
├── server/                   # Node.js backend application
├── README.md                 # This file
├── ADMIN_ACCESS_GUIDE.md     # Admin setup instructions

```

## 🚀 Frontend Structure (`frontend/`)

### Core Files
- **`index.html`** - Main HTML entry point
- **`main.jsx`** - React application entry point
- **`App.jsx`** - Main application component with routing
- **`App.css`** - Global application styles
- **`index.css`** - Base Tailwind CSS styles

### Configuration Files
- **`package.json`** - Frontend dependencies and scripts
- **`vite.config.js`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`postcss.config.js`** - PostCSS configuration
- **`eslint.config.js`** - ESLint configuration

### Components (`src/components/`)
- **`Navbar.jsx`** - Navigation bar with role-based menu items
- **`Footer.jsx`** - Application footer
- **`LoadingSpinner.jsx`** - Loading animation component

### Context (`src/context/`)
- **`AuthContext.jsx`** - Authentication context provider managing user state, login/logout, and role-based access

### Services (`src/services/`)
- **`api.js`** - Base API configuration and HTTP client setup
- **`authService.js`** - Authentication-related API calls (login, register, password reset)
- **`patientService.js`** - Patient-specific API calls (appointments, profile, doctor browsing)
- **`doctorService.js`** - Doctor-specific API calls (appointments, availability, profile)
- **`adminService.js`** - Admin-specific API calls (user management, analytics, system stats)
- **`appointmentService.js`** - Appointment-related API calls (booking, management)
- **`aiService.js`** - AI symptom analysis API calls
- **`index.js`** - Service exports

### Pages (`src/pages/`)

#### Public Pages
- **`Home.jsx`** - Landing page with platform overview
- **`Login.jsx`** - User authentication page
- **`Register.jsx`** - User registration page

#### Patient Pages (`src/pages/patient/`)
- **`PatientDashboard.jsx`** - Patient's main dashboard with appointments and quick actions
- **`PatientProfile.jsx`** - Patient profile management
- **`BookAppointment.jsx`** - Appointment booking interface with doctor selection
- **`DoctorBrowse.jsx`** - Browse and search available doctors
- **`PatientHistory.jsx`** - Patient's appointment and medical history
- **`SymptomInput.jsx`** - AI-powered symptom analysis interface

#### Doctor Pages (`src/pages/doctor/`)
- **`DoctorDashboard.jsx`** - Doctor's main dashboard with patient overview
- **`DoctorProfile.jsx`** - Doctor profile and professional information management
- **`DoctorAppointments.jsx`** - Appointment management and scheduling
- **`DoctorAvailability.jsx`** - Availability and schedule management
- **`PatientDetails.jsx`** - Individual patient information and history

#### Admin Pages (`src/pages/admin/`)
- **`AdminDashboard.jsx`** - Administrative dashboard with system statistics
- **`ManageUsers.jsx`** - User management (patients, doctors, admins)
- **`ManageDoctors.jsx`** - Doctor-specific management and verification
- **`MonitorAppointments.jsx`** - System-wide appointment monitoring
- **`AILogs.jsx`** - AI interaction logs and analytics

## 🔧 Backend Structure (`server/`)

### Core Files
- **`server.js`** - Main server entry point with Express setup and route registration
- **`package.json`** - Backend dependencies and scripts

### Models (`models/`)
- **`User.js`** - User model with authentication, roles (patient/doctor/admin), and profile data
- **`Doctor.js`** - Doctor-specific model with specialties, education, availability, and professional details
- **`Appointment.js`** - Appointment model with scheduling, status tracking, and patient-doctor relationships
- **`AILog.js`** - AI interaction logging model for analytics and monitoring

### Controllers (`controllers/`)
- **`authController.js`** - Authentication logic (login, register, password management)
- **`patientController.js`** - Patient-specific operations (profile, appointments, history)
- **`doctorController.js`** - Doctor-specific operations (profile, appointments, availability)
- **`adminController.js`** - Administrative operations (user management, analytics)
- **`appointmentController.js`** - Appointment management (booking, status updates, scheduling)
- **`aiController.js`** - AI service integration and symptom analysis

### Routes (`routes/`)
- **`auth.js`** - Authentication routes (login, register, password reset)
- **`patient.js`** - Patient-specific API endpoints
- **`doctor.js`** - Doctor-specific API endpoints (protected)
- **`admin.js`** - Admin-specific API endpoints (protected)
- **`appointments.js`** - Appointment management endpoints
- **`ai.js`** - AI service endpoints

### Middleware (`middleware/`)
- **`auth.js`** - JWT authentication and role verification middleware
- **`validation.js`** - Request validation middleware using Joi
- **`errorHandler.js`** - Global error handling middleware
- **`notFound.js`** - 404 error handling middleware

### Services (`services/`)
- **`mlAiService.js`** - Machine learning AI service integration

### Utils (`utils/`)
- **`appError.js`** - Custom error class for application errors
- **`catchAsync.js`** - Async error handling utility
- **`logger.js`** - Application logging utility

### ML/AI Integration (`ml/`)
- **`prediction_service.py`** - Main AI prediction service
- **`simple_flask_service.py`** - Flask-based AI service
- **`simple_prediction_service.py`** - Simplified prediction service
- **`train_model.py`** - Model training script
- **`requirements.txt`** - Python dependencies for AI services
- **`data/medical_symptoms_dataset.csv`** - Training dataset for symptom analysis

### Scripts (`scripts/`)
- **`seedAdmin.js`** - Admin user creation script
- **`seedDatabase.js`** - Database seeding script
- **`seedSampleData.js`** - Sample data population script

### Documentation
- **`ADMIN_SETUP.md`** - Admin setup and configuration guide

## 🎯 Key Features

### Patient Features
- User registration and authentication
- Doctor browsing and search
- Appointment booking and management
- AI-powered symptom analysis
- Medical history tracking
- Profile management

### Doctor Features
- Professional profile management
- Appointment scheduling and management
- Patient information access
- Availability and schedule management
- Consultation notes and patient records

### Admin Features
- User management (patients, doctors, admins)
- System analytics and monitoring
- AI interaction logs
- Appointment oversight
- Doctor verification and approval

### AI Integration
- Symptom analysis using machine learning
- Medical condition prediction
- Confidence scoring
- Interaction logging for analytics

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Request validation

### AI/ML
- **Python** - AI service runtime
- **Flask** - Python web framework
- **scikit-learn** - Machine learning library
- **pandas** - Data manipulation
- **numpy** - Numerical computing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-1
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Configure your .env file with MongoDB URI, JWT secret, etc.
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **AI Service Setup**
   ```bash
   cd server/ml
   pip install -r requirements.txt
   ```

5. **Database Setup**
   ```bash
   cd server
   npm run seed:admin    # Create admin user
   npm run seed:data     # Populate sample data
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd server
   npm start
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```


### Environment Variables

Create a `.env` file in the `server/` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare-app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

```

## 👥 User Roles and Access

### Patient
- Register and login
- Browse available doctors
- Book appointments
- View medical history
- Use AI symptom analysis
- Manage profile

### Doctor
- Professional profile management
- Set availability and schedule
- Manage appointments
- View patient information
- Add consultation notes
- Update appointment status

### Admin
- User management (CRUD operations)
- Doctor verification and approval
- System analytics and monitoring
- AI interaction logs
- Appointment oversight
- Database management

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Request validation and sanitization
- Protected API endpoints
- CORS configuration
- Error handling and logging

## 📊 Database Schema

### User Collection
- Basic user information (name, email, password)
- Role-based access (patient/doctor/admin)
- Profile data (phone, address, date of birth)
- Authentication tokens and verification

### Doctor Collection
- Professional information (specialties, education)
- License and certification details
- Availability and scheduling
- Rating and review system
- Verification status

### Appointment Collection
- Patient-doctor relationships
- Scheduling and time slots
- Status tracking (scheduled, completed, cancelled)
- Consultation notes and medical records

### AI Log Collection
- Symptom analysis interactions
- Prediction results and confidence scores
- User interaction tracking
- Analytics and reporting data

## 🧪 Testing

The application includes comprehensive testing for:
- API endpoints and controllers
- Authentication and authorization
- Data validation and error handling
- Frontend components and user interactions

## 📈 Performance Optimization

- Database indexing for faster queries
- Caching strategies for frequently accessed data
- Optimized API responses
- Frontend code splitting and lazy loading
- Image optimization and compression

## 🔧 Development Tools

- ESLint for code linting
- Prettier for code formatting
- Hot reload for development
- Debug logging and error tracking
- API documentation and testing

## 📝 API Documentation

The backend provides RESTful API endpoints for:
- Authentication and user management
- Appointment booking and management
- Doctor and patient operations
- Administrative functions
- AI service integration

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd server
npm run build
```

### Environment Setup
- Configure production environment variables
- Set up MongoDB Atlas or production database
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Configure PM2 for process management

 