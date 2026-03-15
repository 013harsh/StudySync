# 👥 Presence System - Visual Guide

## Before & After

### Before (No Presence)
```
┌─────────────────────────────────────┐
│ Members                             │
│ 0 online • 5 total                  │
├─────────────────────────────────────┤
│                                     │
│  [Avatar] John Doe                  │
│           Admin                     │
│                                     │
│  [Avatar] Jane Smith                │
│           Member                    │
│                                     │
│  [Avatar] Bob Wilson                │
│           Member                    │
│                                     │
└─────────────────────────────────────┘
```

### After (With Presence) ✅
```
┌─────────────────────────────────────┐
│ Members                             │
│ 3 online • 5 total                  │
├─────────────────────────────────────┤
│                                     │
│  🟢 [Avatar] John Doe      ●        │ ← Online (green bg)
│             Admin                   │
│                                     │
│  🟢 [Avatar] Jane Smith    ●        │ ← Online (green bg)
│             Member                  │
│                                     │
│  ⚪ [Avatar] Bob Wilson             │ ← Offline
│             Member                  │
│                                     │
│  🟢 [Avatar] Alice Brown   ●        │ ← Online (green bg)
│             Member                  │
│                                     │
│  ⚪ [Avatar] Charlie Davis          │ ← Offline
│             Member                  │
│                                     │
├─────────────────────────────────────┤
│ Active now              [3]         │ ← Success badge
└─────────────────────────────────────┘
```

## Real-Time Updates

### Scenario 1: User Joins
```
Time: 10:00:00
┌─────────────────────┐
│ Members             │
│ 2 online • 5 total  │
└─────────────────────┘

User "Alice" joins room...

Time: 10:00:01
┌─────────────────────┐
│ Members             │
│ 3 online • 5 total  │ ← Count updated
└─────────────────────┘

🟢 Alice's dot appears (animated pulse)
✨ Green background applied to Alice's card
```

### Scenario 2: User Leaves
```
Time: 10:05:00
┌─────────────────────┐
│ Members             │
│ 3 online • 5 total  │
└─────────────────────┘

User "Bob" clicks "Back to Dashboard"...

Time: 10:05:01
┌─────────────────────┐
│ Members             │
│ 2 online • 5 total  │ ← Count updated
└─────────────────────┘

⚪ Bob's dot turns grey
❌ Green background removed from Bob's card
```

### Scenario 3: Network Disconnect
```
Time: 10:10:00
┌─────────────────────┐
│ Members             │
│ 4 online • 5 total  │
└─────────────────────┘

User "Jane" loses internet connection...

Time: 10:10:05 (after socket timeout)
┌─────────────────────┐
│ Members             │
│ 3 online • 5 total  │ ← Count updated
└─────────────────────┘

⚪ Jane's dot turns grey automatically
```

## Member Card Anatomy

### Online Member Card
```
┌─────────────────────────────────────────┐
│  ┌─────┐                                │
│  │ 🟢  │  John Doe                      │
│  │ JD  │  Admin  ●                      │
│  └─────┘                                │
│    ↑      ↑       ↑                     │
│    │      │       └─ Green dot          │
│    │      └───────── Name & Role        │
│    └──────────────── Avatar + indicator │
│                                         │
│  Background: bg-success/10 (light green)│
└─────────────────────────────────────────┘
```

### Offline Member Card
```
┌─────────────────────────────────────────┐
│  ┌─────┐                                │
│  │ ⚪  │  Bob Wilson                    │
│  │ BW  │  Member                        │
│  └─────┘                                │
│    ↑      ↑                             │
│    │      └───────── Name & Role        │
│    └──────────────── Avatar + grey dot  │
│                                         │
│  Background: hover:bg-base-200 (normal) │
└─────────────────────────────────────────┘
```

## Socket Event Flow

### Join Flow
```
Frontend                Backend                 Other Clients
   │                       │                         │
   │──join-group(groupId)─>│                         │
   │                       │                         │
   │                       │──Add to roomPresence    │
   │                       │                         │
   │<─room:presence-update─│                         │
   │  { onlineUsers: [...] }                        │
   │                       │                         │
   │                       │──room:presence-update──>│
   │                       │  { onlineUsers: [...] } │
   │                       │                         │
   │──Update UI (green dot)│                         │
   │                       │                         │
   │                       │         Update UI (green dot)──│
```

### Leave Flow
```
Frontend                Backend                 Other Clients
   │                       │                         │
   │─leave-group({...})───>│                         │
   │                       │                         │
   │                       │──Remove from presence   │
   │                       │                         │
   │                       │──room:presence-update──>│
   │                       │  { onlineUsers: [...] } │
   │                       │                         │
   │                       │         Update UI (grey dot)──│
   │                       │                         │
   │──Navigate away        │                         │
```

## State Management

### Backend State
```javascript
// In-memory Map
roomPresence = {
  "group123": Set(["user1", "user2", "user3"]),
  "group456": Set(["user4", "user5"]),
}

// When user1 leaves group123:
roomPresence = {
  "group123": Set(["user2", "user3"]),  // ← Updated
  "group456": Set(["user4", "user5"]),
}
```

### Frontend State
```javascript
// Room.jsx
const [onlineUsers, setOnlineUsers] = useState([]);

// After receiving room:presence-update:
onlineUsers = ["user1", "user2", "user3"]

// MemberPanel checks:
members.map(member => {
  const isOnline = onlineUsers.includes(member.user._id);
  // Render green dot if isOnline === true
})
```

## Color Coding

### Online Indicators
- 🟢 **Green Dot**: `bg-success` with `animate-pulse`
- 💚 **Green Background**: `bg-success/10` (10% opacity)
- 🎯 **Success Badge**: `badge-success` in footer

### Offline Indicators
- ⚪ **Grey Dot**: `bg-base-300` (no animation)
- 🔲 **Normal Background**: `hover:bg-base-200`
- 📊 **Count Display**: Shows total members

## Responsive Behavior

### Desktop (w-64 = 256px)
```
┌──────────────────┐
│ Members          │
│ 3 online • 5 tot │
├──────────────────┤
│ 🟢 [Av] John Doe │
│        Admin  ●  │
│                  │
│ 🟢 [Av] Jane Sm  │
│        Member ●  │
└──────────────────┘
```

### Mobile (Full Width)
```
┌─────────────────────────────┐
│ Members                     │
│ 3 online • 5 total          │
├─────────────────────────────┤
│ 🟢 [Avatar] John Doe        │
│            Admin  ●         │
│                             │
│ 🟢 [Avatar] Jane Smith      │
│            Member ●         │
└─────────────────────────────┘
```

## Animation Details

### Green Dot Pulse
```css
/* Tailwind classes */
bg-success animate-pulse

/* Effect: Smooth fade in/out */
opacity: 1 → 0.5 → 1 (repeating)
duration: 2s
```

### Card Hover
```css
/* Offline cards only */
hover:bg-base-200

/* Smooth transition */
transition-colors
```

### Background Highlight
```css
/* Online cards */
bg-success/10

/* Subtle green tint */
rgba(success-color, 0.1)
```

## Testing Checklist

### Visual Tests
- [ ] Green dot appears for online users
- [ ] Grey dot appears for offline users
- [ ] Green background on online member cards
- [ ] Pulse animation on green dots
- [ ] Online count updates in header
- [ ] Active badge shows correct count in footer

### Functional Tests
- [ ] Dot turns green when user joins
- [ ] Dot turns grey when user leaves
- [ ] Dot turns grey when user disconnects
- [ ] Multiple users see same online status
- [ ] Count updates in real-time
- [ ] No duplicate users in online list

### Edge Cases
- [ ] User rejoins after leaving
- [ ] User refreshes page
- [ ] Network interruption and recovery
- [ ] Last user leaves (empty room)
- [ ] First user joins (empty → 1 online)

## Success Criteria ✅

When implementation is complete, you should see:

1. ✅ Real-time green/grey dots on member avatars
2. ✅ Accurate "X online • Y total" count
3. ✅ Green background highlight for online members
4. ✅ Smooth animations (pulse effect)
5. ✅ Instant updates when users join/leave
6. ✅ Automatic cleanup on disconnect
7. ✅ Success badge in footer showing active count

**Status: COMPLETE** 🎉
