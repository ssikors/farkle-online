# Farkle online

This project is a full-stack real-time multiplayer game built using:

- 🌐 **Next.js** frontend (React + TypeScript)
- 🧩 **.NET F# backend** using **SignalR** for real-time communication

---

## 🧪 Features

- Real-time game state updates via SignalR
- Backend logic in F# + Giraffe
- Animated and interactive UI with Next.js +  TypeScript
- Player sync and state handling

---

## 📦 Installation
### 1. Backend (F# / .NET)

#### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download)
- F# tools (usually installed with .NET SDK)

#### Setup

```bash
cd backend
dotnet restore
dotnet build
dotnet run 
```

### 2. Frontend (Next.js)
#### Prerequisites
- [Node.js v18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

#### Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:
```ini
NEXT_PUBLIC_API_URL=https://localhost:7102  (for local development)
```

Run the app
```bash
npm run dev
```
