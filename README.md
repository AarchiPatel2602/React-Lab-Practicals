# React + Vite Lab Practicals

This repository contains the Full Stack Web Development Lab Practicals (React, Express, MongoDB, Node.js).

---

## Practical 11: Containerization with Docker and Docker Compose

### Overview
Practical 11 containerizes the complete 3-tier MERN application using Docker and Docker Compose:
- **Frontend Service (`frontend`)**: React + Vite application compiled via multi-stage Docker build and served through high-performance Nginx with SPA routing support. Exposed on `http://localhost:5173` and `http://localhost:3000`.
- **Backend Service (`backend`)**: Express.js REST API running on Node.js 20 Alpine. Exposed on `http://localhost:5000`.
- **Database Service (`mongodb`)**: MongoDB 7.0 container with data persisted using a Docker named volume (`mongo_data`). Exposed on `mongodb://localhost:27017` and internally accessible to services on `mongodb://mongodb:27017/taskdb`.
- **Isolated Bridge Network (`app-network`)**: Dedicated bridge network providing secure inter-container communication and automatic DNS resolution by service name.
- **Named Volume (`mongo_data`)**: Guarantees database state persistence across container restarts, recreations, and teardowns.

---

### Project Architecture & Port Mapping
| Service | Container Name | Image / Base | Internal Port | Host Port | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mongodb` | `task-mongodb` | `mongo:7.0` | 27017 | `27017` | Database engine with persistent storage |
| `backend` | `task-backend` | `node:20-alpine` | 5000 | `5000` | Express REST API & business logic |
| `frontend` | `task-frontend` | `nginx:alpine` | 80 | `5173`, `3000` | Production React SPA web server |

---

### Prerequisites
- Docker Engine / Docker Desktop (v20+ or v29+)
- Docker Compose (v2+ or v5+)

---

### Docker Setup and Execution

#### 1. Build and Run All Services
To build the Docker images and start all three containers in detached mode:
```bash
docker compose up --build -d
```

#### 2. Check Container Status and Health
Verify that all services are running and MongoDB is healthy:
```bash
docker compose ps
docker ps
```

#### 3. View Service Logs
Monitor runtime logs for all or individual services:
```bash
# All services
docker compose logs -f

# Specific service logs
docker compose logs -f backend
docker compose logs -f mongodb
docker compose logs -f frontend
```

#### 4. Stop and Clean Up
To stop all containers while preserving database volume data:
```bash
docker compose down
```

To stop all containers and remove volumes (fresh reset):
```bash
docker compose down -v
```

---

### Verification and Testing
1. **Frontend Application**: Open `http://localhost:5173` in any modern web browser to access the React interface.
2. **Backend API**: Send requests to `http://localhost:5000/tasks` or check backend health status.
3. **MongoDB Connectivity**: Observe backend startup logs indicating `✅ MongoDB Connected` via service name `mongodb://mongodb:27017/taskdb`.
4. **Data Persistence**: Add tasks through the UI or API, run `docker compose down`, restart with `docker compose up -d`, and verify that tasks remain intact.
