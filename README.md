# Event Management Dashboard

A modern, feature-rich event management dashboard built with React, featuring AI assistance, real-time updates, and a beautiful user interface.

## Features

### Core Features (Required)

- ✅ **Event Management**: Full CRUD operations for events
- ✅ **Attendee Management**: Add and remove attendees for events
- ✅ **Task Tracker**: Create and manage tasks with progress tracking
- ✅ **Responsive Design**: Works seamlessly on mobile and desktop
- ✅ **Form Validation**: Comprehensive validation for all forms

### Bonus Features (Implemented)

- ✅ **Authentication**: Secure login/logout system with JWT
- ✅ **Progress Indicators**: Visual progress bars showing task completion
- ✅ **Calendar View**: Beautiful calendar layout for viewing events
- ✅ **Real-time Updates**: WebSocket integration for live task updates
- ✅ **AI Assistant**: Intelligent chatbot to help manage events
- ✅ **Dark Mode**: Complete dark theme with smooth transitions
- ✅ **Event Cards**: Creative card-based event visualization with images

### Extra Premium Features

- 🎨 **Modern UI/UX**: Gradient designs, smooth animations, and micro-interactions
- 🖼️ **Dynamic Event Images**: Automatic image selection based on event type
- 🤖 **AI Chat Assistant**: OpenRouter AI integration for natural language event management
- 🎯 **Multiple Views**: Grid and calendar views for events
- 📊 **Task Progress Tracking**: Real-time progress calculation
- 🌓 **Theme Toggle**: Beautiful light/dark mode switcher
- 💫 **Premium Animations**: Smooth transitions and hover effects
- 🎭 **Event Categories**: Smart categorization with appropriate visuals

## Tech Stack

### Frontend

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Socket.io Client**: Real-time communication
- **Vite**: Next-generation frontend tooling

### Backend (Existing API)

- **Node.js & Express**: RESTful API
- **MongoDB**: Database
- **JWT**: Authentication
- **Socket.io**: WebSocket support

### AI Integration

- Optional OpenRouter integration can be added; current codebase does not require an AI key to run.

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Backend server running (see backend setup)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd <repo-name>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create `.env` in `event_frontend/` with your backend URL:

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Backend Setup (summary)

Make sure your backend server is running on `http://localhost:5000`. Key endpoints used by the frontend are below. See `event_backend/README.md` for full details.

#### User Routes (`/api/users`)

- `POST /register` — Register new user `{ name, email, password, role }`
- `POST /login` — Login `{ email, password }`
- `GET /me` — Get current user (auth required)
- `GET /` — List users (admin only)
- `PUT /profile` — Update current user `{ name?, password? }`
- `POST /` — Create user (admin only)

#### Event Routes (`/api/events`)

- `GET /` — Admin: all events, User: attending events
- `POST /` — Create event (admin only)
- `GET /:id` — View one (admin or attendee)
- `PUT /:id` — Update (admin only; not past events)
- `DELETE /:id` — Delete (admin only; not past events)
- `POST /:id/attendees` — Add attendee (admin only) `{ userId }`
- `DELETE /:id/attendees` — Remove attendee (admin only) `{ userId }`

#### Task Routes (`/api/tasks`)

- `POST /` — Create task (admin only) `{ name, deadline, eventId, assignedAttendeeId }`
- `GET /event/:eventId` — Admin: all tasks; User: only assigned
- `PUT /:id` — Update task status `{ status: "Pending"|"Completed" }`
- `GET /progress/:eventId` — Get `{ progress }` percent

## Usage Guide

### Getting Started

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Event**: Click "Create Event" button and fill in the details
3. **View Events**: Switch between grid and calendar views
4. **Manage Event**: Click on any event card to see details

### Event Management

- **Create**: Click "Create Event" and fill in name, description, location, and date
- **Edit**: Click "Edit" button on any event card
- **Delete**: Click "Delete" button (with confirmation)
- **View Details**: Click on event card to open detailed view

### Attendee Management

1. Open event details
2. Navigate to "Attendees" tab
3. Add or remove attendees from the list

### Task Management

1. Open event details
2. Navigate to "Tasks" tab
3. Click "Add Task" to create new tasks
4. Assign tasks to attendees
5. Click checkboxes to mark tasks as complete
6. View progress bar showing completion percentage

### AI Assistant

The UI includes an AI panel component. It works without external keys by default. If you add OpenRouter later, expose keys as needed and wire calls inside `AIAssistant.jsx`.

### Theme Toggle

- Click the sun/moon icon in the navigation to switch between light and dark modes
- Theme preference is saved in localStorage

## API Documentation

### Authentication

All authenticated endpoints require the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Example API Calls

**Register**

```javascript
POST /api/users/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Create Event**

```javascript
POST /api/events
Headers: { Authorization: "Bearer <token>" }
Body: {
  "name": "Annual Conference",
  "description": "Yearly team conference",
  "location": "Conference Hall A",
  "date": "2025-12-10T09:00:00.000Z"
}
```

**Create Task**

```javascript
POST /api/tasks
Headers: { Authorization: "Bearer <token>" }
Body: {
  "name": "Prepare presentation",
  "deadline": "2025-12-09T17:00:00.000Z",
  "eventId": "<event_id>",
  "assignedAttendeeId": "<user_id>"
}
```

## Features Showcase

### 1. Beautiful Event Cards

- Dynamic images based on event type
- Gradient overlays
- Hover effects with scale animations
- Status badges (Upcoming events)

### 2. Interactive Calendar

- Monthly view with navigation
- Events displayed on specific dates
- Click events to view details
- Color-coded event indicators

### 3. AI Assistant

- Natural language processing
- Context-aware responses
- Event management suggestions
- Smart intent recognition

### 4. Real-time Updates

- WebSocket connection for live updates
- Automatic task status synchronization
- Progress bar updates in real-time

### 5. Dark Mode

- Smooth theme transitions
- Complete dark theme coverage
- Persistent theme selection
- Optimized for OLED displays

## Project Structure

```
src/
├── components/
│   ├── AIAssistant.jsx
│   ├── AttendeeManager.jsx
│   ├── CalendarView.jsx
│   ├── EventCard.jsx
│   ├── EventDetailsModal.jsx
│   ├── EventModal.jsx
│   ├── Navbar.jsx
│   ├── ProfileDropdown.jsx
│   ├── AdminRoute.jsx
│   ├── ProtectedRoute.jsx
│   └── TaskManager.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── UserDashboard.jsx
│   ├── DashboardRedirect.jsx
│   └── UserManagementPage.jsx
├── utils/
│   ├── api.js
│   └── eventImages.js
├── App.jsx
├── main.jsx
└── index.css
```

## Design Philosophy

### Visual Design

- **Modern & Professional**: Clean, sophisticated interface suitable for business use
- **Attention to Detail**: Thoughtful spacing, typography, and color choices
- **Micro-interactions**: Subtle animations enhance user engagement
- **Accessible**: High contrast ratios and clear visual hierarchy

### User Experience

- **Intuitive Navigation**: Clear pathways to all features
- **Progressive Disclosure**: Complex features revealed contextually
- **Feedback**: Visual indicators for all user actions
- **Performance**: Optimized for fast loading and smooth interactions

### Color Palette

- **Primary**: Blue to Cyan gradients (professional, trustworthy)
- **Secondary**: Neutral grays (balanced, modern)
- **Accents**: Green (success), Red (delete), Purple (AI features)

## Performance Optimizations

- Component-level code splitting
- Optimized image loading
- Debounced search and filters
- Lazy loading for modals
- Efficient re-renders with proper React patterns

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Export events to calendar formats (iCal, Google Calendar)
- [ ] Email notifications for upcoming events
- [ ] Recurring events support
- [ ] File attachments for events
- [ ] Advanced filtering and search
- [ ] Drag-and-drop calendar interactions
- [ ] Mobile app version

## Scripts

From `event_frontend/`:
```bash
npm run dev       # start Vite dev server
npm run build     # build production bundle
npm run preview   # preview production build
npm run lint      # run eslint
```
