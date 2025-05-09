# 🎨 BoardSync - A Collaborative Whiteboard

**Live Together, Sketch Together.**  
BoardSync is a full-featured collaborative whiteboard web application where users can create, share, and edit whiteboards in real-time. Designed for seamless teamwork, it features secure authentication, permission controls, real-time notifications, and an intuitive drawing interface.

---

## 🚀 Features

- 🔐 **Secure Authentication** using JWT tokens  
- 🧑‍🤝‍🧑 **Real-Time Whiteboard Collaboration** with multiple users  
- ✉️ **Email-Based Invitations** to collaborate on whiteboards  
- 🔒 **Permission Management**:  
  - **Owner**: Full control (edit, delete, invite)  
  - **Collaborators**: Edit or view-only access  

- 📩 **Invitation System**:
  - Invites sent via registered email
  - Users can accept or reject invitations

- 🎯 **Whiteboard Access Filtering**:
  - Starred Boards  
  - My Boards  
  - Shared With Me  

- 🖼 **Whiteboard Export**:
  - Download as PNG  
  - Save to local machine  

- ✏️ **Interactive Drawing Tools** and a user-friendly design  

---

## 📥 Clone This Repository

```bash
git clone https://github.com/AbdulMoiz2493/BoardSync-A-Collaborative-Whiteboard.git
cd BoardSync-A-Collaborative-Whiteboard
````

---

## 🗂️ Project Structure

```
BoardSync-A-Collaborative-Whiteboard/
|
├── app/
│   ├── client/                 # Frontend (React + Tailwind + Vite)
│   │   ├── public/
│   │   └── src/
│   │       ├── assets/
│   │       ├── components/
│   │       ├── App.jsx
│   │       ├── App.css
│   │       ├── index.css
│   │       └── main.jsx
│   │   ├── index.html
│   │   └── ... (config files)
│   │
│   ├── server/                 # Backend (Node.js + Express + MongoDB)
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── server.js
│   │   └── .env (required, see below)
|
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD workflow
|
├── Dockerfile                 # Docker configuration
├── deployment.yaml            # Kubernetes deployment
├── service.yaml               # Kubernetes service
├── mongodb-deployment.yaml    # mongodb deployment
├── mongodb-service.yaml       # mongodb service
└── README.md
```

---

## 🛠 Getting Started

### Prerequisites

* Node.js and npm
* MongoDB (local or network-accessible)
* Docker & Minikube
* `kubectl`
* GitHub Actions Runner (for CI/CD)

---

## ⚙️ Backend Setup

```bash
cd app/server
npm install
```

Create a `.env` file:

```
PORT=3000
MONGODB_URI=mongodb://<your-ip>:27017/boardsync1
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:

```bash
node server.js
```

---

## 🎨 Frontend Setup

```bash
cd app/client
npm install
npm run dev
```

---

## 🐳 Deployment with Docker and Kubernetes

### 1. Build and Test Docker Image

```bash
cd ~/BoardSync-A-Collaborative-Whiteboard
docker build -t abdulmoiz2493/boardsync:latest .
```

Run the container:

```bash
docker run --name boardsync-test -p 3000:3000 -p 5173:5173 -e MONGODB_URI=mongodb://<your-ip>:27017/boardsync1 abdulmoiz2493/boardsync:latest
```

Access frontend at: `http://localhost:5173`
Stop the container:

```bash
docker stop boardsync-test
docker rm boardsync-test
```

---

### 2. Push to Docker Hub

```bash
docker login -u abdulmoiz2493
docker push abdulmoiz2493/boardsync:latest
```

---

### 3. Set Up Minikube

```bash
minikube start
eval $(minikube docker-env)
```

---

### 4. Deploy to Minikube

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f mongodb-service.yaml
```

Verify:

```bash
kubectl get pods -n boardsync-ns -o wide
kubectl get services -n boardsync-ns -o wide
```

Tunnel:

```bash
minikube tunnel
minikube service boardsync-service -n boardsync-ns
```

---

### 5. Automate with GitHub Actions

#### Setup Self-Hosted Runner

```bash
mkdir ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64-2.317.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.317.0/actions-runner-linux-x64-2.317.0.tar.gz
tar xzf actions-runner-linux-x64-2.317.0.tar.gz
./config.sh --url https://github.com/AbdulMoiz2493/BoardSync-A-Collaborative-Whiteboard --token <your-token>
sudo ./svc.sh install
sudo ./svc.sh start
```

#### Add Secrets

Go to your GitHub repository:
`Settings → Secrets → Actions`
Add the following:

* `DOCKER_USERNAME`
* `DOCKER_PASSWORD`

#### Trigger Workflow

```bash
git add .
git commit -m "Trigger CI/CD workflow"
git push origin main
```

---

## 📄 Technologies Used

* **Frontend**: React.js, Tailwind CSS, Vite
* **Backend**: Node.js, Express.js, MongoDB
* **Authentication**: JWT
* **Real-Time Communication**: Socket.io
* **Styling**: PostCSS, Tailwind
* **Containerization**: Docker
* **Orchestration**: Kubernetes (Minikube)
* **CI/CD**: GitHub Actions

---

## 🙌 Contributing

Contributions are welcome!
Please fork the repo and submit a pull request. For major changes, open an issue first to discuss your ideas.

---

## 📧 Contact

Created by **Abdul Moiz**
- Email: [abdulmoiz8895@gmail.com](mailto:abdulmoiz8895@gmail.com)
- GitHub: [AbdulMoiz2493](https://github.com/AbdulMoiz2493)
- Portfolio: [abdul-moiz.tech](https://abdul-moiz.tech)

---

> *"Whiteboard your thoughts. Collaborate your ideas. Build the future with BoardSync."*

