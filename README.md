# Habits Tracker

A modern, responsive habit tracking application built with React, TypeScript, and Tailwind CSS. Track your daily habits, view progress statistics, and maintain streaks to build better habits.

## Features

### 🎯 Core Functionality
- **Add, Edit, and Delete Habits**: Create custom habits with titles, descriptions, categories, and targets
- **Daily Progress Tracking**: Mark habits as completed for any day
- **Streak Tracking**: Automatic calculation of current and longest streaks
- **Progress Visualization**: Visual progress bars and completion rates

### 📊 Statistics & Analytics
- **Overview Dashboard**: Total habits, completed today, average streak, and longest streak
- **Today's Progress**: Real-time completion rate for the current day
- **Top Performing Habits**: Ranked list of habits with the longest streaks
- **Category Distribution**: Breakdown of habits by category
- **Overall Statistics**: Total completions and average completions per habit

### 📅 Calendar View
- **Interactive Calendar**: Navigate through months and view habit completion history
- **Visual Indicators**: Color-coded dots showing completed habits for each day
- **Date Selection**: Click on any date to see completed habits for that day
- **Monthly Navigation**: Easy month-to-month navigation

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful Interface**: Clean, modern design with smooth animations
- **Color Coding**: Custom colors for each habit with visual indicators
- **Intuitive Navigation**: Easy switching between habits, calendar, and statistics views

### 💾 Data Persistence
- **Local Storage**: All data is automatically saved to browser's local storage
- **No Backend Required**: Works completely offline
- **Data Export**: Easy to backup and restore habit data

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API with useReducer
- **Data Storage**: Browser Local Storage
- **Build Tool**: Create React App
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository** (if you have the source code):
   ```bash
   git clone <repository-url>
   cd habits-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` folder, ready for deployment.

## Usage Guide

### Adding a New Habit

1. Click the "Add Habit" button in the header
2. Fill in the habit details:
   - **Title**: Name of your habit (required)
   - **Description**: Optional description of the habit
   - **Category**: Group your habits (e.g., Health, Learning, Productivity)
   - **Frequency**: Choose daily, weekly, or monthly
   - **Target**: Set your goal (e.g., 1 time, 30 minutes, 10 pages)
   - **Unit**: Specify the unit (times, minutes, pages, etc.)
   - **Color**: Choose a color to represent your habit
3. Click "Add Habit" to save

### Tracking Progress

- **Mark as Complete**: Click "Mark Complete" on any habit card to record completion for today
- **View Progress**: See your current streak, longest streak, and completion rate on each habit card
- **Edit Habits**: Click the edit icon to modify habit details
- **Delete Habits**: Click the delete icon to remove a habit (with confirmation)

### Using the Calendar

- **Navigate Months**: Use the arrow buttons to move between months
- **View Completions**: Days with completed habits show colored dots
- **Select Dates**: Click on any date to see which habits were completed on that day
- **Today's Date**: Highlighted with a special color

### Understanding Statistics

- **Overview Cards**: Quick glance at your overall progress
- **Today's Progress**: See how many habits you've completed today
- **Top Performers**: Habits with the longest current streaks
- **Category Breakdown**: Distribution of your habits by category
- **Overall Stats**: Total completions and averages

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Application header
│   ├── HabitForm.tsx   # Add/edit habit form
│   ├── HabitCard.tsx   # Individual habit display
│   ├── Calendar.tsx    # Calendar view component
│   └── Stats.tsx       # Statistics dashboard
├── context/            # React context
│   └── HabitContext.tsx # Habit state management
├── types/              # TypeScript type definitions
│   └── index.ts        # Interface definitions
├── utils/              # Utility functions
│   ├── storage.ts      # Local storage operations
│   └── dateUtils.ts    # Date manipulation functions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles
```

## Customization

### Adding New Features

The application is built with a modular architecture, making it easy to add new features:

1. **New Components**: Add new components in the `src/components/` directory
2. **New Views**: Add new navigation options in `App.tsx`
3. **New Statistics**: Extend the `Stats.tsx` component
4. **New Utilities**: Add helper functions in the `src/utils/` directory

### Styling Customization

The application uses Tailwind CSS for styling. You can customize:

- **Colors**: Modify the color palette in `tailwind.config.js`
- **Layout**: Adjust spacing and layout in component files
- **Animations**: Add custom animations in the Tailwind config

### Data Structure

The habit data structure is defined in `src/types/index.ts`:

```typescript
interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  unit: string;
  color: string;
  createdAt: string;
  completedDates: string[];
  streak: number;
  longestStreak: number;
}
```

## Browser Support

The application supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure you're using a supported browser
3. Try clearing your browser's local storage if data seems corrupted
4. Create an issue in the repository with detailed information

---

**Happy habit tracking! 🎯**
