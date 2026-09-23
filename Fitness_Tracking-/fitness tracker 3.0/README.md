# FitTrack – AI Fitness Tracker 🏋️‍♂️📊

> **Student Project Version**: A clean, beginner-friendly full-stack web application for fitness tracking, nutrition, hydration logging, weight monitoring, and BMI calculation.

---

## 🌟 Project Overview

**FitTrack** is designed to demonstrate a working full-stack MERN architecture (MongoDB, Express.js, React.js, Node.js) with JWT authentication and real-time health analytics using Recharts.

---

## 🔥 Features Implemented

1. **User Registration & Login**: Secure authentication powered by JWT and password hashing using `bcryptjs`.
2. **User Profile & Setup**: Guided initial setup for age, gender, height, current weight, target weight, and health goals.
3. **Dashboard**: Daily health summary cards (Current Weight, BMI, Water Intake, Today's Calories, Weight Change), quick action buttons, water intake progress indicator, and weight trends.
4. **Meal Tracker**: Categorized meal logging (Breakfast, Lunch, Dinner, Snack) with food items, quantity, calories, and total energy calculations.
5. **Water Intake Tracker**: 2.5L daily goal tracking, quick hydration buttons (+250ml, +500ml, +750ml, +1L), percentage completion indicator, and timestamped log history.
6. **Weight Tracker**: Weight history logger, target weight progress bar, starting weight comparison, and interactive Recharts line chart.
7. **BMI Calculator**: Automatic BMI score calculation using formula `BMI = weight(kg) / height(m)²`, category classification (Underweight, Normal, Overweight, Obese), reference table, and history log.
8. **Progress Monitoring**: Analytical dashboard featuring 7-day and 4-week history filters with line and bar graphs.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Token (JWT) & bcryptjs
- **Environment**: dotenv & cors

---

## 📁 Folder Structure

```
fitness tracker 1.0/
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components (Sidebar, Navbar, Modal, StatCard)
│   │   ├── pages/            # Application pages (Login, Register, Dashboard, Meals, etc.)
│   │   ├── layouts/          # Main application layout wrapper
│   │   ├── services/         # Axios API client with JWT interceptor
│   │   ├── context/          # React AuthContext for user state
│   │   ├── App.jsx           # Main routing & AuthGuard setup
│   │   ├── main.jsx          # React DOM render entry
│   │   └── index.css         # Tailwind directives & CSS styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/
│   ├── config/               # Database connection (db.js)
│   ├── middleware/           # Auth JWT verification middleware
│   ├── models/               # Mongoose schemas (User, Profile, Meal, WaterIntake, WeightRecord, HealthMetric)
│   ├── controllers/          # Business logic handlers
│   ├── routes/               # Express REST API routes
│   ├── seed.js               # Database seeder script for demo account
│   ├── server.js             # Express app entry point
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB installed locally OR a MongoDB Atlas cluster URI

---

### Step 1: Backend Setup (`/server`)

1. Open terminal inside the `server/` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/fittrack
   JWT_SECRET=fittrack_secret_key_student_project_2026
   ```

4. Populate Database with Demo Data (Optional but recommended):
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### Step 2: Frontend Setup (`/client`)

1. Open a new terminal window inside the `client/` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Ensure `client/.env` points to the backend URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend Vite dev server:
   ```bash
   npm run dev
   ```
   *The client application will open at `http://localhost:3000`.*

---

## 🔑 Demo User Credentials

The application includes a pre-seeded demo user account so you can test all features out-of-the-box immediately after running `npm run seed`:

- **Email**: `demo@fittrack.com`
- **Password**: `Demo123`

---

## 🌐 API Overview

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | No |
| `GET` | `/api/auth/me` | Fetch logged-in user details | Yes |
| `GET` | `/api/profile` | Get user health profile | Yes |
| `PUT` | `/api/profile` | Update profile metrics & goals | Yes |
| `GET` | `/api/meals` | List meals (optional `?date=YYYY-MM-DD`) | Yes |
| `POST` | `/api/meals` | Create meal entry | Yes |
| `PUT` | `/api/meals/:id` | Update meal entry | Yes |
| `DELETE`| `/api/meals/:id` | Delete meal entry | Yes |
| `GET` | `/api/water` | Fetch water intake logs & goal status | Yes |
| `POST` | `/api/water` | Log hydration entry | Yes |
| `DELETE`| `/api/water/:id` | Remove water log | Yes |
| `GET` | `/api/weight` | Fetch weight history & summary | Yes |
| `POST` | `/api/weight` | Log new weight record | Yes |
| `DELETE`| `/api/weight/:id` | Delete weight record | Yes |
| `POST` | `/api/bmi/calculate`| Calculate BMI & record health metric | Yes |
| `GET` | `/api/bmi/history` | Get historical BMI logs | Yes |
| `GET` | `/api/dashboard` | Aggregated dashboard summary | Yes |
| `GET` | `/api/progress` | Filtered progress monitoring trends | Yes |


// cd server
// npm run dev
// cd client
// npm run dev

