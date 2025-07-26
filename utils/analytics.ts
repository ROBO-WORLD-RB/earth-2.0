// Privacy-friendly analytics utilities

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface UserSession {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
}

class PrivacyAnalytics {
  private session: UserSession;
  private readonly STORAGE_KEY = 'earth-analytics-session';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.session = this.initializeSession();
    this.setupActivityTracking();
  }

  private initializeSession(): UserSession {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        const now = Date.now();
        
        // Check if session is still valid
        if (now - session.lastActivity < this.SESSION_TIMEOUT) {
          session.lastActivity = now;
          return session;
        }
      }
    } catch (error) {
      console.warn('Failed to load analytics session:', error);
    }

    // Create new session
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      events: []
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupActivityTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateActivity();
      }
    });

    // Track user interactions
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.updateActivity();
      }, { passive: true });
    });

    // Save session periodically
    setInterval(() => {
      this.saveSession();
    }, 10000); // Every 10 seconds

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveSession();
    });
  }

  private updateActivity(): void {
    this.session.lastActivity = Date.now();
  }

  private saveSession(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.session));
    } catch (error) {
      console.warn('Failed to save analytics session:', error);
    }
  }

  // Public API
  public track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: properties || {},
      timestamp: Date.now()
    };

    this.session.events.push(event);
    this.updateActivity();

    // Keep only last 100 events to prevent storage bloat
    if (this.session.events.length > 100) {
      this.session.events = this.session.events.slice(-100);
    }

    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event);
    }
  }

  public getSessionStats(): {
    sessionDuration: number;
    eventCount: number;
    topEvents: Array<{ name: string; count: number }>;
  } {
    const sessionDuration = this.session.lastActivity - this.session.startTime;
    const eventCount = this.session.events.length;

    // Count event frequencies
    const eventCounts = new Map<string, number>();
    this.session.events.forEach(event => {
      eventCounts.set(event.name, (eventCounts.get(event.name) || 0) + 1);
    });

    const topEvents = Array.from(eventCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      sessionDuration,
      eventCount,
      topEvents
    };
  }

  public clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.session = this.initializeSession();
    } catch (error) {
      console.warn('Failed to clear analytics session:', error);
    }
  }
}

// Singleton instance
export const analytics = new PrivacyAnalytics();

// Convenience functions for common events
export const trackFeatureUsage = (featureName: string, action: string) => {
  analytics.track('feature_usage', {
    feature: featureName,
    action: action
  });
};

export const trackError = (error: Error, context?: string) => {
  analytics.track('error', {
    message: error.message,
    stack: error.stack?.substring(0, 500), // Limit stack trace length
    context: context || 'unknown'
  });
};

export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  analytics.track('performance', {
    metric,
    value,
    unit
  });
};

export const trackUserAction = (action: string, target?: string) => {
  analytics.track('user_action', {
    action,
    target: target || 'unknown'
  });
};

export default analytics;