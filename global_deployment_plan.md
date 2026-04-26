# PulseAPI — Global Cloud Deployment Plan
## Everything Deployed, Nothing Local

> [!IMPORTANT]
> **100% Free** — Every service used here has a free tier. No credit card surprises.
> Everything will have a **public URL** accessible from anywhere in the world.

---

## Can We Do This? YES ✅

Here's why it's fully possible at zero cost:
- Oracle Cloud gives **2 free VMs forever** (no expiry, no credit card billing)
- SonarCloud gives **free cloud-hosted SonarQube** for public GitHub repos
- Vercel gives **free global frontend hosting**
- Docker Hub gives **free public image registry**
- Supabase gives **free PostgreSQL database**

---

## Global Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET (Global)                            │
│                                                                     │
│  ┌──────────────┐     ┌──────────────────┐     ┌────────────────┐  │
│  │   GitHub     │────▶│  Jenkins Server  │────▶│  Docker Hub    │  │
│  │ (source code)│     │ Oracle Cloud VM1 │     │ (image store)  │  │
│  │ github.com   │     │ (free forever)   │     │ hub.docker.com │  │
│  └──────────────┘     └────────┬─────────┘     └────────────────┘  │
│          │                     │                                     │
│          │ webhook             │ ansible-playbook (SSH)              │
│          ▼                     ▼                                     │
│  ┌──────────────────┐  ┌──────────────────────────────────────────┐ │
│  │  SonarCloud.io   │  │          App Server                      │ │
│  │  (free cloud     │  │       Oracle Cloud VM2                   │ │
│  │   SonarQube)     │  │       (free forever)                     │ │
│  │  sonarcloud.io   │  │                                          │ │
│  └──────────────────┘  │  ┌────────────────────────────────────┐  │ │
│                        │  │  Docker Container: Backend (Node)  │  │ │
│                        │  │  port 3001 → public IP:3001        │  │ │
│                        │  └────────────────────────────────────┘  │ │
│                        └──────────────────────────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐       ┌──────────────────────────────────────┐ │
│  │  Vercel (free)  │       │  Supabase (free)                     │ │
│  │ Frontend React  │──────▶│  PostgreSQL Database                 │ │
│  │ pulseapi.vercel │       │  db.supabase.co                      │ │
│  │    .app         │       └──────────────────────────────────────┘ │
│  └─────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Services & Where Each Runs

| Component | Platform | URL (example) | Cost |
|-----------|----------|---------------|------|
| **Source Code** | GitHub | github.com/you/pulseapi | Free |
| **Jenkins CI/CD** | Oracle Cloud VM1 | `http://<vm1-ip>:8080` | **Free Forever** |
| **Backend API** | Oracle Cloud VM2 (Docker) | `http://<vm2-ip>:3001` | **Free Forever** |
| **Frontend** | Vercel | `pulseapi.vercel.app` | **Free Forever** |
| **Database** | Supabase | `db.supabase.co` | **Free Forever** |
| **SonarQube** | SonarCloud.io | `sonarcloud.io/project/pulseapi` | **Free (public repo)** |
| **Docker Images** | Docker Hub | `hub.docker.com/r/you/pulseapi` | **Free** |
| **Ansible** | Runs on VM1 → SSH to VM2 | N/A (automation) | **Free** |

> [!NOTE]
> **Oracle Cloud Free Tier** = 2 x AMD VMs with 1GB RAM, 1 OCPU, 47GB storage each.
> These are **always-on**, permanent, never sleep. No credit card charges ever.
> Sign up at: cloud.oracle.com → Free Tier

---

## Revised CI/CD Pipeline (Fully Cloud)

```
[You push code to GitHub]
          ↓
   GitHub Webhook fires
          ↓
┌─────────────────────────────────────────────────────────┐
│            Jenkins (Oracle Cloud VM1)                    │
│                                                          │
│  Stage 1: Checkout                                       │
│    → git clone from GitHub                              │
│                                                          │
│  Stage 2: Install Dependencies                           │
│    → npm ci (backend + frontend) on VM1                 │
│                                                          │
│  Stage 3: Jest Tests                                     │
│    → npm test --coverage                                │
│    → Produces lcov coverage report                      │
│    → JUnit XML report archived in Jenkins               │
│                                                          │
│  Stage 4: SonarCloud Analysis                            │
│    → sonar-scanner sends results to sonarcloud.io       │
│    → Quality Gate checked via SonarCloud API            │
│    → Pipeline fails if gate not passed                  │
│                                                          │
│  Stage 5: Docker Build + Push                            │
│    → docker build backend image on VM1                  │
│    → docker build frontend image on VM1                 │
│    → docker push → Docker Hub (public registry)         │
│                                                          │
│  Stage 6: Ansible Deploy                                 │
│    → ansible-playbook runs on VM1                       │
│    → SSH into VM2 (App Server)                          │
│    → docker pull latest image from Docker Hub           │
│    → docker-compose up -d (backend goes live)           │
│    → curl health check on VM2:3001/api/health           │
│                                                          │
│  Stage 7: Deploy Frontend to Vercel                      │
│    → vercel --prod (via Vercel CLI in Jenkins)          │
│    → React app goes live on pulseapi.vercel.app         │
└─────────────────────────────────────────────────────────┘
          ↓
   [PulseAPI Live Globally ✅]
   Frontend: pulseapi.vercel.app
   Backend:  http://<vm2-ip>:3001
   Jenkins:  http://<vm1-ip>:8080
   SonarQube: sonarcloud.io/project/pulseapi
```

---

## What Runs Where — Detailed Breakdown

### 🖥️ Oracle Cloud VM1 — Jenkins Server
**Installed on this VM:**
- Jenkins (runs on port 8080, publicly accessible)
- Node.js + npm (for running tests + builds)
- Docker (for building images)
- sonar-scanner CLI (for SonarCloud analysis)
- Ansible (for deploying to VM2)
- Vercel CLI (for deploying frontend)

**Public URL:** `http://<VM1-public-ip>:8080` — Jenkins dashboard

---

### 🖥️ Oracle Cloud VM2 — Application Server
**Installed on this VM:**
- Docker + Docker Compose (for running containers)
- SSH access (Ansible connects here to deploy)

**Runs:**
- `pulseapi-backend` Docker container on port 3001

**Public URL:** `http://<VM2-public-ip>:3001` — Backend API

---

### 🌐 Vercel — Frontend Hosting
- React app built by Jenkins + deployed via Vercel CLI
- Auto HTTPS, global CDN
- **Public URL:** `https://pulseapi.vercel.app`

---

### 🗄️ Supabase — Database
- PostgreSQL replaces SQLite (cloud-native DB)
- Backend connects to Supabase via connection string
- Accessible from VM2's Docker container
- Free tier: 500MB storage, unlimited API requests

---

### 🔍 SonarCloud.io — Code Quality
- Cloud-hosted SonarQube (no server needed)
- Login with GitHub account → connect repo → done
- Jenkins pipeline sends scan results via sonar-scanner
- **Public URL:** `https://sonarcloud.io/project/pulseapi`

---

### 🐳 Docker Hub — Image Registry
- Jenkins builds images on VM1, pushes to Docker Hub
- VM2 pulls latest image from Docker Hub during deployment
- **Public URL:** `https://hub.docker.com/r/<username>/pulseapi-backend`

---

## Setup Sequence (Step-by-Step)

```
STEP 1: Create Oracle Cloud account (free)
         → Sign up at cloud.oracle.com
         → Create 2 VMs (Ubuntu 22.04)

STEP 2: Create GitHub repository
         → Push all project code

STEP 3: Create SonarCloud account
         → Login with GitHub
         → Add pulseapi repo → get token

STEP 4: Create Supabase project
         → Get connection string

STEP 5: Create Docker Hub account
         → Create public repo: pulseapi-backend

STEP 6: Create Vercel account
         → Login with GitHub
         → Get Vercel token for CLI

STEP 7: Setup VM1 (Jenkins Server)
         → Install Java, Jenkins, Node, Docker, Ansible, sonar-scanner
         → Configure Jenkins credentials (SonarCloud token, DockerHub login, Vercel token, VM2 SSH key)
         → Install Jenkins plugins (SonarQube Scanner, Docker Pipeline, GitHub)

STEP 8: Setup VM2 (App Server)
         → Install Docker + Docker Compose
         → Configure firewall rules (open port 3001)
         → Add VM1's SSH public key to VM2

STEP 9: Build the application code
         → Backend, Frontend, Tests, Dockerfiles, Ansible playbook, Jenkinsfile

STEP 10: Connect GitHub webhook → Jenkins
          → Any push triggers the pipeline automatically

STEP 11: Run pipeline end-to-end
          → All 7 stages green ✅
          → Everything live globally
```

---

## Firewall / Port Configuration (Oracle Cloud)

| VM | Port | Service | Who Accesses |
|----|------|---------|-------------|
| VM1 | 22 | SSH | You (for setup) |
| VM1 | 8080 | Jenkins UI | You + Lab evaluator |
| VM2 | 22 | SSH | VM1 (Ansible) |
| VM2 | 3001 | Backend API | Frontend (Vercel) + evaluator |

---

## What Your Evaluator Will See (Global URLs)

| What | URL |
|------|-----|
| Live App (Frontend) | `https://pulseapi.vercel.app` |
| Live API | `http://<VM2-ip>:3001/api/health` |
| Jenkins Pipeline | `http://<VM1-ip>:8080` |
| SonarQube Report | `https://sonarcloud.io/project/pulseapi` |
| Docker Image | `https://hub.docker.com/r/you/pulseapi-backend` |

---

## Report Screenshots (Global Proof)

### Application
- [ ] PulseAPI Dashboard at `pulseapi.vercel.app` (live global URL)
- [ ] Backend API response at `<vm2-ip>:3001/api/health`

### CI/CD Pipeline
- [ ] Jenkins at `<vm1-ip>:8080` — all 7 stages green
- [ ] Jenkins test results (Jest JUnit report)
- [ ] SonarCloud dashboard — quality gate PASSED (sonarcloud.io)
- [ ] Docker Hub — image pushed, with tag and timestamp
- [ ] Ansible playbook log — all tasks `ok` or `changed`
- [ ] Vercel deployment log — frontend deployed

### Infrastructure
- [ ] Oracle Cloud VM1 (Jenkins) — public IP visible
- [ ] Oracle Cloud VM2 (App) — public IP visible, `docker ps` showing container
- [ ] Supabase dashboard — DB connected

---

## Technology Count for Lab Report

| # | Technology | Category | Global Platform |
|---|-----------|----------|----------------|
| 1 | **Jenkins** | CI/CD Orchestration (compulsory) | Oracle Cloud VM |
| 2 | **Jest** | Testing Tool (compulsory) | Runs in Jenkins |
| 3 | **SonarCloud** | Code Quality Analysis | sonarcloud.io |
| 4 | **Docker + Docker Hub** | Containerization + Registry | Oracle Cloud + Docker Hub |
| 5 | **Ansible** | Deployment Automation (compulsory) | Runs in Jenkins → VM |
| 6 | **Vercel** | Frontend Global Hosting | vercel.com |
| 7 | **Supabase** | Cloud Database | supabase.io |

---

## Summary

> [!NOTE]
> This is a **real-world DevOps setup** — the same architecture used in professional projects.
> Everything has a public URL. Nothing depends on your local machine being on.
> Even if you shut down your laptop, the app stays live.

**Total Cost: ₹0 (Free)**
**Global Availability: 24/7**
**Real-World Scenario: ✅ Yes**
