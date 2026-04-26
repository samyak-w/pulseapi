# PulseAPI — Smart API Health Monitoring & Alerting Platform

> A DevOps project built for Lab ISE. Monitors API uptime, tracks response times, detects failures, and generates alerts — deployed globally on GCP with a full CI/CD pipeline.

## 🌍 Live URLs

| Service | URL |
|---------|-----|
| Frontend | `https://pulseapi.vercel.app` |
| Backend API | `http://YOUR_VM2_IP:3001` |
| Jenkins | `http://YOUR_VM1_IP:8080` |
| SonarCloud | `https://sonarcloud.io/project/overview?id=samyak-w_pulseapi` |
| Docker Hub | `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/pulseapi-backend` |

---

## 🛠️ Technology Stack

### Application
- **Frontend:** React + Vite (hosted on Vercel)
- **Backend:** Node.js + Express
- **Database:** SQLite (persisted via Docker volume on GCP VM)

### CI/CD Pipeline (7 Stages)
| # | Stage | Tool |
|---|-------|------|
| 1 | Checkout | Jenkins + Git |
| 2 | Install Dependencies | npm ci |
| 3 | Automated Tests | **Jest** (compulsory testing tool) |
| 4 | Code Quality | **SonarCloud** (static analysis) |
| 5 | Containerize | **Docker** + Docker Hub |
| 6 | Deploy Backend | **Ansible** (compulsory) |
| 7 | Deploy Frontend | **Vercel CLI** |

---

## 📁 Project Structure

```
pulseapi/
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── index.js       # Server entry point
│   │   ├── db.js          # SQLite database
│   │   ├── monitors.js    # Monitor CRUD routes
│   │   ├── checker.js     # Health check scheduler
│   │   └── alerts.js      # Alert management
│   ├── tests/             # Jest test files (31 test cases)
│   ├── Dockerfile
│   └── sonar-project.properties
├── frontend/              # React + Vite dashboard
│   ├── src/components/
│   ├── Dockerfile
│   └── sonar-project.properties
├── ansible/
│   ├── playbook.yml       # Deployment automation
│   └── inventory.ini      # GCP server targets
├── Jenkinsfile            # 7-stage CI/CD pipeline
├── docker-compose.yml     # App server orchestration
└── README.md
```

---

## 🚀 Setup & Deployment

### Prerequisites (on Jenkins VM)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker
sudo apt install -y docker.io
sudo usermod -aG docker jenkins

# Ansible
sudo apt install -y ansible

# SonarScanner
export SONAR_SCANNER_VERSION=8.0.1.6346
curl --create-dirs -sSLo $HOME/.sonar/sonar-scanner.zip \
  https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip
unzip -o $HOME/.sonar/sonar-scanner.zip -d $HOME/.sonar/
```

### Jenkins Credentials to Configure
| ID | Type | Value |
|----|------|-------|
| `sonar-token` | Secret text | SonarCloud token |
| `dockerhub-credentials` | Username+Password | Docker Hub login |
| `vercel-token` | Secret text | Vercel token |

### Placeholders to Replace
Search and replace these in the project files:
- `YOUR_DOCKERHUB_USERNAME` → your Docker Hub username
- `YOUR_VM1_IP` → GCP Jenkins VM external IP
- `YOUR_VM2_IP` → GCP App Server VM external IP

---

## 🧪 Running Tests Locally

```bash
cd backend
npm install
npm test
```

Expected: **31 passing tests** across 3 test files.

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/monitors` | List all monitors |
| POST | `/api/monitors` | Create a monitor |
| PUT | `/api/monitors/:id` | Update a monitor |
| DELETE | `/api/monitors/:id` | Delete a monitor |
| GET | `/api/monitors/:id/history` | Check history |
| GET | `/api/alerts` | All alerts |
| GET | `/api/alerts/active` | Active alerts |
| GET | `/api/alerts/stats` | Dashboard stats |
