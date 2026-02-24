/**
 * Privacy-conscious, batched analytics for Aleph2Davening.
 * Events are queued locally and flushed to Supabase in batches.
 */
import { supabase } from './supabase';
import type { AnalyticsEvent } from '@/types';
import type { Database } from '@/types/database';

type EventInsert = Database['public']['Tables']['analytics_events']['Insert'];

// Session ID persists for the browser session
let sessionId = '';
if (typeof window !== 'undefined') {
  sessionId = sessionStorage.getItem('analytics_session_id') || crypto.randomUUID();
  sessionStorage.setItem('analytics_session_id', sessionId);
}

// Local event queue
const eventQueue: EventInsert[] = [];
const MAX_QUEUE_SIZE = 20;
const FLUSH_INTERVAL_MS = 30000; // Flush every 30 seconds
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Detect device type from user agent
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Get current user ID from Supabase auth
 */
async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
}

/**
 * Flush queued events to Supabase
 */
async function flushEvents() {
  if (eventQueue.length === 0) return;

  const eventsToFlush = [...eventQueue];
  eventQueue.length = 0; // Clear queue

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventsToFlush);

    if (error) {
      console.error('[analytics] Flush error:', error);
      // Re-queue failed events (up to max size to avoid infinite growth)
      if (eventQueue.length < MAX_QUEUE_SIZE) {
        eventQueue.unshift(...eventsToFlush.slice(0, MAX_QUEUE_SIZE - eventQueue.length));
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[analytics] Flushed ${eventsToFlush.length} events`);
      }
    }
  } catch (err) {
    console.error('[analytics] Flush exception:', err);
  }
}

/**
 * Schedule a flush
 */
function scheduleFlush() {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(() => {
    flushEvents();
  }, FLUSH_INTERVAL_MS);
}

/**
 * Track an analytics event
 */
export async function track(event: AnalyticsEvent): Promise<void> {
  try {
    const userId = await getCurrentUserId();

    const eventRow: EventInsert = {
      user_id: userId,
      session_id: sessionId,
      event_type: event.eventType,
      event_category: event.eventCategory,
      prayer_id: event.prayerId || null,
      section_id: event.sectionId || null,
      audio_source: event.audioSource || null,
      coaching_phase: event.coachingPhase || null,
      lesson_id: event.lessonId || null,
      service_id: event.serviceId || null,
      duration_seconds: event.durationSeconds || null,
      completion_percentage: event.completionPercentage || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      device_type: getDeviceType(),
    };

    eventQueue.push(eventRow);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[analytics]', event.eventType, event);
    }

    // Flush if queue is full
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      await flushEvents();
    } else {
      scheduleFlush();
    }

    // Also send to Vercel Analytics if available
    if (typeof window !== 'undefined' && 'va' in window) {
      (window as any).va('event', { name: event.eventType, ...event });
    }
  } catch (err) {
    // Silently ignore analytics errors
    console.error('[analytics] Track error:', err);
  }
}

/**
 * Manually flush events (call on app close, logout, etc.)
 */
export async function flushAnalytics(): Promise<void> {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
  await flushEvents();
}

// Flush on page unload (best effort)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Use sendBeacon for guaranteed delivery
    if (eventQueue.length > 0 && navigator.sendBeacon) {
      const payload = JSON.stringify(eventQueue);
      navigator.sendBeacon('/api/analytics/beacon', payload);
    }
  });
}
