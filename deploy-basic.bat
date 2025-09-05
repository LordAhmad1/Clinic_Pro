@echo off
REM Basic Deployment Script for Medical Clinic System (Windows)
REM Simple and easy to understand

echo 🏥 Medical Clinic System - Basic Deployment
echo ==========================================

REM Step 1: Check if Node.js is installed
echo 📋 Step 1: Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org/
    echo    Download and install Node.js 18+ LTS version
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node --version
)

REM Step 2: Create application directory
echo 📋 Step 2: Setting up application directory...
set APP_DIR=%USERPROFILE%\medical-clinic
if not exist "%APP_DIR%" mkdir "%APP_DIR%"
cd /d "%APP_DIR%"

REM Step 3: Create basic backend
echo 📋 Step 3: Creating basic backend...
if not exist "backend" mkdir backend
cd backend

REM Create package.json
echo {> package.json
echo   "name": "medical-clinic-backend",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Basic Medical Clinic Backend",>> package.json
echo   "main": "server.js",>> package.json
echo   "scripts": {>> package.json
echo     "start": "node server.js",>> package.json
echo     "dev": "nodemon server.js">> package.json
echo   },>> package.json
echo   "dependencies": {>> package.json
echo     "express": "^4.18.2",>> package.json
echo     "cors": "^2.8.5",>> package.json
echo     "dotenv": "^16.3.1",>> package.json
echo     "bcryptjs": "^2.4.3",>> package.json
echo     "jsonwebtoken": "^9.0.2",>> package.json
echo     "helmet": "^7.0.0",>> package.json
echo     "express-rate-limit": "^6.10.0">> package.json
echo   },>> package.json
echo   "devDependencies": {>> package.json
echo     "nodemon": "^3.0.1">> package.json
echo   }>> package.json
echo }>> package.json

REM Create basic server
echo require('dotenv').config();> server.js
echo const express = require('express');>> server.js
echo const cors = require('cors');>> server.js
echo const helmet = require('helmet');>> server.js
echo const rateLimit = require('express-rate-limit');>> server.js
echo.>> server.js
echo const app = express();>> server.js
echo const PORT = process.env.PORT ^|^| 3000;>> server.js
echo.>> server.js
echo // Basic security>> server.js
echo app.use(helmet());>> server.js
echo app.use(cors({>> server.js
echo   origin: process.env.FRONTEND_URL ^|^| 'http://localhost:4200',>> server.js
echo   credentials: true>> server.js
echo }));>> server.js
echo.>> server.js
echo // Rate limiting>> server.js
echo const limiter = rateLimit({>> server.js
echo   windowMs: 15 * 60 * 1000, // 15 minutes>> server.js
echo   max: 100 // limit each IP to 100 requests per windowMs>> server.js
echo });>> server.js
echo app.use('/api/', limiter);>> server.js
echo.>> server.js
echo app.use(express.json());>> server.js
echo.>> server.js
echo // Health check>> server.js
echo app.get('/health', (req, res) =^> {>> server.js
echo   res.json({ status: 'OK', message: 'Medical Clinic API is running' });>> server.js
echo });>> server.js
echo.>> server.js
echo // Basic admin login>> server.js
echo app.post('/api/auth/login', (req, res) =^> {>> server.js
echo   const { email, password } = req.body;>> server.js
echo   if (email === 'admin@admin.com' ^&^& password === 'admin123') {>> server.js
echo     res.json({>> server.js
echo       success: true,>> server.js
echo       message: 'Login successful',>> server.js
echo       data: {>> server.js
echo         user: {>> server.js
echo           id: '1',>> server.js
echo           name: 'Admin User',>> server.js
echo           email: 'admin@admin.com',>> server.js
echo           role: 'admin'>> server.js
echo         },>> server.js
echo         token: 'basic-admin-token-' + Date.now()>> server.js
echo       }>> server.js
echo     });>> server.js
echo   } else {>> server.js
echo     res.status(401).json({>> server.js
echo       success: false,>> server.js
echo       message: 'Invalid credentials'>> server.js
echo     });>> server.js
echo   }>> server.js
echo });>> server.js
echo.>> server.js
echo // Basic API endpoints>> server.js
echo app.get('/api/patients', (req, res) =^> {>> server.js
echo   res.json({>> server.js
echo     success: true,>> server.js
echo     data: {>> server.js
echo       patients: []>> server.js
echo     }>> server.js
echo   });>> server.js
echo });>> server.js
echo.>> server.js
echo app.get('/api/appointments', (req, res) =^> {>> server.js
echo   res.json({>> server.js
echo     success: true,>> server.js
echo     data: {>> server.js
echo       appointments: []>> server.js
echo     }>> server.js
echo   });>> server.js
echo });>> server.js
echo.>> server.js
echo // Error handling>> server.js
echo app.use((req, res) =^> {>> server.js
echo   res.status(404).json({ message: 'Route not found' });>> server.js
echo });>> server.js
echo.>> server.js
echo app.listen(PORT, () =^> {>> server.js
echo   console.log(`🚀 Medical Clinic Backend running on port ${PORT}`);>> server.js
echo   console.log(`📊 Health check: http://localhost:${PORT}/health`);>> server.js
echo   console.log(`🔐 Admin login: admin@admin.com / admin123`);>> server.js
echo });>> server.js

REM Create .env file
echo NODE_ENV=production> .env
echo PORT=3000>> .env
echo FRONTEND_URL=http://localhost:4200>> .env
echo JWT_SECRET=basic-secret-key-change-in-production>> .env

REM Install dependencies
echo 📦 Installing backend dependencies...
npm install

REM Step 4: Create basic frontend
echo 📋 Step 4: Creating basic frontend...
cd ..
if not exist "frontend" mkdir frontend
cd frontend

REM Create package.json for frontend
echo {> package.json
echo   "name": "medical-clinic-frontend",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Basic Medical Clinic Frontend",>> package.json
echo   "scripts": {>> package.json
echo     "start": "npx http-server -p 4200 -c-1",>> package.json
echo     "build": "echo 'Basic frontend - no build needed'">> package.json
echo   },>> package.json
echo   "devDependencies": {>> package.json
echo     "http-server": "^14.1.1">> package.json
echo   }>> package.json
echo }>> package.json

REM Create basic HTML frontend
if not exist "public" mkdir public
cd public

REM Create index.html (simplified for Windows batch)
echo ^<!DOCTYPE html^>^<html lang="en"^>^<head^>^<meta charset="UTF-8"^>^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>^<title^>Medical Clinic Management System^</title^>^<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"^>^<style^>body { background-color: #f8f9fa; } .login-container { max-width: 400px; margin: 100px auto; } .dashboard { padding: 20px; } .card { margin-bottom: 20px; }^</style^>^</head^>^<body^>^<div id="app"^>^<div id="loginForm" class="login-container"^>^<div class="card"^>^<div class="card-header bg-primary text-white"^>^<h3 class="text-center mb-0"^>Medical Clinic Login^</h3^>^</div^>^<div class="card-body"^>^<form id="loginFormElement"^>^<div class="mb-3"^>^<label for="email" class="form-label"^>Email^</label^>^<input type="email" class="form-control" id="email" value="admin@admin.com" required^>^</div^>^<div class="mb-3"^>^<label for="password" class="form-label"^>Password^</label^>^<input type="password" class="form-control" id="password" value="admin123" required^>^</div^>^<button type="submit" class="btn btn-primary w-100"^>Login^</button^>^</form^>^</div^>^</div^>^</div^>^<div id="dashboard" class="dashboard" style="display: none;"^>^<div class="container"^>^<div class="row"^>^<div class="col-12"^>^<h1 class="text-center mb-4"^>Medical Clinic Dashboard^</h1^>^<div class="text-end mb-3"^>^<button class="btn btn-outline-danger" onclick="logout()"^>Logout^</button^>^</div^>^</div^>^</div^>^<div class="row"^>^<div class="col-md-6"^>^<div class="card"^>^<div class="card-header"^>^<h5^>Patients^</h5^>^</div^>^<div class="card-body"^>^<p^>Total Patients: ^<span id="patientCount"^>0^</span^>^</p^>^<button class="btn btn-primary" onclick="loadPatients()"^>Load Patients^</button^>^</div^>^</div^>^</div^>^<div class="col-md-6"^>^<div class="card"^>^<div class="card-header"^>^<h5^>Appointments^</h5^>^</div^>^<div class="card-body"^>^<p^>Total Appointments: ^<span id="appointmentCount"^>0^</span^>^</p^>^<button class="btn btn-primary" onclick="loadAppointments()"^>Load Appointments^</button^>^</div^>^</div^>^</div^>^</div^>^</div^>^</div^>^</div^>^<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"^>^</script^>^<script^>let token = localStorage.getItem('token'); if (token) { showDashboard(); } document.getElementById('loginFormElement').addEventListener('submit', async (e) =^> { e.preventDefault(); const email = document.getElementById('email').value; const password = document.getElementById('password').value; try { const response = await fetch('http://localhost:3000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await response.json(); if (data.success) { localStorage.setItem('token', data.data.token); showDashboard(); } else { alert('Login failed: ' + data.message); } } catch (error) { alert('Error: ' + error.message); } }); function showDashboard() { document.getElementById('loginForm').style.display = 'none'; document.getElementById('dashboard').style.display = 'block'; } function logout() { localStorage.removeItem('token'); location.reload(); } async function loadPatients() { try { const response = await fetch('http://localhost:3000/api/patients', { headers: { 'Authorization': 'Bearer ' + token } }); const data = await response.json(); document.getElementById('patientCount').textContent = data.data.patients.length; } catch (error) { console.error('Error loading patients:', error); } } async function loadAppointments() { try { const response = await fetch('http://localhost:3000/api/appointments', { headers: { 'Authorization': 'Bearer ' + token } }); const data = await response.json(); document.getElementById('appointmentCount').textContent = data.data.appointments.length; } catch (error) { console.error('Error loading appointments:', error); } }^</script^>^</body^>^</html^> > index.html

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..
npm install

REM Step 5: Create startup script
echo 📋 Step 5: Creating startup script...
cd ..
echo @echo off > start.bat
echo echo 🏥 Starting Medical Clinic System... >> start.bat
echo echo. >> start.bat
echo echo 🚀 Starting backend... >> start.bat
echo start "Backend" cmd /k "cd backend ^& npm start" >> start.bat
echo echo. >> start.bat
echo timeout /t 3 /nobreak ^>nul >> start.bat
echo echo 🌐 Starting frontend... >> start.bat
echo start "Frontend" cmd /k "cd frontend ^& npm start" >> start.bat
echo echo. >> start.bat
echo echo ✅ Medical Clinic System started! >> start.bat
echo echo 📊 Backend: http://localhost:3000 >> start.bat
echo echo 🌐 Frontend: http://localhost:4200 >> start.bat
echo echo 🔐 Login: admin@admin.com / admin123 >> start.bat
echo echo. >> start.bat
echo echo Press any key to close this window... >> start.bat
echo pause ^>nul >> start.bat

REM Step 6: Create stop script
echo @echo off > stop.bat
echo echo 🛑 Stopping Medical Clinic System... >> stop.bat
echo taskkill /f /im node.exe 2^>nul >> stop.bat
echo taskkill /f /im http-server.exe 2^>nul >> stop.bat
echo echo ✅ All services stopped >> stop.bat
echo pause >> stop.bat

echo.
echo 🎉 Basic Medical Clinic System deployed successfully!
echo ==================================================
echo.
echo 📁 Application location: %APP_DIR%
echo 🚀 To start the system: cd "%APP_DIR%" ^& start.bat
echo 🛑 To stop the system: cd "%APP_DIR%" ^& stop.bat
echo.
echo 📊 Backend will run on: http://localhost:3000
echo 🌐 Frontend will run on: http://localhost:4200
echo 🔐 Default login: admin@admin.com / admin123
echo.
echo 📋 Files created:
echo   - backend/server.js (Basic API server)
echo   - backend/package.json (Backend dependencies)
echo   - frontend/public/index.html (Simple web interface)
echo   - frontend/package.json (Frontend dependencies)
echo   - start.bat (Start all services)
echo   - stop.bat (Stop all services)
echo.
echo ✅ Ready to use!
pause
