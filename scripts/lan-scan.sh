#!/bin/bash
source "$(dirname "$0")/log_tool.sh"
# lan-scan.sh - Detect new devices on 192.168.1.0/24 and alert via Telegram

BOT_TOKEN="8509775918:AAHO7gHlSoii_y7QAeo1N88-Len9PTvpj7c"
CHAT_ID="2124248322"

KNOWN_IPS=(
  192.168.1.1
  192.168.1.50
  192.168.1.59
  192.168.1.81
  192.168.1.82
  192.168.1.83
  192.168.1.84
  192.168.1.98
  192.168.1.99
  192.168.1.101
  192.168.1.102
  192.168.1.113
  192.168.1.114
  192.168.1.124
  192.168.1.137
  192.168.1.138
  192.168.1.141
  192.168.1.142
  192.168.1.144
  192.168.1.151
  192.168.1.154
  192.168.1.155
  192.168.1.173
  192.168.1.174
  192.168.1.175
  192.168.1.177
  192.168.1.182
  192.168.1.183
  192.168.1.184
  192.168.1.185
  192.168.1.186
  192.168.1.193
  192.168.1.209
  192.168.1.212
  192.168.1.72
  192.168.1.216
  192.168.1.219
  192.168.1.220
  192.168.1.226
  192.168.1.231
  192.168.1.233
  192.168.1.236
  192.168.1.238
  192.168.1.240
  192.168.1.241
  192.168.1.244
  192.168.1.253
  192.168.1.179  # Hermes agent server
  192.168.1.180  # kitten bal
  192.168.1.130  # solar camera
)

# Ping sweep to populate ARP table
for i in $(seq 1 254); do
  ping -c1 -W1 192.168.1.$i &>/dev/null &
done
wait

# Get active IPs from ARP (confirmed entries only)
ACTIVE=$(awk '$3 == "0x2" && $4 != "00:00:00:00:00:00" {print $1}' /proc/net/arp | sort -t. -k4 -n)

# Find unregistered devices
UNREGISTERED=""
echo "Scanning for unregistered LAN devices..."
echo ""

for ip in $ACTIVE; do
  is_known=false
  for known in "${KNOWN_IPS[@]}"; do
    [ "$ip" == "$known" ] && is_known=true && break
  done
  if [ "$is_known" == "false" ]; then
    MAC=$(awk -v ip="$ip" '$1 == ip {print $4}' /proc/net/arp)
    UNREGISTERED="${UNREGISTERED}${ip}  (${MAC})\n"
  fi
done

if [ -n "$UNREGISTERED" ]; then
  echo "⚠️ Unregistered device(s) found:"
  echo -e "$UNREGISTERED"
  
  # Also send Telegram alert
  MSG="⚠️ Unregistered device(s) on LAN:$(echo -e "\n$UNREGISTERED")"
  curl -s "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d "chat_id=${CHAT_ID}" \
    -d "text=${MSG}" \
    > /dev/null
else
  echo "✅ All active devices are registered."
fi
