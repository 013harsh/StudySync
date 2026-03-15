# 🎥 WebRTC Production Setup Guide

## Goal
Make WebRTC work reliably outside localhost by configuring TURN/STUN servers.

---

## 📋 Table of Contents
1. [Understanding STUN vs TURN](#understanding-stun-vs-turn)
2. [Getting Free TURN Server](#getting-free-turn-server)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)
6. [Self-Hosting TURN Server](#self-hosting-turn-server)

---

## 🔍 Understanding STUN vs TURN

### STUN (Session Traversal Utilities for NAT)
- **Purpose**: Helps discover your public IP address
- **When it works**: Direct peer-to-peer connections (60-70% of cases)
- **Cost**: Free (public servers available)
- **Bandwidth**: No relay, minimal usage

**Example:**
```
User A (behind NAT) ←→ STUN Server
                    ↓
              Discovers public IP: 203.0.113.5
                    ↓
User A ←──────────────────────→ User B (direct connection)
```

### TURN (Traversal Using Relays around NAT)
- **Purpose**: Relays traffic when direct connection fails
- **When needed**: Restrictive firewalls, symmetric NATs (30-40% of cases)
- **Cost**: Paid or self-hosted (uses bandwidth)
- **Bandwidth**: All traffic goes through relay

**Example:**
```
User A (behind firewall) ←→ TURN Server ←→ User B (behind firewall)
                         (relays all traffic)
```

### Why You Need Both
- **STUN only**: Works for most users, but fails for ~30-40%
- **TURN only**: Works for everyone, but expensive (bandwidth costs)
- **STUN + TURN**: Best of both worlds (tries direct first, falls back to relay)

---

## 🆓 Getting Free TURN Server

### Option 1: Metered.ca (Recommended)
**Free Tier:** 50 GB/month bandwidth

1. Visit: https://www.metered.ca/tools/openrelay/
2. Click "Get Free TURN Server Credentials"
3. You'll receive:
   ```
   TURN URL: turn:a.relay.metered.ca:80
   Username: your-username-here
   Credential: your-credential-here
   ```

### Option 2: Xirsys
**Free Tier:** 500 MB/month bandwidth

1. Visit: https://xirsys.com/
2. Sign up for free account
3. Create a channel
4. Get credentials from dashboard

### Option 3: Twilio (Paid)
**Pricing:** Pay-as-you-go

1. Visit: https://www.twilio.com/stun-turn
2. Sign up and get API credentials
3. Use Twilio's API to generate temporary credentials

---

## ⚙️ Configuration

### Step 1: Backend Configuration

Add to `backend/.env`:
```env
# WebRTC Configuration
VITE_STUN_URL=stun:stun.l.google.com:19302
VITE_TURN_URL=turn:a.relay.metered.ca:80
VITE_TURN_USER=your-metered-username
VITE_TURN_CRED=your-metered-credential
```

### Step 2: Frontend Configuration

Add to `frontend/.env`:
```env
# API Configuration
VITE_API_URL=http://localhost:3000

# WebRTC Configuration
VITE_STUN_URL=stun:stun.l.google.com:19302
VITE_TURN_URL=turn:a.relay.metered.ca:80
VITE_TURN_USER=your-metered-username
VITE_TURN_CRED=your-metered-credential
```

### Step 3: Update .gitignore

Ensure `.env` is in `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.production
```

### Step 4: Use in Code

The configuration is automatically loaded by `frontend/src/utils/webrtc.js`:

```javascript
import { createPeerConnection } from './utils/webrtc';

// Creates peer connection with ICE servers from env
const pc = createPeerConnection();
```

---

## 🧪 Testing

### Test 1: Check Configuration

```javascript
import { validateIceConfig } from './utils/webrtc';

const validation = validateIceConfig();
console.log(validation);

// Expected output:
// {
//   hasStun: true,
//   hasTurn: true,
//   warnings: [],
//   errors: []
// }
```

### Test 2: Test ICE Server Connectivity

```javascript
import { testIceServers } from './utils/webrtc';

const results = await testIceServers();
console.log(results);

// Expected output:
// {
//   stun: true,  // STUN server working
//   turn: true,  // TURN server working
//   candidates: ['host', 'srflx', 'relay']
// }
```

### Test 3: Real-World Test

**Scenario 1: Same Network**
1. Open app on two devices on same WiFi
2. Start a call
3. Should use direct connection (STUN)
4. Check browser console: Look for `srflx` candidates

**Scenario 2: Different Networks**
1. Open app on device A (home WiFi)
2. Open app on device B (mobile hotspot)
3. Start a call
4. Should use TURN relay if direct fails
5. Check browser console: Look for `relay` candidates

**Scenario 3: Behind Corporate Firewall**
1. Open app on corporate network
2. Open app on home network
3. Start a call
4. Should use TURN relay
5. Check browser console: Look for `relay` candidates

### Test 4: Browser DevTools

Open Chrome DevTools → Console:
```javascript
// Check ICE connection state
pc.iceConnectionState  // Should be: 'connected' or 'completed'

// Check connection state
pc.connectionState  // Should be: 'connected'

// View ICE candidates
pc.onicecandidate = (e) => {
  if (e.candidate) {
    console.log('Candidate type:', e.candidate.type);
    // Types: 'host', 'srflx' (STUN), 'relay' (TURN)
  }
};
```

---

## 🐛 Troubleshooting

### Issue 1: "No TURN server configured" Warning

**Symptom:** Warning in console, calls fail behind firewalls

**Solution:**
1. Check `.env` file has all TURN variables
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Verify credentials are correct

### Issue 2: "ICE connection failed"

**Symptom:** Call connects but immediately disconnects

**Possible Causes:**
1. **Invalid TURN credentials**
   - Check username/credential are correct
   - Credentials may have expired (regenerate)

2. **TURN server down**
   - Test with different TURN server
   - Check Metered.ca status page

3. **Firewall blocking TURN ports**
   - Try TURN over TCP (port 80 or 443)
   - Use `turn:a.relay.metered.ca:443?transport=tcp`

### Issue 3: "User media access denied"

**Symptom:** Camera/microphone permission denied

**Solution:**
1. Check browser permissions (click lock icon in address bar)
2. Ensure HTTPS in production (HTTP only works on localhost)
3. Try different browser

### Issue 4: One-way audio/video

**Symptom:** User A can see/hear User B, but not vice versa

**Possible Causes:**
1. **Asymmetric NAT**
   - Force TURN relay: `iceTransportPolicy: 'relay'`

2. **Firewall rules**
   - Check both users can reach TURN server
   - Test with `telnet a.relay.metered.ca 80`

3. **Track not added**
   - Verify `pc.addTrack()` called for both audio and video

### Issue 5: High latency

**Symptom:** Noticeable delay in audio/video

**Possible Causes:**
1. **Using TURN when direct connection possible**
   - Check if STUN is configured correctly
   - Verify `iceTransportPolicy` is `'all'` not `'relay'`

2. **TURN server far away**
   - Use geographically closer TURN server
   - Metered.ca has servers in multiple regions

3. **Network congestion**
   - Check bandwidth usage
   - Reduce video quality

---

## 🔧 Advanced Configuration

### Multiple STUN Servers (Redundancy)

```env
VITE_STUN_URL=stun:stun.l.google.com:19302
VITE_STUN_URL_2=stun:stun1.l.google.com:19302
VITE_STUN_URL_3=stun:stun2.l.google.com:19302
```

### Multiple TURN Servers (Failover)

```javascript
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:a.relay.metered.ca:80',
      username: 'user1',
      credential: 'cred1',
    },
    {
      urls: 'turn:b.relay.metered.ca:80',
      username: 'user2',
      credential: 'cred2',
    },
  ],
};
```

### Force TURN Relay (Testing)

```javascript
const config = {
  iceServers: [...],
  iceTransportPolicy: 'relay', // Force TURN, skip STUN
};
```

### Increase ICE Candidate Pool

```javascript
const config = {
  iceServers: [...],
  iceCandidatePoolSize: 10, // Gather more candidates
};
```

---

## 🏠 Self-Hosting TURN Server

### Why Self-Host?
- **Cost**: No per-GB bandwidth fees
- **Privacy**: Full control over traffic
- **Reliability**: No third-party dependencies
- **Performance**: Deploy close to users

### Using Coturn (Open Source)

#### Step 1: Install Coturn

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install coturn
```

**CentOS/RHEL:**
```bash
sudo yum install coturn
```

#### Step 2: Configure Coturn

Edit `/etc/turnserver.conf`:
```conf
# Listening port
listening-port=3478

# TLS listening port (for secure connections)
tls-listening-port=5349

# External IP (your server's public IP)
external-ip=YOUR_SERVER_PUBLIC_IP

# Relay IP (usually same as external IP)
relay-ip=YOUR_SERVER_PUBLIC_IP

# Realm (your domain)
realm=yourdomain.com

# Authentication
lt-cred-mech
user=username:password

# Logging
log-file=/var/log/turnserver.log
verbose

# Security
fingerprint
no-multicast-peers
```

#### Step 3: Start Coturn

```bash
sudo systemctl enable coturn
sudo systemctl start coturn
sudo systemctl status coturn
```

#### Step 4: Open Firewall Ports

```bash
# UDP ports for TURN
sudo ufw allow 3478/udp
sudo ufw allow 49152:65535/udp

# TCP ports for TURN over TCP
sudo ufw allow 3478/tcp
sudo ufw allow 5349/tcp
```

#### Step 5: Test Your TURN Server

```bash
# Install turnutils
sudo apt install coturn-utils

# Test TURN server
turnutils_uclient -v -u username -w password YOUR_SERVER_IP
```

#### Step 6: Use in Your App

```env
VITE_TURN_URL=turn:YOUR_SERVER_IP:3478
VITE_TURN_USER=username
VITE_TURN_CRED=password
```

### Coturn with SSL/TLS

For production, use TLS:

1. Get SSL certificate (Let's Encrypt):
```bash
sudo certbot certonly --standalone -d turn.yourdomain.com
```

2. Update `turnserver.conf`:
```conf
tls-listening-port=5349
cert=/etc/letsencrypt/live/turn.yourdomain.com/cert.pem
pkey=/etc/letsencrypt/live/turn.yourdomain.com/privkey.pem
```

3. Use in app:
```env
VITE_TURN_URL=turns:turn.yourdomain.com:5349
```

---

## 📊 Monitoring & Analytics

### Track ICE Connection Types

```javascript
pc.onicecandidate = (event) => {
  if (event.candidate) {
    const type = event.candidate.type;
    
    // Log to analytics
    analytics.track('ICE Candidate', {
      type: type,
      protocol: event.candidate.protocol,
      address: event.candidate.address,
    });
    
    // Types:
    // - 'host': Local network
    // - 'srflx': STUN (direct connection)
    // - 'relay': TURN (relayed connection)
  }
};
```

### Monitor Bandwidth Usage

```javascript
setInterval(async () => {
  const stats = await pc.getStats();
  
  stats.forEach(report => {
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      console.log('Bandwidth:', {
        bytesSent: report.bytesSent,
        bytesReceived: report.bytesReceived,
        currentRoundTripTime: report.currentRoundTripTime,
      });
    }
  });
}, 1000);
```

---

## 💰 Cost Estimation

### Free Tier Limits

**Metered.ca:**
- 50 GB/month free
- ~100 hours of video calls (at 500 kbps)
- ~500 hours of audio calls (at 100 kbps)

**Xirsys:**
- 500 MB/month free
- ~1 hour of video calls
- ~5 hours of audio calls

### Paid Options

**Metered.ca:**
- $0.50 per GB after free tier
- 1000 GB = $500/month

**Twilio:**
- $0.40 per GB
- 1000 GB = $400/month

**Self-Hosted (Coturn):**
- Server: $5-20/month (DigitalOcean, AWS)
- Bandwidth: Usually included or cheap
- 1000 GB = $5-20/month

---

## ✅ Production Checklist

- [ ] STUN server configured
- [ ] TURN server configured with valid credentials
- [ ] Tested on different networks
- [ ] Tested behind corporate firewall
- [ ] SSL/TLS enabled for TURN (production)
- [ ] Monitoring/analytics in place
- [ ] Fallback to audio-only if video fails
- [ ] Error handling for permission denials
- [ ] Bandwidth usage tracking
- [ ] Cost monitoring (if using paid TURN)

---

## 📚 Additional Resources

- [WebRTC Glossary](https://webrtcglossary.com/)
- [Coturn Documentation](https://github.com/coturn/coturn/wiki)
- [Metered.ca Docs](https://www.metered.ca/docs/)
- [WebRTC Samples](https://webrtc.github.io/samples/)
- [ICE Candidate Types](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate/type)

---

## 🎉 Summary

You now have a production-ready WebRTC setup that:
- ✅ Works on localhost (STUN)
- ✅ Works across different networks (STUN)
- ✅ Works behind firewalls (TURN)
- ✅ Has proper error handling
- ✅ Is cost-effective (free tier)
- ✅ Is scalable (can self-host)

**Next Steps:**
1. Get free TURN credentials from Metered.ca
2. Add to `.env` files
3. Test with users on different networks
4. Monitor usage and costs
5. Consider self-hosting for scale
