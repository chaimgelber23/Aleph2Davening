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

  const mournerCount = serviceData?.occurrences.filter((o) => o.type === 'mourners').length ?? 0;
  const totalKaddish = serviceData?.occurrences.length ?? 0;

  return (
    <div>
      {/* On-screen controls only */}
      <div className="no-print space-y-4">
        <h2 className="text-base font-bold text-foreground">Printable Kaddish Guide</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Print a one-page reference card for a specific service. Bring it to shul so you know exactly when to stand and say your Kaddish.
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

      {/* ========================================
          PRINT-ONLY: hidden on screen, shown when printing.
          Sized to fit one page (US Letter / A4).
          ======================================== */}
      {serviceData && (
        <div className="kaddish-print-sheet">
          {/* Title */}
          <h1 style={{ fontSize: '16pt', fontWeight: 700, marginBottom: '2pt' }}>
            Kaddish Guide — {serviceData.service}
          </h1>
          <p style={{ fontSize: '9pt', color: '#666', marginBottom: '12pt' }}>
            {serviceData.timeOfDay} service — ~{serviceData.estimatedMinutes} minutes
            {' | '}{totalKaddish} Kaddish moments — you say Mourner&apos;s Kaddish {mournerCount} {mournerCount === 1 ? 'time' : 'times'}
          </p>

          {/* Quick reference box */}
          <div style={{ border: '1.5pt solid #5C4033', borderRadius: '6pt', padding: '8pt 10pt', marginBottom: '12pt', background: '#faf6f3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12pt' }}>
              <div>
                <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '1.5pt', fontWeight: 700, color: '#5C4033', marginBottom: '3pt' }}>
                  Your response — say this during every Kaddish
                </p>
                <p dir="rtl" style={{ fontFamily: 'var(--font-hebrew-serif), Noto Serif Hebrew, serif', fontSize: '14pt', color: '#1A1A2E', lineHeight: 1.6 }}>
                  {CONGREGATION_RESPONSE.hebrew}
                </p>
                <p style={{ fontSize: '8pt', color: '#666', fontStyle: 'italic' }}>
                  {CONGREGATION_RESPONSE.transliteration} — &ldquo;{CONGREGATION_RESPONSE.translation}&rdquo;
                </p>
              </div>
              <div style={{ borderLeft: '1pt solid #5C4033', paddingLeft: '10pt', minWidth: '140pt', flexShrink: 0 }}>
                <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '1.5pt', fontWeight: 700, color: '#5C4033', marginBottom: '3pt' }}>
                  At your Kaddish
                </p>
                <p style={{ fontSize: '8pt', color: '#333', lineHeight: 1.5 }}>
                  Stand up. Say the Mourner&apos;s Kaddish. At the end, take three steps back and bow — left, right, center.
                </p>
              </div>
            </div>
          </div>

          {/* Kaddish timeline */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '10pt' }}>
            <thead>
              <tr style={{ borderBottom: '1.5pt solid #333' }}>
                <th style={{ textAlign: 'left', padding: '3pt 6pt', fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5pt', color: '#666' }}>#</th>
                <th style={{ textAlign: 'left', padding: '3pt 6pt', fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5pt', color: '#666' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '3pt 6pt', fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5pt', color: '#666' }}>When</th>
                <th style={{ textAlign: 'left', padding: '3pt 6pt', fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5pt', color: '#666' }}>You</th>
              </tr>
            </thead>
            <tbody>
              {serviceData.occurrences.map((occ, j) => {
                const isMourners = occ.type === 'mourners';
                return (
                  <tr key={j} style={{ borderBottom: '0.5pt solid #ddd', background: isMourners ? '#f5ebe4' : 'transparent' }}>
                    <td style={{ padding: '4pt 6pt', color: '#999', fontWeight: 500 }}>{j + 1}</td>
                    <td style={{ padding: '4pt 6pt', fontWeight: isMourners ? 700 : 500, color: isMourners ? '#5C4033' : '#333' }}>
                      {TYPE_LABELS[occ.type]}
                    </td>
                    <td style={{ padding: '4pt 6pt', color: '#555' }}>{occ.when}</td>
                    <td style={{ padding: '4pt 6pt', fontWeight: 700, color: isMourners ? '#5C4033' : '#999' }}>
                      {isMourners ? 'YOU SAY' : 'Listen + Amen'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Full Mourner's Kaddish text — optional */}
          {showFullText && mournersPrayer && (
            <div style={{ borderTop: '1pt solid #ccc', paddingTop: '8pt' }}>
              <p style={{ fontSize: '10pt', fontWeight: 700, marginBottom: '6pt' }}>
                Mourner&apos;s Kaddish — Full Text
              </p>
              <div style={{ columnCount: 2, columnGap: '16pt' }}>
                {mournersPrayer.sections.map((section) => (
                  <div key={section.id} style={{ breakInside: 'avoid', marginBottom: '6pt' }}>
                    <p dir="rtl" style={{ fontFamily: 'var(--font-hebrew-serif), Noto Serif Hebrew, serif', fontSize: '10pt', color: '#1A1A2E', lineHeight: 1.7 }}>
                      {section.hebrewText}
                    </p>
                    <p style={{ fontSize: '7pt', color: '#888', fontStyle: 'italic', lineHeight: 1.3 }}>
                      {section.transliteration}
                    </p>
                    {section.amud?.congregationResponse && (
                      <p style={{ fontSize: '7pt', color: '#5C4033', fontWeight: 600 }}>
                        Cong: {section.amud.congregationResponseTransliteration || section.amud.congregationResponse}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <p style={{ fontSize: '7pt', color: '#aaa', marginTop: '8pt', textAlign: 'center' }}>
            Aleph2Davening — aleph2davening.com
          </p>
        </div>
      )}
    </div>
  );
}
