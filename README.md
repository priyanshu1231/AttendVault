# 📘 Attendance Management System

A complete web-based attendance tracking solution using **React.js** (frontend), **Node.js + Express** (backend), and **MongoDB**. Includes role-based authentication, live photo + location capture for students, and real-time attendance management for admins.

---

## 📁 Project Structure

```
attendencemanagement/
├── frontend/                 # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── ...
│
├── backend/                  # Node.js + Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── .env
│
└── README.md
```

---

## ✅ Features

### 🔐 Authentication
- JWT-based login & registration
- Gmail-based login UI (email+password)
- Role-based access (Admin / Student)
- Private route protection

### 🎓 Student Features
- Capture and submit **live photo** and **GPS location**
- View personal attendance history
- Submit leave requests
- Real-time attendance status

### 👨‍🏫 Admin Features
- View all student submissions
- Verify and mark students **Present/Absent**
- Generate attendance reports
- Manage student records
- Approve/reject leave requests

### 📂 Technologies
- **Frontend:** React.js, CSS, JSX, HTML5
- **Backend:** Node.js, Express.js, MongoDB
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Uploads:** `multer` for image upload
- **Location:** HTML5 Geolocation API
- **Database:** MongoDB with Mongoose

---

## 🔧 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/attendencemanagement.git
cd attendencemanagement
```

### 2. Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Configuration
Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_management
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
UPLOAD_PATH=uploads/
```

#### Frontend Configuration
Update `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Geocoding API**
4. Create credentials (API Key)
5. Add the API key to `frontend/.env`

### 4. Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGO_URI` in `.env` file
- Database will be created automatically on first run

---

## 🚀 Run the Application

### Start Backend
```bash
cd backend
npm run dev
# or
npm start
```
**Expected output:**
```
MongoDB connected
Server running on port 5000
```

### Start Frontend
```bash
cd frontend
npm start
```
**Expected output:**
```
Local:            http://localhost:3001
```

---

## 🎯 Usage Guide

### 📝 Demo Accounts
Use these credentials to test the system:

**Admin Account:**
- Email: `admin@gmail.com`
- Password: `admin123`

**Student Account:**
- Email: `student@gmail.com`
- Password: `student123`

### 📸 Student Attendance Flow
1. Student logs in
2. Captures live photo & location
3. Submits attendance
4. Admin verifies and marks status

### 📊 Admin Dashboard
- View all student records
- Filter by date, student name
- Mark attendance: ✅ Present / ❌ Absent
- Generate reports

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/all` - Get all attendance records
- `PUT /api/attendance/verify/:id` - Verify attendance

---

## 🖼️ File Storage
Uploaded images are stored in:
```
/backend/uploads/
```

## 📌 TODO (Optional Enhancements)
- [ ] Email notifications
- [ ] Attendance report download (PDF/Excel)
- [ ] Google Maps location preview
- [ ] Dark mode UI
- [ ] Mobile app version
- [ ] Bulk attendance operations

---

## 🚀 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `build/` folder
3. Update API URLs

---

## 📮 Contact
Made with ❤️ by [Your Name]

**Attendance has never been this smart and secure.**
