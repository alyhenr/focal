# Calendar Page - User Story

> **Vision**: A proactive planning tool that bridges scheduled commitments with focused execution, combining event management with historical focus session visualization.

---

## 🎯 Core Purpose

The Calendar page transforms Focal from a **reactive tracking tool** into a **proactive planning system**. Users can:
- Schedule future commitments (meetings, deadlines, reminders)
- Visualize past focus sessions at a glance
- Seamlessly convert events into focus sessions
- See patterns in their productivity over time

---

## 👤 User Personas

### Sarah - Freelance Designer
**Scenario**: Sarah has multiple client meetings, project deadlines, and personal commitments. She needs to see both what she's accomplished and what's coming up, all in one place.

**Pain Point**: Constantly switching between her calendar app (for meetings) and Focal (for focus tracking) feels disjointed.

**Solution**: Calendar page lets her plan her week, see her focus history, and quickly create focus blocks for upcoming commitments.

### Marcus - Product Manager
**Scenario**: Marcus has sprint deadlines, team meetings, and quarterly reviews. He wants to block focus time before important events.

**Pain Point**: Forgets to prepare for meetings until they're happening. No visual reminder to plan focus sessions.

**Solution**: Calendar shows his deadline 3 days ahead with a "Create Focus Block" button, prompting proactive planning.

---

## 🎨 Visual Design

### Calendar Grid Layout

```
┌─────────────────────────────────────────────────────────┐
│  📅 Calendar            [Oct 2025 ▾]      [Today]       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Sun    Mon    Tue    Wed    Thu    Fri    Sat        │
│ ─────  ─────  ─────  ─────  ─────  ─────  ─────       │
│   29     30     1      2      3      4      5          │
│         ●●     ●      ●●    ●●●                        │
│                       📌     🔔                         │
│                                                          │
│   6      7      8      9     10     11     12          │
│   ●     ●●●    ●●    [●]    📌           🤝           │
│                TODAY   ●                                │
│                      ●📅                                │
│                                                          │
│   13     14     15     16     17     18     19          │
│         📌            🔔     ●●                         │
│                                                          │
│   20     21     22     23     24     25     26          │
│                                                          │
└─────────────────────────────────────────────────────────┘

Legend:
  ● = Focus session (colored by energy level)
  📌 = Deadline
  🔔 = Reminder  
  🤝 = Meeting
  📅 = Multiple events (shows count on hover)
  [●] = Today (highlighted)
```

### Visual Indicators

**Past Days (Focus Sessions):**
- Small dots below the date number
- Colored by energy level:
  - 🟢 High energy → Bright green
  - 🟡 Medium energy → Amber/yellow
  - 🔴 Low energy → Soft red
- Multiple sessions = multiple dots (max 3 visible)
- Subtle, non-intrusive

**Future Days (Events):**
- Icon badges above/beside the date
- Different icons per event type:
  - 📌 Deadline (orange/red accent)
  - 🔔 Reminder (purple accent)
  - 🤝 Meeting (blue accent)
  - 📍 Appointment (teal accent)
- Multiple events = count badge (e.g., "📅 3")

**Today:**
- Highlighted with distinct border
- Slightly larger or different background
- Shows both past sessions (morning) + future events (afternoon)

---

## 🎬 User Flows

### Flow 1: Creating a Future Event

**Context**: User has a client meeting next week and wants to remember to prepare.

1. **Open Calendar**
   - User navigates to Calendar from sidebar or Cmd+K
   - Sees current month with past focus sessions as dots

2. **Select Future Date**
   - Clicks on "October 15" (one week away)
   - Day detail modal opens

3. **Add Event**
   - Clicks "+ Add Event" button in modal
   - New Event modal appears with form:
     - **Title**: "Client Presentation - Acme Corp"
     - **Type**: Meeting 🤝
     - **Date**: Oct 15, 2025
     - **Time**: 2:00 PM (optional)
     - **Duration**: 60 minutes (optional)
     - **Description**: "Q4 results review" (optional)

4. **Save Event**
   - Event appears on calendar as 🤝 badge on Oct 15
   - Modal closes automatically

5. **Dashboard Integration**
   - On October 15, Dashboard shows:
     ```
     📅 Today's Events
     • 2:00 PM - Client Presentation - Acme Corp
       [Create Focus Block]
     ```

6. **Create Focus Session**
   - User clicks "Create Focus Block" button
   - New Focus modal opens with pre-filled title
   - User sets energy level, adds checkpoints, starts session

---

### Flow 2: Reviewing Past Productivity

**Context**: User wants to see their focus patterns from last week.

1. **Navigate to Previous Week**
   - Clicks month dropdown, selects same month
   - Sees dots representing completed sessions

2. **Click Past Day**
   - Clicks on "October 3" (has 2 green dots)
   - Day detail modal opens showing:
     ```
     Wednesday, October 3, 2025
     
     🎯 Focus Sessions Completed
     ├─ 9:30 AM - Morning Deep Work
     │  High Energy • 2/2 checkpoints • 90 min
     │  Goal: Launch Product
     │
     └─ 2:15 PM - Afternoon Review  
        High Energy • 3/3 checkpoints • 50 min
        Goal: Launch Product
     
     [View Full Day in History]
     ```

3. **View More Details**
   - Clicks "View Full Day in History"
   - Navigates to History page filtered to Oct 3
   - Sees expandable list with full session details

---

### Flow 3: Planning Week Ahead

**Context**: Sunday evening, user wants to plan next week.

1. **Add Multiple Events**
   - Opens Calendar
   - Clicks Monday → Adds "Team Standup" (Meeting, 10:00 AM)
   - Clicks Tuesday → Adds "Feature Deadline" (Deadline, End of day)
   - Clicks Wednesday → Adds "Review PR" (Reminder, 3:00 PM)
   - Clicks Friday → Adds "Sprint Retro" (Meeting, 4:00 PM)

2. **Visual Overview**
   - Sees week with event badges on each day
   - Gets mental map of busy vs. free days

3. **Block Focus Time**
   - Notices Tuesday is busy with deadline
   - Clicks Tuesday morning (free time)
   - Creates "Prepare for Deadline" focus session for 9 AM

4. **Daily Integration**
   - Each morning, Dashboard shows today's events
   - User creates focus blocks as needed
   - Events get linked to focus sessions for context

---

### Flow 4: Converting Event to Focus

**Context**: User has a deadline today and wants to work on it.

1. **Dashboard Shows Event**
   ```
   📅 Today's Events
   • End of Day - Feature Deadline: Submit Report
     [Create Focus Block]
   ```

2. **Click Create Focus**
   - New Focus modal opens
   - **Title**: Pre-filled with "Feature Deadline: Submit Report"
   - **Linked Event**: Shown with link icon
   - **Suggested Goal**: If event has related keyword, suggests goal

3. **Start Session**
   - User adds checkpoints:
     - "Review data sources"
     - "Write executive summary"
     - "Create visualizations"
   - Starts focus session
   - Event in calendar shows "linked" indicator

4. **Complete Session**
   - User finishes session
   - Event automatically marked with completion indicator
   - Calendar shows both event badge + focus dot for that day

---

## 🛠️ Features Breakdown

### Essential Features (MVP)

#### 1. Calendar Grid
- **Month view** (default)
- **Day cells** with date numbers
- **Past day indicators**: Colored dots for focus sessions
- **Future day indicators**: Icon badges for events
- **Today highlight**: Clear visual distinction
- **Month/year navigation**: Previous/Next arrows + dropdown

#### 2. Event Management
- **Event Types**: Meeting, Deadline, Reminder, Appointment
- **Event Properties**: Title, type, date, time (optional), duration (optional), description (optional)
- **CRUD Operations**: Create, read, update, delete events
- **Color coding**: Different accent colors per event type

#### 3. Day Detail Modal
- **Trigger**: Click any day cell
- **Content**:
  - Day header (date, day of week)
  - Focus sessions list (if past/today)
  - Events list (if future/today)
  - Quick actions (Add Event, New Focus Session, View in History)
- **Layout**: Clean, scannable, action-oriented

#### 4. Dashboard Integration
- **Today's Events Section** on Dashboard
- Shows events for current day
- "Create Focus Block" button per event
- Pre-fills focus modal with event details

#### 5. Event-to-Focus Conversion
- **Quick action button** on each event
- **Pre-filled focus modal** with event title
- **Linked relationship** (event_id → focus_id)
- **Visual indicator** when event has linked focus session

### Nice-to-Have Features (Post-MVP)

#### 6. Week View Toggle
- Switch between Month and Week layouts
- Week view shows more detail per day
- Better for planning current week

#### 7. Event Recurrence
- Weekly standups
- Daily reminders
- Monthly reviews
- "Repeat every..." options

#### 8. Smart Suggestions
- "You have 3 events tomorrow. Block focus time?"
- "This deadline is in 2 days. Create a focus session?"
- "Busy week ahead. Plan your priorities?"

#### 9. Calendar Integration
- Import from Google Calendar (read-only initially)
- Sync with Outlook
- iCal export

#### 10. Time Blocking
- Drag-and-drop time blocks on calendar
- Visual "reserved focus time" blocks
- Prevent scheduling conflicts

---

## 🎨 Component Structure

```
src/app/(app)/calendar/
├── page.tsx                    # Server component, fetches data
└── loading.tsx                 # Loading skeleton

src/components/calendar/
├── calendar-grid.tsx           # Month view with cells
├── calendar-header.tsx         # Month/year navigation
├── calendar-cell.tsx           # Individual day cell
├── day-detail-modal.tsx        # Modal showing day's sessions + events
├── new-event-modal.tsx         # Create/edit event form
├── event-card.tsx              # Event display in modal
├── event-type-badge.tsx        # Icon badge for event type
├── focus-session-summary.tsx   # Compact session display in modal
└── create-focus-action.tsx     # "Create Focus Block" button

src/app/actions/
└── calendar.ts                 # Server actions for event CRUD
```

---

## 🗄️ Data Model

### Database Table: `calendar_events`

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting', 'deadline', 'reminder', 'appointment')),
  
  -- Timing
  event_date DATE NOT NULL,
  event_time TIME, -- NULL for all-day events
  duration INTEGER, -- minutes, NULL if not specified
  
  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Relationships
  linked_focus_id UUID REFERENCES focuses(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT events_user_date_idx UNIQUE (user_id, event_date, event_time, title)
);

-- Indexes for performance
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX idx_calendar_events_user_month ON calendar_events(user_id, DATE_TRUNC('month', event_date));

-- RLS Policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);
```

### Server Actions API

```typescript
// src/app/actions/calendar.ts

export async function getCalendarData(month: Date): Promise<CalendarData>
export async function createEvent(data: NewEventData): Promise<Event>
export async function updateEvent(id: string, data: Partial<Event>): Promise<Event>
export async function deleteEvent(id: string): Promise<void>
export async function getDayDetails(date: Date): Promise<DayDetails>
export async function linkEventToFocus(eventId: string, focusId: string): Promise<void>
export async function getTodayEvents(): Promise<Event[]>
```

---

## 📱 Mobile Considerations

### Responsive Design
- **Calendar Grid**: Scales to smaller screens, date numbers larger
- **Day Detail Modal**: Full-screen on mobile
- **Touch Interactions**: Tap to open, swipe to navigate months
- **Event Creation**: Bottom sheet on mobile (instead of centered modal)

### Mobile-Specific Features
- **Today Button**: Prominent, easy to tap
- **Quick Add**: FAB (Floating Action Button) for new event
- **Swipe Gestures**: Swipe left/right to change months

---

## 🎯 Success Metrics

### User Engagement
- **Adoption Rate**: % of users who create at least one event
- **Daily Active Events**: Average events created per active user per day
- **Event-to-Focus Conversion**: % of events that get converted to focus sessions
- **Calendar Visits**: Daily visits to Calendar page

### User Behavior
- **Planning Ahead**: Average days in future for events created
- **Event Types Distribution**: Which event types are most used?
- **Linked Sessions**: % of focus sessions linked to calendar events

### Feature Value
- **User Feedback**: NPS for Calendar feature
- **Retention Impact**: Do calendar users have better retention?
- **Dashboard Integration**: CTR on "Create Focus Block" from Dashboard

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Database schema + migration
- [ ] Server actions for CRUD
- [ ] Basic calendar grid component
- [ ] Fetch and display focus sessions as dots
- [ ] Month navigation

### Phase 2: Event Management (Week 1-2)
- [ ] New Event modal + form
- [ ] Event type selector
- [ ] Event display in day cells
- [ ] Edit/delete event functionality
- [ ] Day detail modal

### Phase 3: Integration (Week 2)
- [ ] Dashboard "Today's Events" section
- [ ] "Create Focus from Event" action
- [ ] Pre-fill focus modal from event
- [ ] Link event ↔ focus relationship

### Phase 4: Polish (Week 2)
- [ ] Premium styling consistency
- [ ] Empty states (no events, no sessions)
- [ ] Loading states and skeletons
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts (Cmd+E for new event)

---

## 🔮 Future Vision

The Calendar page is the foundation for several post-MVP features:
- **Time Blocking**: Visual blocks for focused work periods
- **Calendar Sync**: Import from external calendars
- **Smart Scheduling**: AI-suggested focus times
- **Recurring Events**: Automated event creation
- **Team Calendars**: Shared events for collaboration

---

**Last Updated**: October 8, 2025  
**Status**: Ready for implementation  
**Estimated Dev Time**: 6-8 hours  
**Priority**: High - Core planning feature



