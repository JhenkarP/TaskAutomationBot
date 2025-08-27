// TaskAutomationBots/EmailAssistant/src/utils/calendarUtils.js
export function getEventsByDate(emails) {
  const eventsByDate = {};

  emails.forEach((email) => {
    if (!email.deadline) return;

    const date = new Date(email.deadline);
    if (isNaN(date)) return;

    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(email);
  });


  return eventsByDate;
}
