# PulseAPI: Smart API Health Monitoring & Alerting Platform
## DevOps Lab ISE — Implementation Plan (Updated)

A full-stack web application with a complete CI/CD pipeline satisfying the lab requirements:
- ✅ Web Application (50% marks)
- ✅ CI/CD Pipeline with **5 technologies** (50% marks)
- ✅ Compulsory: **Testing Tool (Jest)** + **Jenkins**
- ✅ Compulsory: **Ansible**
- ✅ Bonus: **SonarQube** (code quality gate) + **Docker** (containerization)

---

## Technology Stack

### Application Technologies
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | Interactive dashboard UI |
| Backend | Node.js + Express | REST API server |
| Database | SQLite (via better-sqlite3) | Store monitor configs & history |
| Styling | Vanilla CSS with animations | Premium dark-mode dashboard |

### CI/CD Pipeline Technologies (5 Tools)
| # | Tool | Role | Type |
|---|------|------|------|
| 1 | **Jenkins** | CI/CD Orchestration | Compulsory |
| 2 | **Jest** | Automated unit + integration tests | Compulsory (Testing Tool) |
| 3 | **SonarQube** | Static code analysis & quality gate | Code Quality |
| 4 | **Docker** | Containerization & image builds | Deployment |
| 5 | **Ansible** | Automated environment provisioning & deployment | Compulsory |

> [!IMPORTANT]
> This satisfies "3–4 technologies" (we exceed it with 5) and the compulsory Jenkins + Testing + Ansible requirement.

---

## Application Features (PulseAPI Dashboard)

### Core Functionality
1. **API Monitor Management** — Add/remove API endpoints to monitor
2. **Real-Time Health Checks** — Periodic polling of registered APIs (configurable intervals)
3. **Uptime Tracking** — % uptime calculated over 24h / 7d windows
4. **Response Time Metrics** — Avg, min, max response latency
5. **Failure Detection & Alerts** — Visual alerts when APIs go down or become slow
6. **Dashboard** — Live status cards, response time charts, health history timeline
7. **Alert Log** — Filter and view past incidents by severity and time

### UI Screens
- **Dashboard** — Overview cards (UP/DOWN counts, avg uptime %), response time graphs
- **Monitors** — Add / edit / delete API monitors with custom intervals
- **Alerts** — Incident log with timestamps and status codes
- **History** — Per-monitor response time history chart

---

## Project Structure

```
C:\Users\Acer\.gemini\antigravity\scratch\pulseapi\
├── backend/
│   ├── src/
│   │   ├── index.js             # Express server entry point
│   │   ├── db.js                # SQLite database setup & schema
│   │   ├── monitors.js          # Monitor CRUD routes
│   │   ├── checker.js           # Health check scheduler (node-cron)
│   │   └── alerts.js            # Alert generation logic
│   ├── tests/
│   │   ├── monitors.test.js     # Unit tests for monitor CRUD logic
│   │   ├── checker.test.js      # Integration tests for health checks
│   │   └── alerts.test.js       # Alert generation tests
│   ├── sonar-project.properties # SonarQube scanner config for backend
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MonitorCard.jsx
│   │   │   ├── AddMonitorModal.jsx
│   │   │   ├── AlertLog.jsx
│   │   │   └── ResponseChart.jsx
│   │   └── index.css            # Full design system (dark mode)
│   ├── sonar-project.properties # SonarQube scanner config for frontend
│   ├── package.json
│   └── Dockerfile
├── ansible/
│   ├── playbook.yml             # Deployment automation playbook
│   └── inventory.ini            # Target host definitions
├── sonarqube/
│   └── docker-compose.sonar.yml # Runs SonarQube server locally via Docker
├── Jenkinsfile                  # Full declarative pipeline (6 stages)
├── docker-compose.yml           # Full stack local orchestration
└── README.md
```

---

## CI/CD Pipeline Design (6 Stages)

```
[Developer pushes code]
          ↓
   [Jenkins Pipeline]
          ↓
  ┌─────────────────────────────────────┐
  │ Stage 1: Checkout                   │
  │  → Pull latest code from repository │
  └──────────────┬──────────────────────┘
                 ↓
  ┌─────────────────────────────────────┐
  │ Stage 2: Install Dependencies       │
  │  → npm ci (backend + frontend)      │
  └──────────────┬──────────────────────┘
                 ↓
  ┌─────────────────────────────────────┐
  │ Stage 3: Run Tests (Jest)           │  ← COMPULSORY TESTING TOOL
  │  → Unit tests, integration tests    │
  │  → Generate coverage report (lcov)  │
  │  → Fail pipeline if tests fail      │
  └──────────────┬──────────────────────┘
                 ↓
  ┌─────────────────────────────────────┐
  │ Stage 4: SonarQube Analysis         │  ← CODE QUALITY GATE
  │  → Run sonar-scanner on backend     │
  │  → Run sonar-scanner on frontend    │
  │  → Check Quality Gate status        │
  │  → Fail if gate is not passed       │
  └──────────────┬──────────────────────┘
                 ↓
  ┌─────────────────────────────────────┐
  │ Stage 5: Docker Build               │  ← CONTAINERIZATION
  │  → docker build backend image       │
  │  → docker build frontend image      │
  └──────────────┬──────────────────────┘
                 ↓
  ┌─────────────────────────────────────┐
  │ Stage 6: Deploy via Ansible         │  ← COMPULSORY ANSIBLE
  │  → ansible-playbook playbook.yml    │
  │  → Pull images, start containers    │
  │  → Health check after deploy        │
  └──────────────┬──────────────────────┘
                 ↓
     [PulseAPI Live & Running ✅]
```

---

## SonarQube Integration Details

### How It Works
- **SonarQube Server** runs as a Docker container (via `docker-compose.sonar.yml`)
- **sonar-scanner** CLI is invoked inside the Jenkins pipeline (Stage 4)
- Jest generates a **lcov coverage report** → fed into SonarQube for coverage visualization
- SonarQube enforces a **Quality Gate**: pipeline fails if:
  - Code coverage < 50%
  - Critical bugs or vulnerabilities detected
  - Code duplication > 20%

### sonar-project.properties (Backend)
```properties
sonar.projectKey=pulseapi-backend
sonar.projectName=PulseAPI Backend
sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/node_modules/**
```

### sonar-project.properties (Frontend)
```properties
sonar.projectKey=pulseapi-frontend
sonar.projectName=PulseAPI Frontend
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/dist/**
```

### Jenkins → SonarQube Connection
- Jenkins uses the **SonarQube Scanner Plugin**
- Environment variable `SONAR_HOST_URL` points to `http://localhost:9000`
- Auth token stored as Jenkins credential secret

---

## Jenkinsfile Overview

```groovy
pipeline {
  agent any
  environment {
    SONAR_TOKEN = credentials('sonarqube-token')
    SONAR_HOST_URL = 'http://localhost:9000'
  }
  stages {
    stage('Checkout') { ... }
    stage('Install Dependencies') {
      parallel {
        stage('Backend') { steps { sh 'cd backend && npm ci' } }
        stage('Frontend') { steps { sh 'cd frontend && npm ci' } }
      }
    }
    stage('Run Tests') {
      steps {
        sh 'cd backend && npm test -- --coverage --coverageReporters=lcov'
      }
      post { always { junit 'backend/test-results/*.xml' } }
    }
    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh 'cd backend && sonar-scanner'
          sh 'cd frontend && sonar-scanner'
        }
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
    stage('Docker Build') {
      parallel {
        stage('Backend Image')  { steps { sh 'docker build -t pulseapi-backend ./backend' } }
        stage('Frontend Image') { steps { sh 'docker build -t pulseapi-frontend ./frontend' } }
      }
    }
    stage('Deploy via Ansible') {
      steps {
        sh 'ansible-playbook -i ansible/inventory.ini ansible/playbook.yml'
      }
    }
  }
  post {
    success { echo 'PulseAPI deployed successfully!' }
    failure { echo 'Pipeline failed. Check logs above.' }
  }
}
```

---

## Ansible Playbook Overview

```yaml
# ansible/playbook.yml
- name: Deploy PulseAPI
  hosts: localhost
  tasks:
    - name: Pull latest Docker images
      command: docker-compose pull

    - name: Stop existing containers
      command: docker-compose down

    - name: Start PulseAPI stack
      command: docker-compose up -d

    - name: Verify backend is healthy
      uri:
        url: http://localhost:3001/api/health
        status_code: 200
      retries: 5
      delay: 5
```

---

## Jest Test Plan (15+ Test Cases)

### monitors.test.js
- ✅ Should create a new monitor with valid data
- ✅ Should reject monitor with missing URL
- ✅ Should reject monitor with invalid URL format
- ✅ Should retrieve all monitors
- ✅ Should delete an existing monitor
- ✅ Should update monitor interval

### checker.test.js
- ✅ Should mark monitor as UP when API returns 200
- ✅ Should mark monitor as DOWN when API returns 500
- ✅ Should mark monitor as DOWN on timeout
- ✅ Should record response time correctly
- ✅ Should calculate uptime percentage correctly

### alerts.test.js
- ✅ Should generate alert when monitor goes DOWN
- ✅ Should NOT generate duplicate alerts for same outage
- ✅ Should resolve alert when monitor recovers
- ✅ Should store alert with correct timestamp and severity

---

## Report Screenshots Checklist

### Application Screenshots
- [ ] PulseAPI Dashboard (dark mode, live monitor cards)
- [ ] Monitors page (list of registered APIs)
- [ ] Add Monitor modal
- [ ] Alerts page (incident history)
- [ ] Response time chart (per monitor)

### Pipeline Screenshots
- [ ] Jenkins pipeline view (all 6 stages green)
- [ ] Jenkins Blue Ocean pipeline graph
- [ ] Jest test results in Jenkins (JUnit report)
- [ ] SonarQube dashboard (quality gate PASSED)
- [ ] SonarQube code coverage report
- [ ] SonarQube bugs/vulnerabilities/smells panel
- [ ] Docker containers running (`docker ps` output)
- [ ] Ansible playbook execution log (all tasks OK)

---

## Execution Order (When Building Starts)

1. **Setup project structure** — folders, package.json files
2. **Build backend** — Express + SQLite + health check scheduler
3. **Write Jest tests** — 15+ test cases
4. **Build frontend** — React dashboard with charts and animations
5. **Write Dockerfiles** — backend + frontend
6. **Write docker-compose.yml** — full stack orchestration
7. **Setup SonarQube** — docker-compose.sonar.yml + sonar-project.properties
8. **Write Jenkinsfile** — 6-stage declarative pipeline
9. **Write Ansible playbook** — automated deployment
10. **Run & verify** — end-to-end pipeline test
11. **Capture screenshots** — for report

---

## Open Questions

> [!IMPORTANT]
> Do you have **Jenkins** installed? If not, I'll provide a `docker-compose` setup to run Jenkins + SonarQube together locally.

> [!NOTE]
> Since you're on Windows, Ansible runs inside a Docker/WSL container — this is standard practice and fully valid for lab submission.

> [!NOTE]
> SonarQube requires at least **4GB RAM** to run. Let me know if your machine has limited RAM and I'll adjust accordingly.
