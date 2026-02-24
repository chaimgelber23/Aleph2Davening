'use client';

import { useState } from 'react';
import { getService } from '@/lib/content/services';
import { getServicePrayer } from '@/lib/content/service-prayers';
import { KADDISH_IN_SERVICES, CONGREGATION_RESPONSE } from '@/lib/content/yahrzeit';

const SERVICES = ['weekday-shacharit', 'weekday-mincha', 'weekday-maariv'] as const;

const TYPE_LABELS: Record<string, string> = {
  half: 'Half Kaddish',
  full: 'Full Kaddish',
  mourners: "Mourner's Kaddish",
  derabanan: "Scholar's Kaddish",
};

export function KaddishPrintGuide() {
  const [selectedService, setSelectedService] = useState<string>('weekday-shacharit');
  const [showFullText, setShowFullText] = useState(false);

  const mournersPrayer = getServicePrayer('kaddish-mourners');
  const serviceData = KADDISH_IN_SERVICES.find((s) => s.serviceId === selectedService);
  const service = getService(selectedService);

  const mournerCount = serviceData?.occurrences.filter((o) => o.type === 'mourners').length ?? 0;
  const totalKaddish = serviceData?.occurrences.length ?? 0;

  return (
    <div>
      {/* Controls — hidden when printing */}
      <div className="no-print space-y-4 mb-6">
        <h2 className="text-base font-bold text-foreground">Printable Kaddish Guide</h2>
        <p className="text-xs text-gray-500">
          Choose a service and print a one-page reference card to bring with you.
        </p>

        <div className="flex gap-2">
          {SERVICES.map((id) => {
            const svc = getService(id);
            if (!svc) return null;
            const isSelected = selectedService === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedService(id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#5C4033] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {svc.name.replace('Weekday ', '')}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showFullText}
            onChange={(e) => setShowFullText(e.target.checked)}
            className="rounded border-gray-300 text-[#5C4033] focus:ring-[#5C4033]"
          />
          Include full Mourner&apos;s Kaddish text
        </label>

        <button
          onClick={() => window.print()}
          className="w-full py-3 rounded-xl bg-[#5C4033] text-white text-sm font-semibold hover:bg-[#4a3529] transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Printable content — designed to fit on one page */}
      {serviceData && (
        <div className="print-content">
          {/* Print-only title */}
          <div className="print-only hidden mb-3">
            <h1 className="text-lg font-bold">Kaddish Guide — {serviceData.service}</h1>
          </div>

          {/* Service header with summary */}
          <div className="prep-segment border border-gray-200 rounded-xl p-4 mb-4">
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-foreground">{serviceData.service}</h3>
                <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-gray-400">
                  {serviceData.serviceHebrew}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {serviceData.timeOfDay} — ~{serviceData.estimatedMinutes} min
              </span>
            </div>
            <p className="text-xs text-[#5C4033] font-medium mb-3">
              {totalKaddish} total Kaddish moments — you say Mourner&apos;s Kaddish {mournerCount} {mournerCount === 1 ? 'time' : 'times'}
            </p>

            {/* Compact kaddish timeline */}
            <div className="space-y-1.5">
              {serviceData.occurrences.map((occ, j) => {
                const isMourners = occ.type === 'mourners';
                return (
                  <div
                    key={j}
                    className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs ${
                      isMourners
                        ? 'bg-[#5C4033]/8 border border-[#5C4033]/10 prep-response print-color'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isMourners ? 'bg-[#5C4033]' : 'bg-gray-300'}`} />
                    <span className={`font-semibold shrink-0 ${isMourners ? 'text-[#5C4033]' : 'text-gray-600'}`}>
                      {isMourners && 'YOU — '}{TYPE_LABELS[occ.type]}
                    </span>
                    <span className="text-gray-500">{occ.when}</span>
                    {isMourners && <span className="text-[#5C4033]/60 ml-auto shrink-0">Stand</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick reference */}
          <div className="prep-segment bg-gray-50 rounded-xl p-3 mb-4 prep-response print-color">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-1">
                  Respond during every Kaddish
                </p>
                <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-base text-[#1A1A2E] leading-relaxed">
                  {CONGREGATION_RESPONSE.hebrew}
                </p>
                <p className="text-[11px] text-gray-500 italic">
                  {CONGREGATION_RESPONSE.transliteration}
                </p>
              </div>
            </div>
          </div>

          {/* Full text — only if toggled */}
          {showFullText && mournersPrayer && (
            <div className="prep-segment border-t border-gray-200 pt-3">
              <h3 className="text-sm font-bold text-foreground mb-2">
                Mourner&apos;s Kaddish — Full Text
              </h3>
              <div className="space-y-2">
                {mournersPrayer.sections.map((section) => (
                  <div key={section.id} className="space-y-0">
                    <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-[#1A1A2E] leading-[1.8]">
                      {section.hebrewText}
                    </p>
                    <p className="text-[10px] text-gray-400 italic leading-tight">
                      {section.transliteration}
                    </p>
                    {section.amud?.congregationResponse && (
                      <p className="text-[9px] text-[#5C4033] font-medium">
                        Congregation: {section.amud.congregationResponseTransliteration || section.amud.congregationResponse}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer tip */}
          <p className="text-[10px] text-gray-400 mt-3 italic">
            At each Mourner&apos;s Kaddish: stand, recite the prayer, take three steps back at the end and bow left, right, center.
          </p>
        </div>
      )}
    </div>
  );
}
