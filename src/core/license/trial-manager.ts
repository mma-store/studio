
/**
 * @fileOverview Trial Period Manager for DUBSAR 2.0 Desktop.
 * Manages the 15-day offline trial period.
 */

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  startDate?: number;
  isExpired: boolean;
}

const TRIAL_DURATION_DAYS = 15;
const STORAGE_KEY = 'dubsar_trial_start';

export class TrialManager {
  /**
   * Checks the current trial status from local storage/SQLite.
   */
  static getStatus(): TrialStatus {
    if (typeof window === 'undefined') return { isActive: true, daysRemaining: 15, isExpired: false };

    let startTime = localStorage.getItem(STORAGE_KEY);
    
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(STORAGE_KEY, startTime);
    }

    const start = parseInt(startTime);
    const now = Date.now();
    const diffMs = now - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const remaining = Math.max(0, TRIAL_DURATION_DAYS - diffDays);
    const expired = remaining <= 0;

    return {
      isActive: !expired,
      daysRemaining: remaining,
      startDate: start,
      isExpired: expired
    };
  }

  /**
   * Resets the trial (System only).
   */
  static resetTrial() {
     localStorage.removeItem(STORAGE_KEY);
  }
}
