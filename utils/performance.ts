// Performance monitoring utilities for production

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Only in production and if supported
    if (!import.meta.env.DEV && 'PerformanceObserver' in window) {
      try {
        // Measure navigation timing
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.metrics.set('loadTime', navEntry.loadEventEnd - navEntry.navigationStart);
              this.metrics.set('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Measure paint timing
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.metrics.set(entry.name, entry.startTime);
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Measure largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.set('largestContentfulPaint', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

      } catch (error) {
        console.warn('Performance monitoring setup failed:', error);
      }
    }
  }

  public measureStart(label: string): void {
    performance.mark(`${label}-start`);
  }

  public measureEnd(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    const duration = measure?.duration || 0;
    
    this.metrics.set(label, duration);
    return duration;
  }

  public getMetrics(): PerformanceMetrics {
    const loadTime = this.metrics.get('loadTime') || 0;
    const renderTime = this.metrics.get('first-contentful-paint') || 0;
    const interactionTime = this.metrics.get('largestContentfulPaint') || 0;
    
    let memoryUsage: number | undefined;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    return {
      loadTime,
      renderTime,
      interactionTime,
      memoryUsage
    };
  }

  public logMetrics(): void {
    if (import.meta.env.DEV) {
      console.table(Object.fromEntries(this.metrics));
    }
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const measureAsync = async <T>(
  label: string,
  asyncFn: () => Promise<T>
): Promise<T> => {
  performanceMonitor.measureStart(label);
  try {
    const result = await asyncFn();
    return result;
  } finally {
    performanceMonitor.measureEnd(label);
  }
};

export const measureSync = <T>(
  label: string,
  syncFn: () => T
): T => {
  performanceMonitor.measureStart(label);
  try {
    const result = syncFn();
    return result;
  } finally {
    performanceMonitor.measureEnd(label);
  }
};

// Web Vitals helper
export const reportWebVitals = (metric: any) => {
  if (import.meta.env.DEV) {
    console.log('Web Vital:', metric);
  }
  
  // In production, you could send this to analytics
  // Example: analytics.track('web-vital', metric);
};

export default performanceMonitor;