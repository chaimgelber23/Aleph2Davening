/**
 * Service Calendar Utility
 *
 * Determines which prayers and variations are said on any given day.
 * Handles Tachnun rules, Monday/Thursday additions, Rosh Chodesh, fast days, etc.
 */

import { HebrewCalendar, HDate, flags } from '@hebcal/core';

export interface ServiceVariation {
  hasTachnun: boolean;
  hasLongTachnun: boolean; // Monday & Thursday
  hasHallel: boolean;
  hallelType?: 'full' | 'half';
  hasYaalehVeyavo: boolean; // Rosh Chodesh / Yom Tov
  hasMussaf: boolean;
  isRoshChodesh: boolean;
  isFastDay: boolean;
  fastDayName?: string;
  specialOccasion?: string;
  notes: string[];
}

/**
 * Get today's service variations
 */
export function getTodaysServiceVariations(date: Date = new Date()): ServiceVariation {
  const hdate = new HDate(date);
  const variation: ServiceVariation = {
    hasTachnun: true, // Default: yes Tachnun
    hasLongTachnun: false,
    hasHallel: false,
    hasYaalehVeyavo: false,
    hasMussaf: false,
    isRoshChodesh: false,
    isFastDay: false,
    notes: [],
  };

  // Check if it's Rosh Chodesh
  if (hdate.getDate() === 1 || hdate.getDate() === 30) {
    variation.isRoshChodesh = true;
    variation.hasTachnun = false;
    variation.hasYaalehVeyavo = true;
    variation.hasMussaf = true;
    variation.hasHallel = true;
    variation.hallelType = 'half';
    variation.notes.push('Rosh Chodesh: Say Half Hallel, Mussaf, and Ya\'aleh V\'yavo');
  }

  // Check for holidays that skip Tachnun
  const holidays = HebrewCalendar.getHolidaysOnDate(hdate, false) || [];

  for (const holiday of holidays) {
    const holidayName = holiday.getDesc();

    // Chanukah
    if (holidayName.includes('Chanukah')) {
      variation.hasTachnun = false;
      variation.hasHallel = true;
      variation.hallelType = 'full';
      variation.notes.push('Chanukah: Full Hallel, no Tachnun');
    }

    // Purim
    if (holidayName.includes('Purim')) {
      variation.hasTachnun = false;
      variation.notes.push('Purim: No Tachnun');
    }

    // Tu B\'Shvat
    if (holidayName.includes('Tu BiShvat') || holidayName.includes('Tu B\'Shvat')) {
      variation.hasTachnun = false;
      variation.notes.push('Tu B\'Shvat: No Tachnun');
    }

    // Lag B\'Omer
    if (holidayName.includes('Lag B\'Omer') || holidayName.includes('Lag BaOmer')) {
      variation.hasTachnun = false;
      variation.notes.push('Lag B\'Omer: No Tachnun');
    }

    // Tu B\'Av
    if (holidayName.includes('Tu B\'Av')) {
      variation.hasTachnun = false;
      variation.notes.push('Tu B\'Av: No Tachnun');
    }

    // Fast Days
    if (holidayName.includes('Fast') || holidayName.includes('Tish\'a B\'Av') || holidayName.includes('Tisha B\'Av')) {
      variation.isFastDay = true;
      variation.fastDayName = holidayName;
      variation.hasTachnun = false; // Most fast days have special selichot instead
      variation.notes.push(`${holidayName}: Special prayers instead of Tachnun`);
    }

    // Rosh Hashana, Yom Kippur, Sukkot, Pesach, Shavuot
    if (
      holidayName.includes('Rosh Hashana') ||
      holidayName.includes('Yom Kippur') ||
      holidayName.includes('Sukkot') ||
      holidayName.includes('Pesach') ||
      holidayName.includes('Shavuot')
    ) {
      variation.hasTachnun = false;
      variation.hasYaalehVeyavo = true;
      variation.hasMussaf = true;
      variation.specialOccasion = holidayName;

      // Full Hallel on first days of Pesach and Sukkot, and Shavuot
      if (
        holidayName.includes('Shavuot') ||
        (holidayName.includes('Sukkot') && hdate.getDate() <= 2) ||
        (holidayName.includes('Pesach') && hdate.getDate() <= 2)
      ) {
        variation.hasHallel = true;
        variation.hallelType = 'full';
      }

      variation.notes.push(`${holidayName}: No Tachnun`);
    }
  }

  // Check Hebrew month for special occasions
  const hebrewMonth = hdate.getMonth();
  const hebrewDay = hdate.getDate();

  // Entire month of Nissan (no Tachnun)
  if (hebrewMonth === 1) {
    variation.hasTachnun = false;
    if (variation.notes.length === 0) {
      variation.notes.push('Month of Nissan: No Tachnun all month');
    }
  }

  // Sivan 1-6 (Shavuot period - no Tachnun)
  if (hebrewMonth === 3 && hebrewDay <= 6) {
    variation.hasTachnun = false;
    if (variation.notes.length === 0) {
      variation.notes.push('Leading up to Shavuot: No Tachnun');
    }
  }

  // Tishrei 1-8 (Rosh Hashana through Sukkot - no Tachnun)
  if (hebrewMonth === 7 && hebrewDay <= 8) {
    variation.hasTachnun = false;
    if (variation.notes.length === 0) {
      variation.notes.push('High Holiday season: No Tachnun');
    }
  }

  // Check day of week for Monday/Thursday long Tachnun
  const dayOfWeek = date.getDay();
  if (variation.hasTachnun && (dayOfWeek === 1 || dayOfWeek === 4)) {
    variation.hasLongTachnun = true;
    variation.notes.push('Monday/Thursday: Extended Tachnun with additional verses');
  }

  // If we have Tachnun but no special notes
  if (variation.hasTachnun && variation.notes.length === 0) {
    variation.notes.push('Regular weekday: Tachnun is recited');
  }

  return variation;
}

/**
 * Get human-readable explanation of today's service
 */
export function getTodaysServiceExplanation(date: Date = new Date()): string {
  const variation = getTodaysServiceVariations(date);
  const parts: string[] = [];

  if (variation.isRoshChodesh) {
    parts.push('Today is Rosh Chodesh.');
  }

  if (variation.isFastDay && variation.fastDayName) {
    parts.push(`Today is ${variation.fastDayName}.`);
  }

  if (variation.specialOccasion) {
    parts.push(`Today is ${variation.specialOccasion}.`);
  }

  if (variation.hasTachnun) {
    if (variation.hasLongTachnun) {
      parts.push('We say the longer version of Tachnun (Monday/Thursday).');
    } else {
      parts.push('We say Tachnun today.');
    }
  } else {
    parts.push('We do NOT say Tachnun today.');
  }

  if (variation.hasHallel) {
    parts.push(`We say ${variation.hallelType === 'full' ? 'Full' : 'Half'} Hallel.`);
  }

  if (variation.hasYaalehVeyavo) {
    parts.push('We add Ya\'aleh V\'yavo in the Amidah and Birkat Hamazon.');
  }

  if (variation.hasMussaf) {
    parts.push('We say Mussaf after Shacharit.');
  }

  return parts.join(' ');
}

/**
 * Get amud preparation notes for today
 */
export function getAmudPreparationNotes(date: Date = new Date()): string[] {
  const variation = getTodaysServiceVariations(date);
  const notes: string[] = [];

  notes.push('**Your role as Shaliach Tzibbur (Prayer Leader):**');
  notes.push('You will lead the congregation through the service. Speak clearly, not too fast, and wait for the congregation to respond at key points.');
  notes.push('');

  if (variation.isRoshChodesh) {
    notes.push('✓ **Rosh Chodesh today** - Add Ya\'aleh V\'yavo in the Amidah (during Modim)');
    notes.push('✓ Say Half Hallel after Shacharit');
    notes.push('✓ Lead Mussaf after the main service');
    notes.push('✓ Skip Tachnun');
    notes.push('');
  }

  if (variation.isFastDay) {
    notes.push(`✓ **Fast day: ${variation.fastDayName}** - Special prayers and Torah reading`);
    notes.push('✓ Selichot instead of Tachnun');
    notes.push('✓ Aneinu in the Amidah');
    notes.push('');
  }

  if (variation.hasTachnun) {
    if (variation.hasLongTachnun) {
      notes.push('✓ **Monday/Thursday** - Say the LONG Tachnun with extra verses (V\'hu Rachum...)');
    } else {
      notes.push('✓ Say Tachnun after the Amidah');
    }
  } else if (!variation.isRoshChodesh && !variation.isFastDay) {
    notes.push('✓ **Skip Tachnun today** - Go straight from Ashrei to Uva L\'Tzion');
  }

  if (variation.hasHallel) {
    notes.push(`✓ Say ${variation.hallelType === 'full' ? 'Full' : 'Half'} Hallel`);
  }

  notes.push('');
  notes.push('**Key moments to wait for the congregation:**');
  notes.push('• After Barechu (they respond)');
  notes.push('• During Kaddish (especially Y\'hei Sh\'mei Raba)');
  notes.push('• During Kedushah in the Amidah repetition (Kadosh, Kadosh, Kadosh)');
  notes.push('• After each Amen');

  return notes;
}
