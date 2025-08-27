// TaskAutomationBots/EmailAssistant/src/utils/scoreUtils.js
export function calculateScore(email) {
  let score = 0;

  if (email.deadline) {
    const now = new Date();
    const deadlineDate = new Date(email.deadline);

    if (!isNaN(deadlineDate)) {
      const daysLeft = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

      if (daysLeft >= 0) {
        // Add score based on remaining days (less days left = more score)
        score += Math.max(0, 20 - daysLeft);
      }
      // If deadline already passed, score stays as is (no extra score)
    }
  }

  return score;
}
