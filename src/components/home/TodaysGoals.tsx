'use client';

import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useBootcampStore } from '@/stores/bootcampStore';

export function TodaysGoals() {
  const profile = useUserStore((s) => s.profile);
  const todaySession = useUserStore((s) => s.todaySession);
  const isBootcampComplete = useBootcampStore((s) => s.isBootcampComplete);
  const bootcampEnrolled = useBootcampStore((s) => s.progress.enrolled);

  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = todaySession.date === today ? todaySession.minutesStudied : 0;
  const todayItems = todaySession.date === today ? todaySession.itemsReviewed : 0;

  const bootcampDone = isBootcampComplete();

  const quests = useMemo(() => {
    const q: { label: string; done: boolean }[] = [];
    q.push({
      label: `Study ${profile.dailyGoalMinutes} min`,
      done: todayMinutes >= profile.dailyGoalMinutes,
    });
    q.push({
      label: 'Practice 5 items',
      done: todayItems >= 5,
    });
    if (!bootcampDone && bootcampEnrolled) {
      q.push({ label: 'Bootcamp session', done: false });
    } else {
      q.push({ label: 'Review in Practice', done: todayItems >= 10 });
    }
    return q;
  }, [todayMinutes, todayItems, profile.dailyGoalMinutes, bootcampDone, bootcampEnrolled]);

  const questsDone = quests.filter((q) => q.done).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">
          Today&apos;s Goals
        </p>
        <span className="text-[11px] font-medium text-gray-300">
          {questsDone}/{quests.length}
        </span>
      </div>
      <div className="space-y-2">
        {quests.map((q, i) => (
          <div key={i} className="flex items-center gap-3 py-0.5">
            <div
              className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                q.done ? 'bg-success border-success' : 'border-gray-200'
              }`}
            >
              {q.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <span
              className={`text-[13px] ${
                q.done
                  ? 'text-gray-300 line-through'
                  : 'text-foreground font-medium'
              }`}
            >
              {q.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
