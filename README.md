# 🏥 Healthcare Platform

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D%2016.0.0-green.svg" />
  <img src="https://img.shields.io/badge/mongodb-%3E%3D%205.0.0-brightgreen.svg" />
  <img src="https://img.shields.io/badge/made%20with-love-red.svg" />
  <br />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/mongodb-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" />
  <img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" />
</div>

<p align="center">
  <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3" alt="Healthcare Platform Banner" width="1200" height="400" />
</p>

## 📋 Overview

This is a comprehensive healthcare management platform that connects patients with doctors, streamlines appointment booking, and provides AI-powered symptom analysis. The application helps patients find qualified healthcare providers, book appointments, and receive personalized medical guidance. Healthcare professionals can manage their practice, while administrators oversee the entire system.

## ✨ Features

### 🏥 For Patients
- **Doctor Discovery**: Browse and search qualified healthcare providers by specialty and location
- **Smart Appointment Booking**: Schedule consultations with real-time availability checking
- **AI Symptom Analysis**: Get preliminary health insights using machine learning algorithms
- **Medical History Tracking**: Maintain comprehensive health records and appointment history
- **User Profiles**: Manage personal information and medical preferences
- **Responsive Design**: Fully responsive interface optimized for mobile and desktop
- **Secure Authentication**: Register and login with robust security measures
- **Real-time Updates**: Get instant notifications about appointment confirmations and changes

### 👨‍⚕️ For Healthcare Providers
- **Professional Profile Management**: Showcase qualifications, specialties, and experience
- **Appointment Management**: View, confirm, and manage patient appointments
- **Patient Information Access**: Secure access to patient medical histories and notes
- **Availability Management**: Set and update consultation schedules and time slots
- **Consultation Notes**: Document patient interactions and treatment recommendations
- **Dashboard Analytics**: Track patient volume, appointment trends, and practice metrics

### 👨‍💼 For Administrators
- **User Management**: Comprehensive control over patient, doctor, and admin accounts
- **Doctor Verification**: Review and approve healthcare provider credentials
- **System Analytics**: Monitor platform usage, appointment statistics, and user engagement
- **AI Interaction Logs**: Track and analyze AI symptom analysis usage patterns
- **Appointment Oversight**: System-wide appointment monitoring and management
- **Database Management**: Maintain data integrity and system performance

## 🛠️ Technologies

### Frontend
- **React 18**: Modern UI framework with hooks and functional components
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Framer Motion**: Smooth animations and transitions
- **React Router**: Client-side routing for single-page application navigation
- **Axios**: HTTP client for API communication
- **Responsive Design**: Mobile-first approach ensuring compatibility across all devices

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Minimal and flexible web application framework
- **MongoDB**: NoSQL database for scalable data storage
- **Mongoose**: Elegant MongoDB object modeling for Node.js
- **JWT Authentication**: Secure token-based authentication system
- **bcryptjs**: Password hashing for enhanced security
- **Joi**: Request validation and data sanitization

### AI/ML Integration
- **Python Flask**: Microservice for machine learning model serving
- **Scikit-learn**: Machine learning library for symptom analysis
- **Pandas**: Data manipulation and analysis
- **Custom ML Models**: Trained models for healthcare-specific predictions

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Git

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/healthcare-platform.git

# Navigate to the server directory
cd healthcare-platform/server

# Install backend dependencies
npm install

# Create .env file with required variables
# See .env.example for required variables
cp .env.example .env

# Seed admin user (optional)
node scripts/seedAdmin.js

# Start the backend server
npm run dev
```

### Frontend Setup
```bash
# Navigate to the frontend directory
cd ../frontend

# Install frontend dependencies
npm install

# Create .env file with required variables
# See .env.example for required variables
cp .env.example .env

# Start the development server
npm run dev
```

### AI/ML Service Setup
```bash
# Navigate to the ML directory
cd ../server/ml

# Install Python dependencies
pip install -r requirements.txt

# Train the model (optional - pre-trained model included)
python train_model.py

# Start the ML service
python simple_flask_service.py
```

Visit `http://localhost:5173` to see the application running!

## 📊 API Endpoints

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset user password

### Patient Management
- `GET /api/patient/dashboard` - Get patient dashboard data
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile
- `GET /api/patient/appointments` - Get patient appointments
- `GET /api/patient/history` - Get patient medical history
- `GET /api/patient/doctors` - Browse available doctors

### Doctor Management
- `GET /api/doctor/dashboard` - Get doctor dashboard data
- `GET /api/doctor/profile` - Get doctor profile
- `PUT /api/doctor/profile` - Update doctor profile
- `GET /api/doctor/appointments` - Get doctor appointments
- `PUT /api/doctor/availability` - Update doctor availability
- `GET /api/doctor/patients` - Get doctor's patients
- `GET /api/doctors/:id` - Get specific doctor details

### Appointment Management
- `POST /api/appointments/book` - Book a new appointment
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `PUT /api/appointments/:id/status` - Update appointment status
- `GET /api/appointments/doctor/:doctorId/availability` - Get doctor availability

### Admin Management
- `GET /api/admin/dashboard` - Get admin dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user details
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/doctors/pending` - Get pending doctor verifications
- `PUT /api/admin/doctors/:id/verify` - Verify doctor account
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/ai-logs` - Get AI interaction logs

### AI Services
- `POST /api/ai/analyze-symptoms` - Analyze patient symptoms
- `GET /api/ai/logs` - Get AI interaction history
- `POST /api/ai/feedback` - Submit AI feedback

## 🤖 AI-Powered Symptom Analysis

The platform features an intelligent symptom analysis system powered by machine learning:

- **Symptom Recognition**: Processes natural language symptom descriptions
- **Risk Assessment**: Provides preliminary health risk evaluations
- **Specialist Recommendations**: Suggests appropriate medical specialties
- **Medical History Integration**: Considers patient's previous conditions
- **Continuous Learning**: Model improves with more data and feedback
- **Privacy-First**: All health data is encrypted and securely processed

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for patients, doctors, and admins
- **Password Encryption**: bcrypt hashing for password security
- **Input Validation**: Comprehensive request validation using Joi
- **CORS Protection**: Cross-origin resource sharing security
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Encryption**: Sensitive medical data encryption

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop**: Full-featured experience with comprehensive dashboards
- **Tablet**: Touch-optimized interface with intuitive navigation
- **Mobile**: Streamlined mobile experience for on-the-go access
- **Accessibility**: WCAG compliant design for users with disabilities

## 🚀 Deployment

### Production Environment Variables
```bash
# Backend (.env)
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
ML_SERVICE_URL=http://localhost:5001

# Frontend (.env)
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=Healthcare Platform
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development**: React.js, Tailwind CSS, Responsive Design
- **Backend Development**: Node.js, Express.js, MongoDB
- **AI/ML Integration**: Python, Flask, Scikit-learn
- **DevOps**: Docker, CI/CD, Cloud Deployment

## 📞 Support

For support, email support@healthcareplatform.com or join our Slack channel.

## 🙏 Acknowledgments

- Thanks to all healthcare professionals who provided domain expertise
- Open source community for the amazing tools and libraries
- Beta testers who helped improve the platform

---

<div align="center">
  <p>Made with ❤️ for better healthcare accessibility</p>
  <p>© 2024 Healthcare Platform. All rights reserved.</p>
</div>
