export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

export const getToday = () => {
  return formatDate(new Date());
};

export const getCurrentMonth = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
};

export const getDaysInMonth = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];

  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add days from next month to fill last week
  const lastDayOfWeek = lastDay.getDay();
  for (let day = 1; day <= 6 - lastDayOfWeek; day++) {
    days.push(new Date(year, month + 1, day));
  }

  return days;
};

export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isSameDate = (date1, date2) => {
  return date1 === date2;
};

export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

export const calculateStreak = (completedDates) => {
  if (completedDates.length === 0) return 0;

  const sortedDates = completedDates.sort().reverse();
  const today = getToday();
  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of sortedDates) {
    const date = new Date(dateStr);
    const diffTime = currentDate.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }

  return streak;
};

export const isFutureDate = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate > today;
};
