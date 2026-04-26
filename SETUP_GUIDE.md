# ✅ PulseAPI — What YOU Need to Do First
## Setup Checklist (Do This Before Building Starts)

> Complete these steps ONE BY ONE in order.
> Estimated Total Time: 45–60 minutes
>
> ⚠️ STEP 2 requires a VM (cloud server). See all options listed — pick the one that works for you.

---

## STEP 1 — Create GitHub Repository (5 min)
**Why:** All project code lives here. Jenkins pulls from here.

1. Go to → https://github.com
2. Sign in (or create account)
3. Click **"New Repository"**
4. Name it: `pulseapi`
5. Set visibility to: **Public** ← IMPORTANT (needed for SonarCloud free tier)
6. Click **"Create Repository"**

📝 **Note down:**
```
GitHub Repo URL: https://github.com/samyak-w/pulseapi
GitHub Username: samyak-w
```

---

## STEP 2 — Get 2 Cloud VMs (Jenkins Server + App Server)
**Why:** VM1 = Jenkins Server | VM2 = App Server (Backend runs here)

> You need 2 Ubuntu 22.04 VMs with public IPs.
> Pick ONE option below based on what you have available.

---

### 🥇 Option A — AWS Educate (BEST — No Credit Card, Free for Students)
**Requirements:** College/university email address

1. Go to → https://aws.amazon.com/education/awseducate/
2. Click **"Join AWS Educate"**
3. Fill in your details — use your **college email** (e.g. `name@college.edu`)
4. Verify email → Wait for approval email (usually instant to 24 hrs)
5. Once approved → Go to **AWS Console → EC2 → Launch Instance**
6. Create **2 instances**:
   - Instance 1: Name `pulseapi-jenkins`
   - Instance 2: Name `pulseapi-appserver`
   - Both: **Ubuntu 22.04**, type **t2.micro** (Free Tier)
7. Download SSH key pair (`.pem` file) — keep it safe!
8. Open Security Group ports for both:

| Port | VM | Purpose |
|------|----|---------|
| 22 | Both | SSH |
| 8080 | VM1 only | Jenkins UI |
| 3001 | VM2 only | Backend API |

---

### 🥈 Option B — Try Oracle Cloud with Indian Debit Card (Usually Works)
**Requirements:** Visa/Mastercard Debit Card (SBI, HDFC, ICICI, Axis — most work)

> Oracle only charges ₹2 for verification → refunded within 24 hours.
> Does NOT charge anything else on free tier.

1. Go to → https://cloud.oracle.com
2. Click **"Start for free"**
3. Fill in details — use real email
4. Select Home Region → **"India South (Hyderabad)"** or **"India West (Mumbai)"**
5. When asked for payment → enter your **debit card details**
6. ₹2 will be deducted and refunded — this is just verification
7. After account activation → Go to **Compute → Instances → Create Instance**
8. Create **2 instances**:
   - Name: `pulseapi-jenkins` and `pulseapi-appserver`
   - Image: **Ubuntu 22.04**
   - Shape: **VM.Standard.E2.1.Micro** (Always Free tag)
9. Download SSH key pairs for both
10. Open firewall ports:
    - Go to **Networking → VCN → Security Lists → Add Ingress Rules**
    - Add ports: 22, 8080 (VM1), 3001 (VM2)

---

### 🥉 Option C — Google Cloud Free Trial (Needs Debit Card, $300 Credit)
1. Go to → https://cloud.google.com/free
2. Click **"Get started for free"**
3. Add debit card (Visa/Mastercard) → $300 free credit for 90 days
4. Go to **Compute Engine → VM Instances → Create**
5. Create 2 VMs:
   - Machine type: **e2-micro** (Free Tier)
   - Image: **Ubuntu 22.04 LTS**
   - Region: `asia-south1` (Mumbai)
6. Enable HTTP/HTTPS traffic + open custom ports 8080, 3001 in firewall rules

---

### 💰 Option D — Hostinger VPS (Paid, Accepts UPI/Debit ₹79–99/month)
**Use this if none of the above work**

1. Go to → https://www.hostinger.in/vps-hosting
2. Pick the cheapest plan (₹79–99/month)
3. Pay via **UPI, Debit Card, or Net Banking** (no credit card needed)
4. You get 1 VPS → We'll run Jenkins + App on the same server
5. OS: **Ubuntu 22.04**

> ⚠️ With only 1 VM, Jenkins and the app run on the same server.
> This is fine for a lab project.

---

📝 **After getting your VMs, note down:**
```
VM Provider chosen:            ___________________________ (AWS/Oracle/GCP/Hostinger)
VM1 (Jenkins) Public IP:      ___________________________
VM2 (App Server) Public IP:   ___________________________ (same as VM1 if Hostinger)
SSH Username:                 ubuntu (AWS/Oracle) OR root (Hostinger)
SSH Key File location:        ___________________________
```

---

## STEP 3 — Create Docker Hub Account (5 min)
**Why:** Jenkins builds Docker images and pushes them here. App Server pulls from here.

1. Go to → https://hub.docker.com
2. Sign up with any email
3. Verify email
4. After login → Click **"Create Repository"**
5. Name: `pulseapi-backend`
6. Visibility: **Public**
7. Click Create

📝 **Note down:**
```
Docker Hub Username: ___________________________
Docker Hub Password: ___________________________
```

---

## STEP 4 — Create SonarCloud Account (5 min)
**Why:** Free cloud-hosted SonarQube for code quality analysis.

1. Go to → https://sonarcloud.io
2. Click **"Log in with GitHub"**
3. Authorize SonarCloud to access your GitHub
4. Click **"+"** → **"Analyze new project"**
5. Select your `pulseapi` repo → Click **"Set Up"**
6. Choose **"With Jenkins"** as the analysis method
7. Go to **My Account → Security → Generate Token**
8. Name it: `pulseapi-jenkins-token`
9. Click Generate → **Copy the token immediately** (shown only once!)

📝 **Note down:**
```
SonarCloud Token:        ___________________________
SonarCloud Organization: ___________________________  (shown on your dashboard)
SonarCloud Project Key:  pulseapi
```

---

## STEP 5 — Create Vercel Account (5 min)
**Why:** Hosts the React frontend globally with a public URL.

1. Go to → https://vercel.com
2. Click **"Sign Up"** → **Continue with GitHub**
3. Authorize Vercel
4. On the Vercel dashboard → Go to **Settings → Tokens**
5. Click **"Create Token"**
6. Name: `pulseapi-deploy`
7. Scope: **Full Account**
8. Click Create → **Copy the token immediately!**

📝 **Note down:**
```
Vercel Token: ___________________________
```

---

## STEP 6 — Create Supabase Account (5 min)
**Why:** Free cloud PostgreSQL database for storing monitor data.

1. Go to → https://supabase.com
2. Click **"Start your project"** → Sign in with GitHub
3. Click **"New Project"**
4. Name: `pu   lseapi`
5. Set a **database password** (write it down!)
6. Region: **South Asia (Mumbai)**
7. Click **"Create new project"** → Wait 2–3 min
8. Go to **Settings → Database**
9. Find **"Connection String"** → select **URI** tab → Copy it

📝 **Note down:**
```
Supabase Connection String: postgresql://postgres:<password>@<host>:5432/postgres
```

---

## STEP 7 — Fill In This Credentials Sheet

Once all steps above are done, fill this in and send it to me:

```
=== PulseAPI Credentials Sheet ===

GitHub Username:            samyak-wagh
GitHub Repo URL:            https://github.com/samyak-wagh/pulseapi

VM Provider:                ___________________________ (AWS Educate / Oracle / GCP / Hostinger)
VM1 (Jenkins) Public IP:    ___________________________
VM2 (App Server) Public IP: ___________________________ (same as VM1 if single server)
SSH Username:               ___________________________ (ubuntu OR root)

Docker Hub Username:        ___________________________
Docker Hub Password:        ___________________________

SonarCloud Token:           ___________________________
SonarCloud Organization:    ___________________________

Vercel Token:               ___________________________

Supabase Connection String: ___________________________
```

---

## ✅ Completion Checklist

- [ ] GitHub repository `pulseapi` created (Public)
- [ ] VM provider chosen (AWS Educate / Oracle / GCP / Hostinger)
- [ ] VM1 (Jenkins) created + Public IP noted
- [ ] VM2 (App Server) created + Public IP noted (skip if Hostinger single VM)
- [ ] Firewall ports opened: 22, 8080 (VM1), 3001 (VM2)
- [ ] SSH keys downloaded for both VMs
- [ ] Docker Hub account + `pulseapi-backend` repo created
- [ ] SonarCloud account + token generated
- [ ] Vercel account + token generated
- [ ] Supabase project + connection string copied
- [ ] Credentials sheet filled in ✅

---

> Once you complete all the above and share the credentials sheet,
> I will write ALL the code, configure the pipeline, and give you 
> step-by-step instructions to deploy everything! 🚀
