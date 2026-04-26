#!/bin/bash
# =============================================================
# VM1 (Jenkins) — SSH Key Setup for Ansible → VM2
# Run this on VM1 to create and authorize SSH key for VM2
# =============================================================
# This only needs to be done ONCE

set -e
echo "=== Setting up SSH key for Ansible → VM2 ==="

KEY_PATH="$HOME/.ssh/pulseapi_app.pem"

# Generate SSH key if it doesn't exist
if [ ! -f "$KEY_PATH" ]; then
    ssh-keygen -t rsa -b 4096 -f "$KEY_PATH" -N "" -C "pulseapi-ansible"
    echo "SSH key generated at: $KEY_PATH"
else
    echo "SSH key already exists at: $KEY_PATH"
fi

chmod 600 "$KEY_PATH"

echo ""
echo "======================================================="
echo "NEXT STEP: Copy the public key below and add it to VM2"
echo "======================================================="
echo ""
cat "${KEY_PATH}.pub"
echo ""
echo "To add this key to VM2, run on VM2:"
echo "  echo '<paste-key-above>' >> ~/.ssh/authorized_keys"
echo "  chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "OR from VM1 run (replace YOUR_VM2_IP):"
echo "  ssh-copy-id -i $KEY_PATH samyakwaghmare2210@YOUR_VM2_IP"
echo "======================================================="
