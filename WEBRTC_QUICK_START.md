# 🚀 WebRTC Quick Start (5 Minutes)

## Step 1: Get Free TURN Server (2 minutes)

1. Visit: **https://www.metered.ca/tools/openrelay/**
2. Click **"Get Free TURN Server Credentials"**
3. Copy the credentials shown

You'll see something like:
```
TURN URL: turn:a.relay.metered.ca:80
Username: 85e1234567890abcdef
Credential: xYz9876543210fedcba
```

---

## Step 2: Configure Backend (1 minute)

Edit `backend/.env`:
```env
# Add these lines (replace with your actual credentials)
VITE_STUN_URL=stun:stun.l.google.com:19302
VITE_TURN_URL=turn:a.relay.metered.ca:80
VITE_TURN_USER=85e1234567890abcdef
VITE_TURN_CRED=xYz9876543210fedcba
```

---

## Step 3: Configure Frontend (1 minute)

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000

# Add these lines (same credentials as backend)
VITE_STUN_URL=stun:stun.l.google.com:19302
VITE_TURN_URL=turn:a.relay.metered.ca:80
VITE_TURN_USER=85e1234567890abcdef
VITE_TURN_CRED=xYz9876543210fedcba
```

---

## Step 4: Restart Servers (1 minute)

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## Step 5: Test (1 minute)

### Quick Test in Browser Console

Open browser console (F12) and run:
```javascript
// Test ICE configuration
import { validateIceConfig, testIceServers } from './utils/webrtc';

// Check config
const validation = validateIceConfig();
console.log('Config:', validation);
// Should show: { hasStun: true, hasTurn: true, warnings: [], errors: [] }

// Test connectivity
const results = await testIceServers();
console.log('Test results:', results);
// Should show: { stun: true, turn: true, candidates: [...] }
```

### Real-World Test

**Option A: Same Network**
1. Open app on two devices on same WiFi
2. Login with different accounts
3. Join same room
4. Start a call
5. ✅ Should connect using STUN (direct)

**Option B: Different Networks**
1. Open app on device A (WiFi)
2. Open app on device B (mobile hotspot)
3. Login with different accounts
4. Join same room
5. Start a call
6. ✅ Should connect using TURN (relay)

---

## ✅ Success Indicators

### In Browser Console:
```
✅ Creating RTCPeerConnection with config: { iceServers: [...] }
✅ Got user media: { video: true, audio: true }
🔌 ICE connection state: connected
🔗 Connection state: connected
```

### In UI:
- ✅ Camera/microphone permissions granted
- ✅ Local video appears
- ✅ Remote video appears
- ✅ Audio works both ways
- ✅ No "connection failed" errors

---

## ⚠️ Troubleshooting

### "No TURN server configured" Warning
```bash
# Make sure you:
1. Added credentials to BOTH backend/.env AND frontend/.env
2. Restarted both servers
3. Cleared browser cache (Ctrl+Shift+Delete)
```

### "ICE connection failed"
```bash
# Check:
1. Credentials are correct (copy-paste from Metered.ca)
2. No typos in .env file
3. TURN server is online (check Metered.ca status)
```

### "Permission denied"
```bash
# Fix:
1. Click lock icon in address bar
2. Allow camera and microphone
3. Refresh page
```

---

## 📊 What's Happening Behind the Scenes?

### Without TURN (Localhost Only)
```
User A ←──────────────→ User B
     (direct connection)
```
✅ Works: Same network
❌ Fails: Different networks, firewalls

### With STUN (Most Cases)
```
User A ←→ STUN Server
          ↓ (discovers public IP)
User A ←──────────────→ User B
     (direct connection)
```
✅ Works: Different networks
❌ Fails: Restrictive firewalls

### With TURN (All Cases)
```
User A ←→ TURN Server ←→ User B
      (relays all traffic)
```
✅ Works: Always (even behind firewalls)
💰 Cost: Uses bandwidth

### With STUN + TURN (Best)
```
1. Try STUN (direct) first
2. If fails, use TURN (relay)
```
✅ Works: Always
💰 Cost: Only when needed

---

## 💡 Pro Tips

### Tip 1: Check Which Connection Type is Used
```javascript
pc.onicecandidate = (e) => {
  if (e.candidate) {
    console.log('Using:', e.candidate.type);
    // 'host' = local network
    // 'srflx' = STUN (direct)
    // 'relay' = TURN (relayed)
  }
};
```

### Tip 2: Monitor Bandwidth Usage
Free tier: 50 GB/month
- Video call (500 kbps): ~225 MB/hour
- Audio call (100 kbps): ~45 MB/hour

### Tip 3: Reduce Bandwidth
```javascript
// Lower video quality
const constraints = {
  video: {
    width: { max: 640 },
    height: { max: 480 },
    frameRate: { max: 15 },
  },
  audio: true,
};
```

---

## 🎯 Next Steps

1. ✅ **Done**: Basic WebRTC working
2. 📱 **Next**: Add CallUI component to Room page
3. 🎨 **Then**: Style call interface
4. 📊 **Finally**: Add analytics/monitoring

---

## 📚 Full Documentation

For detailed information, see:
- `WEBRTC_SETUP.md` - Complete setup guide
- `frontend/src/utils/webrtc.js` - WebRTC utilities
- `frontend/src/components/room/CallUI.jsx` - Call UI component

---

## 🆘 Need Help?

### Common Issues:

**"Module not found: webrtc"**
```bash
# The utils are already created, just import:
import { createPeerConnection } from './utils/webrtc';
```

**"Cannot read property 'getUserMedia'"**
```bash
# Must use HTTPS in production (HTTP only works on localhost)
# Or test on localhost
```

**"Bandwidth limit exceeded"**
```bash
# Free tier: 50 GB/month
# Solution: Upgrade or self-host TURN server
# See WEBRTC_SETUP.md for self-hosting guide
```

---

## ✅ Checklist

- [ ] Got TURN credentials from Metered.ca
- [ ] Added to backend/.env
- [ ] Added to frontend/.env
- [ ] Restarted both servers
- [ ] Tested on same network (works)
- [ ] Tested on different networks (works)
- [ ] Tested behind firewall (works)
- [ ] No console errors
- [ ] Video and audio working

**Status: Ready for production!** 🎉
