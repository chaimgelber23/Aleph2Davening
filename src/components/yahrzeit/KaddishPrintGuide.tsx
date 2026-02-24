'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getService } from '@/lib/content/services';
import { getServicePrayer } from '@/lib/content/service-prayers';
import { KADDISH_IN_SERVICES, CONGREGATION_RESPONSE } from '@/lib/content/yahrzeit';

const SERVICES = ['weekday-shacharit', 'weekday-mincha', 'weekday-maariv'] as const;

const TYPE_LABELS: Record<string, string> = {
  half: 'Half Kaddish',
  full: 'Full Kaddish',
  mourners: 'Mourner\'s Kaddish',
  derabanan: 'Scholar\'s Kaddish',
};

export function KaddishPrintGuide({ onBack }: { onBack: () => void }) {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'weekday-shacharit',
    'weekday-mincha',
    'weekday-maariv',
  ]);

  const mournersPrayer = getServicePrayer('kaddish-mourners');

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      {/* Controls — hidden when printing */}
      <div className="no-print space-y-4 mb-6">
        <button
          onClick={onBack}
          className="text-sm text-[#5C4033]/60 hover:text-[#5C4033] transition-colors"
        >
          Back
        </button>

        <h2 className="text-xl font-bold text-foreground">Printable Service Guide</h2>
        <p className="text-sm text-gray-500">
          Select which services to include, then print or save as PDF.
        </p>

        <div className="flex gap-2">
          {SERVICES.map((id) => {
            const service = getService(id);
            if (!service) return null;
            const isSelected = selectedServices.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleService(id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#5C4033] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {service.name.replace('Weekday ', '')}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => window.print()}
          className="w-full py-3 rounded-xl bg-[#5C4033] text-white text-sm font-semibold hover:bg-[#4a3529] transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Printable content */}
      <div className="print-content space-y-8">
        {/* Title — print only shows without extra controls */}
        <div className="print-only hidden mb-4">
          <h1 className="text-xl font-bold">Yahrzeit Kaddish Guide</h1>
          <p className="text-sm text-gray-500">When to say Mourner's Kaddish in each service</p>
        </div>

        {/* Quick reference card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#5C4033]/5 rounded-2xl p-5 border border-[#5C4033]/10 prep-response print-color"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#5C4033] mb-2">
            Key Response — Say This During Every Kaddish
          </p>
          <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-2xl text-[#5C4033] leading-relaxed">
            {CONGREGATION_RESPONSE.hebrew}
          </p>
          <p className="text-sm text-[#5C4033]/70 italic mt-1">
            {CONGREGATION_RESPONSE.transliteration}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            &ldquo;{CONGREGATION_RESPONSE.translation}&rdquo;
          </p>
        </motion.div>

        {/* Service maps */}
        {selectedServices.map((serviceId) => {
          const serviceData = KADDISH_IN_SERVICES.find((s) => s.serviceId === serviceId);
          if (!serviceData) return null;

          return (
            <div key={serviceId} className="prep-segment">
              <div className="border-b border-gray-200 pb-2 mb-3">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {serviceData.service}
                  </h3>
                  <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-gray-400">
                    {serviceData.serviceHebrew}
                  </span>
                  <span className="text-xs text-gray-400">
                    {serviceData.timeOfDay} — ~{serviceData.estimatedMinutes} min
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {serviceData.occurrences.map((occ, j) => {
                  const isMourners = occ.type === 'mourners';
                  return (
                    <div
                      key={j}
                      className={`flex items-start gap-3 py-2 px-3 rounded-lg ${
                        isMourners
                          ? 'bg-[#5C4033]/5 border border-[#5C4033]/10 prep-response print-color'
                          : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isMourners && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C4033]">
                              You say this
                            </span>
                          )}
                          <span className="text-xs font-semibold text-gray-600">
                            {TYPE_LABELS[occ.type]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{occ.when}</p>
                        {occ.notes && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{occ.notes}</p>
                        )}
                        {isMourners && (
                          <p className="text-[10px] text-[#5C4033]/60 mt-1">
                            Stand. Say Kaddish. Take three steps back at the end and bow.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Full Mourner's Kaddish text */}
        {mournersPrayer && (
          <div className="prep-segment border-t border-gray-200 pt-4">
            <h3 className="text-base font-bold text-foreground mb-3">
              Mourner's Kaddish — Full Text
            </h3>
            <div className="space-y-3">
              {mournersPrayer.sections.map((section) => (
                <div key={section.id} className="space-y-0.5">
                  <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-lg text-[#1A1A2E] leading-[2]">
                    {section.hebrewText}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    {section.transliteration}
                  </p>
                  {section.amud?.congregationResponse && (
                    <p className="text-[10px] text-[#5C4033] font-medium">
                      Congregation responds: {section.amud.congregationResponseTransliteration || section.amud.congregationResponse}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
