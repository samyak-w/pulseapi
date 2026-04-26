#!/bin/bash
# =============================================================
# VM2 (App Server) Setup Script
# Run this ONCE after SSH-ing into pulseapi-appserver
# =============================================================
# SSH into VM2 first:
#   ssh -i pulseapi_app.pem samyakwaghmare2210@YOUR_VM2_IP
# Then run: bash vm2_setup.sh
# =============================================================

set -e
echo "=== Setting up PulseAPI App Server ==="

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose

# Create app directory
mkdir -p ~/pulseapi

# Verify
echo ""
echo "=== Setup Complete ==="
docker --version
docker-compose --version
echo ""
echo "IMPORTANT: Log out and back in for docker group to take effect"
echo "  exit"
echo "  ssh -i pulseapi_app.pem samyakwaghmare2210@YOUR_VM2_IP"
echo ""
echo "VM2 IP: $(curl -s ifconfig.me)"
echo "=== VM2 Ready for Ansible deployment ==="
