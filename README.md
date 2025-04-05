# BoardSync - A Collaborative Whiteboard

**Live Together, Sketch Together.**

BoardSync is a full-featured collaborative whiteboard web application where users can create, share, and edit whiteboards in real-time. Designed for seamless teamwork, it features secure authentication, permission controls, real-time notifications, and an intuitive drawing interface.

---

## 🚀 Features

- **Secure Authentication** using JWT tokens
- **Real-Time Whiteboard Collaboration** with multiple users
- **Email-Based Invitations** to collaborate on whiteboards
- **Permission Management**: 
  - Owner: full control (edit, delete, invite)
  - Collaborators: edit or view-only access
- **Invitation System**:
  - Invites sent via registered email
  - Users can Accept or Reject invitations
- **Whiteboard Access Filtering**:
  - Starred Boards
  - My Boards
  - Shared With Me
- **Whiteboard Export**:
  - Download as PNG
  - Save to local machine
- **Interactive Drawing Tools** and a user-friendly design

---

## 📥 Clone This Repository

To get a local copy up and running:

```bash
git clone https://github.com/AbdulMoiz2493/BoardSync-A-Collaborative-Whiteboard.git
cd BoardSync-A-Collaborative-Whiteboard
```

---

## 🗂️ Project Structure

```
BoardSync-A-Collaborative-Whiteboard/
|
├── client/                # Frontend (React + Tailwind + Vite)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│   ├── index.html
│   └── ... (config files)
|
├── server/                # Backend (Node.js + Express + MongoDB)
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── server.js
│   └── .env (see below)
|
└── README.md
```

---

## 🛠 Getting Started

### Backend (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/boardsync1
   JWT_SECRET=your-secret-key
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   node server.js
   ```

### Frontend (Client)

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📄 Technologies Used

- **Frontend**: React.js, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT
- **Real-Time Communication**: Socket.io (implied by socket folder)
- **Styling**: PostCSS, Tailwind

---

## 🙌 Contributing

Contributions are welcome! Please fork the repo and submit a pull request with your improvements. For large changes, open an issue first to discuss your proposal.

---

## 📧 Contact

- Created by **Abdul Moiz**  
- Email: [abdulmoiz8895@gmail.com](mailto:abdulmoiz8895@gmail.com)  
- GitHub: [AbdulMoiz2493](https://github.com/AbdulMoiz2493)

---

> "Whiteboard your thoughts. Collaborate your ideas. Build the future with BoardSync."

