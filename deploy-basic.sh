#!/bin/bash
# Basic Deployment Script for Medical Clinic System
# Simple and easy to understand

echo "🏥 Medical Clinic System - Basic Deployment"
echo "=========================================="

# Step 1: Check if Node.js is installed
echo "📋 Step 1: Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is installed: $(node --version)"
fi

# Step 2: Check if MongoDB is installed
echo "📋 Step 2: Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB not found. Installing..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo "✅ MongoDB installed and started"
else
    echo "✅ MongoDB is installed"
    sudo systemctl start mongod
fi

# Step 3: Create application directory
echo "📋 Step 3: Setting up application directory..."
APP_DIR="/home/$USER/medical-clinic"
mkdir -p $APP_DIR
cd $APP_DIR

# Step 4: Create basic backend
echo "📋 Step 4: Creating basic backend..."
mkdir -p backend
cd backend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "medical-clinic-backend",
  "version": "1.0.0",
  "description": "Basic Medical Clinic Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Create basic server
cat > server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medical Clinic API is running' });
});

// Basic admin login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@admin.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@admin.com',
          role: 'admin'
        },
        token: 'basic-admin-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Basic API endpoints
app.get('/api/patients', (req, res) => {
  res.json({
    success: true,
    data: {
      patients: []
    }
  });
});

app.get('/api/appointments', (req, res) => {
  res.json({
    success: true,
    data: {
      appointments: []
    }
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Medical Clinic Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Admin login: admin@admin.com / admin123`);
});
EOF

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:4200
JWT_SECRET=basic-secret-key-change-in-production
EOF

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Step 5: Create basic frontend
echo "📋 Step 5: Creating basic frontend..."
cd ..
mkdir -p frontend
cd frontend

# Create package.json for frontend
cat > package.json << 'EOF'
{
  "name": "medical-clinic-frontend",
  "version": "1.0.0",
  "description": "Basic Medical Clinic Frontend",
  "scripts": {
    "start": "npx http-server -p 4200 -c-1",
    "build": "echo 'Basic frontend - no build needed'"
  },
  "devDependencies": {
    "http-server": "^14.1.1"
  }
}
EOF

# Create basic HTML frontend
mkdir -p public
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Clinic Management System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f8f9fa; }
        .login-container { max-width: 400px; margin: 100px auto; }
        .dashboard { padding: 20px; }
        .card { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div id="app">
        <!-- Login Form -->
        <div id="loginForm" class="login-container">
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h3 class="text-center mb-0">Medical Clinic Login</h3>
                </div>
                <div class="card-body">
                    <form id="loginFormElement">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" value="admin@admin.com" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" value="admin123" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Login</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Dashboard -->
        <div id="dashboard" class="dashboard" style="display: none;">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <h1 class="text-center mb-4">Medical Clinic Dashboard</h1>
                        <div class="text-end mb-3">
                            <button class="btn btn-outline-danger" onclick="logout()">Logout</button>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Patients</h5>
                            </div>
                            <div class="card-body">
                                <p>Total Patients: <span id="patientCount">0</span></p>
                                <button class="btn btn-primary" onclick="loadPatients()">Load Patients</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Appointments</h5>
                            </div>
                            <div class="card-body">
                                <p>Total Appointments: <span id="appointmentCount">0</span></p>
                                <button class="btn btn-primary" onclick="loadAppointments()">Load Appointments</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        let token = localStorage.getItem('token');
        
        // Check if already logged in
        if (token) {
            showDashboard();
        }

        // Login form handler
        document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('token', data.data.token);
                    showDashboard();
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });

        function showDashboard() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        }

        function logout() {
            localStorage.removeItem('token');
            location.reload();
        }

        async function loadPatients() {
            try {
                const response = await fetch('http://localhost:3000/api/patients', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                const data = await response.json();
                document.getElementById('patientCount').textContent = data.data.patients.length;
            } catch (error) {
                console.error('Error loading patients:', error);
            }
        }

        async function loadAppointments() {
            try {
                const response = await fetch('http://localhost:3000/api/appointments', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                const data = await response.json();
                document.getElementById('appointmentCount').textContent = data.data.appointments.length;
            } catch (error) {
                console.error('Error loading appointments:', error);
            }
        }
    </script>
</body>
</html>
EOF

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Step 6: Create startup script
echo "📋 Step 6: Creating startup script..."
cd ..
cat > start.sh << 'EOF'
#!/bin/bash
echo "🏥 Starting Medical Clinic System..."

# Start backend
echo "🚀 Starting backend..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Medical Clinic System started!"
echo "📊 Backend: http://localhost:3000"
echo "🌐 Frontend: http://localhost:4200"
echo "🔐 Login: admin@admin.com / admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
EOF

chmod +x start.sh

# Step 7: Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Medical Clinic System..."

# Kill backend
pkill -f "node server.js"

# Kill frontend
pkill -f "http-server"

echo "✅ All services stopped"
EOF

chmod +x stop.sh

echo ""
echo "🎉 Basic Medical Clinic System deployed successfully!"
echo "=================================================="
echo ""
echo "📁 Application location: $APP_DIR"
echo "🚀 To start the system: cd $APP_DIR && ./start.sh"
echo "🛑 To stop the system: cd $APP_DIR && ./stop.sh"
echo ""
echo "📊 Backend will run on: http://localhost:3000"
echo "🌐 Frontend will run on: http://localhost:4200"
echo "🔐 Default login: admin@admin.com / admin123"
echo ""
echo "📋 Files created:"
echo "  - backend/server.js (Basic API server)"
echo "  - backend/package.json (Backend dependencies)"
echo "  - frontend/public/index.html (Simple web interface)"
echo "  - frontend/package.json (Frontend dependencies)"
echo "  - start.sh (Start all services)"
echo "  - stop.sh (Stop all services)"
echo ""
echo "✅ Ready to use!"
