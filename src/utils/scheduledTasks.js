import { checkAndRemoveExpiredSubscriptions } from '../services/riderService';

// Function to run periodic cleanup tasks
export const scheduleSubscriptionCleanup = () => {
  // Check for expired subscriptions immediately
  checkAndRemoveExpiredSubscriptions();
  
  // Then set up interval to check every 6 hours (in milliseconds)
  const interval = 6 * 60 * 60 * 1000;
  
  // Return the interval ID so it can be cleared if needed
  return setInterval(() => {
    checkAndRemoveExpiredSubscriptions();
  }, interval);
}; 