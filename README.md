# 🎓 EduVillage — Online Learning Platform

<p align="center">
  <strong>A comprehensive online learning management system designed for seamless course delivery, student engagement, and educational excellence.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen" alt="Status"/>
  <img src="https://img.shields.io/badge/Phase-Complete-blue" alt="Phase"/>
  <img src="https://img.shields.io/badge/Version-1.0.0-green" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-orange" alt="License"/>
</p>

---

## 📋 Project Overview

**EduVillage** is a full-stack online learning platform built as part of the **CivoraX Internship Program (FSD114)** by **Civora Nexus Pvt. Ltd.**

The platform enables educators to create and manage courses, track student progress, deliver certificates, and maintain continuous engagement through intelligent notifications.

| Metric | Details |
|--------|---------|
| **Project ID** | FSD114 |
| **Program** | CivoraX Internship Program 2025-26 |
| **Status** | ✅ Complete & Production Ready |
| **Development Duration** | 5 Weeks (Jan 5 - Feb 8, 2026) |

---

## 🎯 Key Features

### 👥 **User Management & Authentication**
- ✅ Role-based user system (Admin, Teacher, Student)
- ✅ JWT-based authentication with 60-minute access tokens
- ✅ Admin user approval/rejection workflow
- ✅ User blocking/unblocking capabilities
- ✅ Secure password management

### 📚 **Course Management**
- ✅ Create, read, update, delete courses
- ✅ Multimedia course content (videos, PDFs, documents, links)
- ✅ Course enrollment system with confirmation workflow
- ✅ Student enrollment tracking
- ✅ Teacher course assignment

### 🎓 **Student Learning Experience**
- ✅ Interactive student course details page
  - Content tabs with completion tracking
  - Assignment submission interface
  - Real-time progress monitoring
  - Status indicators (Pending/Completed)
- ✅ Progress tracking with percentage calculation
- ✅ Assignment submission with file uploads
- ✅ Certificate generation on 100% completion

### 📜 **Certificate System** (Production Ready)
- ✅ Automatic certificate generation upon course completion
- ✅ PDF certificates with EduVillage branding
- ✅ Unique certificate IDs with issue dates
- ✅ Certificate download functionality
- ✅ Certificate gallery for students
- ✅ Protected certificate downloads (authentication required)

### 🔔 **Smart Notification System** (Production Ready)
- ✅ 6 notification types:
  - Admin notifications for teacher signups
  - Teacher notifications for student enrollments
  - Teacher notifications for approval/rejection actions
  - Student enrollment confirmations
  - New content notifications
  - Certificate ready notifications
- ✅ Real-time notification bell with unread badge
- ✅ Pagination & filtering (All/Unread/Read)
- ✅ Automatic notifications via signal handlers

### 📊 **Dashboard Views**
- ✅ **Student Dashboard**: Active courses, assignments, progress, certificates
- ✅ **Teacher Dashboard**: Enrolled students, course management, submission tracking
- ✅ **Admin Dashboard**: System statistics, user management, system overview

### ⚙️ **Admin Features**
- ✅ Comprehensive user management interface
- ✅ Dual-mode UI: Dashboard (read-only) + Management (full control)
- ✅ Teacher approval workflow
- ✅ User filtering by role
- ✅ User statistics cards

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| React Router | 7.12.0 | Client-side routing |
| Axios | 1.13.3 | HTTP client |
| React Toastify | 11.0.5 | Notifications |
| CSS3 | - | Responsive styling |

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| Django | Latest | Web framework |
| Django REST Framework | - | API development |
| SimpleJWT | - | JWT authentication |
| SQLite | - | Development database |
| PostgreSQL | - | Production database |

### **Database Models**
- Users (role-based hierarchy)
- Courses
- Enrollments
- Assessments & Assignments
- CourseContent (multimedia)
- AssignmentSubmissions
- Certificates
- Notifications

### **Infrastructure**
- **Version Control**: Git/GitHub
- **Package Management**: pip (Python), npm (Node.js)
- **File Storage**: Local file system (media/)
- **CORS**: Django CORS Headers for cross-origin requests

---

## 📁 Project Structure

```
EduVillage/
├── backend/
│   ├── apps/
│   │   ├── users/              # User management & authentication
│   │   ├── courses/            # Courses & content
│   │   ├── enrollments/        # Student enrollments
│   │   ├── assessments/        # Assignments & submissions
│   │   ├── dashboard/          # Dashboard endpoints
│   │   └── notifications/      # Notification system
│   ├── eduvillage_backend/     # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   └── media/                  # Uploaded files
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/          # Admin components
│   │   │   ├── student/        # Student pages
│   │   │   ├── teacher/        # Teacher pages
│   │   │   ├── auth/           # Authentication pages
│   │   │   └── Home.jsx
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API services
│   │   ├── styles/             # CSS styles
│   │   └── App.js
│   ├── package.json
│   └── public/
│
├── resources/
│   ├── branding/               # EduVillage brand assets
│   └── links.md
│
└── docs/                        # Documentation
    ├── api-notes.md
    ├── architecture.md
    └── getting-started.md
```

---

## 🚀 Quick Start

### **Prerequisites**
- Python 3.8+ and pip
- Node.js 14+ and npm
- Git

### **Backend Setup**

```bash
# Clone repository
git clone https://github.com/Gagan-S-18/edu-village.git
cd EduVillage/backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### **Frontend Setup**

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at `http://localhost:3000`

---

## 🔐 Security Features

- ✅ JWT token-based authentication (60-minute access tokens)
- ✅ Role-based access control (RBAC)
- ✅ User data isolation by role
- ✅ Protected API endpoints
- ✅ CORS configuration for security
- ✅ Secure password storage

---

## 📊 Development Phases

| Phase | Steps | Status | Focus |
|-------|-------|--------|-------|
| **Phase 1-3** | 1-9 | ✅ Complete | User auth, dashboards, certificates, notifications |
| **Step 1-2** | Foundation | ✅ | User authentication & admin dashboard |
| **Step 3** | Learning | ✅ | Student course details page |
| **Step 4** | Assessments | ✅ | Assignment submission system |
| **Step 5** | Tracking | ✅ | Student progress monitoring |
| **Step 6** | Teaching | ✅ | Teacher student progress view |
| **Step 8** | Certification | ✅ | PDF certificates & downloads |
| **Step 9** | Polish | ✅ | Loading states, empty states, responsive design |

---

## 📖 API Endpoints

### **Authentication**
- `POST /api/auth/login/` - User login
- `POST /api/auth/signup/` - User signup
- `POST /api/token/refresh/` - Refresh access token

### **Users**
- `GET /api/users/` - List users (admin only)
- `POST /api/users/` - Create user (admin only)
- `GET /api/users/{id}/` - User details
- `PATCH /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### **Courses**
- `GET /api/courses/` - List courses
- `POST /api/courses/` - Create course (teacher/admin)
- `GET /api/courses/{id}/` - Course details
- `PUT/PATCH /api/courses/{id}/` - Update course

### **Enrollments**
- `GET /api/enrollments/` - List enrollments
- `POST /api/enrollments/` - Enroll in course
- `GET /api/enrollments/{id}/` - Enrollment details

### **Notifications**
- `GET /api/notifications/` - List notifications
- `PATCH /api/notifications/{id}/` - Mark as read
- `GET /api/notifications/unread-count/` - Unread count
- `PATCH /api/notifications/mark-all-as-read/` - Mark all as read

### **Certificates**
- `GET /api/certificates/` - List certificates
- `GET /api/certificates/{id}/download/` - Download certificate PDF

---

## 🧪 Testing

Run backend tests:
```bash
python manage.py test
```

Run frontend tests:
```bash
npm test
```

---

## 📝 Documentation

Complete documentation available in:
- [Getting Started Guide](./docs/getting-started.md)
- [API Documentation](./docs/api-notes.md)
- [Architecture Design](./docs/architecture.md)
- [Database Schema](./docs/database-design.md)
- [Tech Stack Details](./docs/tech-stack.md)

---

## 🤝 Contributing

This project was developed as part of the CivoraX Internship Program. 

For contributions or questions:
- 📧 Email: [gagan2004gk@gmail.com](mailto:gagan2004gk@gmail.com)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🏢 About Civora Nexus

**Civora Nexus Pvt. Ltd.** is a technology company empowering communities through innovative civic and healthcare technology solutions.

- 🌐 [Official Website](https://civoranexus.com/)
- 📋 [Internship Program](https://civoranexus.com/internships)
- 📍 **Location**: Sangamner, Maharashtra, India
- 📧 **Contact**: contact@civoranexus.com

### Follow Us
[![LinkedIn](https://www.linkedin.com/in/gagan-s-dev/)]

---

<!-- <p align="center">
  <strong>© 2026 Civora Nexus Pvt. Ltd. All rights reserved.</strong>
</p> -->

<p align="center">
  Made with ❤️ by the Gagan S
</p>


