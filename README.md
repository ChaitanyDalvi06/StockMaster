# StockMaster - Inventory Management System

AI-Powered Inventory Management with Voice Assistant

## Tech Stack

**Frontend:**
- React.js
- Material-UI (MUI)
- Axios
- React Router
- Context API

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication

**AI Integration:**
- Sarvam AI (STT, TTS, Translation)
- OpenRouter (GPT-4o-mini)

## Features

- Product Management
- Receipts, Deliveries, Transfers, Adjustments
- Move History & Audit Trail
- Role-Based Access Control (Admin, Manager, Staff)
- Real-time Dashboard with KPIs
- AI Voice Assistant (11+ Indian Languages)
- Dark/Light Theme

## Setup

### Prerequisites
- Node.js
- MongoDB

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/StockmasterDB
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3001
OPENAI_API_KEY=your_openrouter_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini
SARVAM_API_KEY=your_sarvam_key
```

Start backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Usage

1. Access `http://localhost:3001`
2. Register (first user becomes admin)
3. Start managing inventory
4. Use AI chatbot for voice queries

## License

MIT

