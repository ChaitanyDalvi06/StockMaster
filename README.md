<div align="center">

# 📦 StockMaster

### AI-Powered Inventory Management System

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)

</div>

---

## ✨ Features

🎯 **Core Inventory Management**
- Product catalog with SKU tracking
- Multi-warehouse support
- Real-time stock updates
- Low stock alerts

📦 **Operations Management**
- 📥 **Receipts** - Incoming shipments
- 📤 **Deliveries** - Outgoing orders
- 🔄 **Internal Transfers** - Stock movement between locations
- ✏️ **Stock Adjustments** - Inventory corrections
- 📜 **Move History** - Complete audit trail

👥 **Role-Based Access Control**
- 👑 **Admin** - Full system access
- 🎯 **Manager** - Operations & inventory control
- 👤 **Staff** - View and basic operations

🤖 **AI Voice Assistant**
- 🎤 Speech-to-Text (STT)
- 🔊 Text-to-Speech (TTS)
- 🌐 Multi-language support (11+ Indian languages)
- 💬 Inventory insights via voice commands
- 🇮🇳 Understands Hindi, Marathi, Hinglish & more

🎨 **Modern UI/UX**
- Clean, professional design inspired by Untitled UI
- Dark/Light theme toggle
- Responsive layout
- Real-time dashboard with KPIs

---

## 🛠️ Tech Stack

### Frontend
```
⚛️  React.js - UI Library
🎨  Material-UI (MUI) - Component Library
🔄  Context API - State Management
🛣️  React Router - Navigation
📡  Axios - HTTP Client
```

### Backend
```
🟢  Node.js - Runtime
⚡  Express.js - Web Framework
🔐  JWT - Authentication
✅  Express Validator - Input Validation
🛡️  Helmet - Security Headers
📊  Morgan - Logging
```

### Database
```
🍃  MongoDB - NoSQL Database
📦  Mongoose - ODM (Object Data Modeling)
🗄️  MongoDB Compass - Database GUI
```

**Database Name:** `StockmasterDB`  
**Connection:** `localhost:27017`

### AI Integration
```
🤖  Sarvam AI - STT, TTS, Translation
🧠  OpenRouter (GPT-4o-mini) - AI Assistance
🌍  Language Detection - Auto-detect user language
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **MongoDB Compass** (optional, for GUI)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/ChaitanyDalvi06/StockMaster.git
cd StockMaster
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/StockmasterDB
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3001

# AI Configuration
OPENAI_API_KEY=your_openrouter_api_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini

# Sarvam AI (Voice Assistant)
SARVAM_API_KEY=your_sarvam_api_key
```

Start backend server:
```bash
npm run dev
```
✅ Backend running on `http://localhost:5001`

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start
```
✅ Frontend running on `http://localhost:3001`

### 4️⃣ Database Setup
1. Start MongoDB service
2. Open MongoDB Compass (optional)
3. Connect to: `mongodb://localhost:27017`
4. Database `StockmasterDB` will be created automatically on first run

---

## 📚 Usage Guide

### First Time Setup
1. Navigate to `http://localhost:3001`
2. Click **"Create Account"**
3. Register with your details
4. **First user becomes Admin automatically** 🔑
5. Start managing your inventory!

### Dashboard Features
- 📊 Total Products Count
- ⚠️ Low Stock Alerts
- 📦 Pending Receipts & Deliveries
- 💰 Total Inventory Value (₹)
- 📈 Stock Level Indicators
- 🥧 Category Distribution Chart

### AI Voice Assistant
1. Click the **chatbot icon** (bottom-right corner)
2. Click **microphone** to speak
3. Ask questions like:
   - *"Kitne products hai?"* (Hindi)
   - *"Total Kiti Products Aahet?"* (Marathi)
   - *"How many products do I have?"* (English)
4. Get instant voice responses! 🎤

---

## 🎯 Key Highlights

✅ **MERN Stack** - Modern full-stack architecture  
✅ **Real-time Updates** - Live inventory tracking  
✅ **Secure Authentication** - JWT-based auth system  
✅ **Role-Based Permissions** - 3-tier access control  
✅ **AI-Powered** - Voice assistant with STT/TTS  
✅ **Multi-language** - Supports 11+ Indian languages  
✅ **Professional UI** - Inspired by Untitled UI  
✅ **Mobile Responsive** - Works on all devices  
✅ **Complete Audit Trail** - Track all stock movements  

---

## 📦 Database Collections

- `users` - User accounts & roles
- `products` - Product catalog
- `receipts` - Incoming shipments
- `deliveries` - Outgoing orders
- `transfers` - Internal stock movements
- `adjustments` - Inventory corrections
- `stockmoves` - Complete movement history
- `categories` - Product categories
- `warehouses` - Warehouse locations

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

---

## 📄 License

MIT License - feel free to use this project for learning and development!

---

<div align="center">

### Built with ❤️ for Odoo Hackathon

**Made by:** [Chaitanya Dalvi](https://github.com/ChaitanyDalvi06)

⭐ Star this repo if you found it helpful!

</div>
