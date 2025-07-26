// Example of where to place this code in your application
// This assumes 'currentUser' is an object available in your application's scope
// after a user has logged in or their authentication state has been confirmed.

if (window?.Churnaizer && currentUser) {
  window.Churnaizer.track({
    user_id: currentUser.id,
    email: currentUser.email,
    plan: currentUser.plan,
    usage_score: currentUser.usage_score,
    support_tickets: currentUser.support_tickets_count
  }, "churn_live_abc123xyz"); // Make sure to use your actual API key here
}