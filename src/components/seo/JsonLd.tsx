export function JsonLd() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aleph2davening.vercel.app';

  const schemas = [
    // WebApplication
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Aleph2Davening',
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      description: 'Free app to learn the Hebrew alphabet, read with vowels (nikud), master Jewish prayers with audio and transliteration, and navigate Jewish daily life.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Hebrew alphabet learning with audio',
        'Hebrew vowels (nikud/nekudot) with color coding',
        '5-day Hebrew reading bootcamp',
        'Spaced repetition practice drills',
        'Interactive siddur with audio for every prayer',
        'Multiple audio voices (AI + recorded)',
        'Transliteration and English translation for all prayers',
        'Step-by-step prayer coaching',
        'Auto-advance audio through prayer sections',
        'Yahrzeit guide and Kaddish with audio',
        'Brachot and Jewish daily living guides',
        'Weekday and Shabbat service roadmaps',
      ],
    },
    // EducationalOrganization
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Aleph2Davening',
      url: SITE_URL,
      description: 'Teaching Hebrew reading and Jewish prayer from the Aleph-Bet to leading the amud.',
    },
    // Course: Hebrew
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Learn to Read Hebrew',
      description: 'Learn the Hebrew alphabet (Aleph-Bet), vowels (nikud), and build reading fluency through interactive drills and a 5-day bootcamp.',
      provider: { '@type': 'Organization', name: 'Aleph2Davening' },
      url: `${SITE_URL}/hebrew`,
      isAccessibleForFree: true,
      educationalLevel: 'Beginner',
      inLanguage: ['en', 'he'],
    },
    // Course: Davening
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Learn to Daven (Jewish Prayer)',
      description: 'Master Jewish prayers with audio, transliteration, and coaching. Covers Modeh Ani, Shema, Amidah, and complete weekday and Shabbat services.',
      provider: { '@type': 'Organization', name: 'Aleph2Davening' },
      url: `${SITE_URL}/daven`,
      isAccessibleForFree: true,
      educationalLevel: 'Beginner',
      inLanguage: ['en', 'he'],
    },
    // FAQPage — great for AI and Google snippets
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How can I learn to read Hebrew as a beginner?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aleph2Davening teaches Hebrew reading from scratch. Start with the 5-day bootcamp to learn all Hebrew letters with audio, then master vowels (nikud) with color-coded drills, and build fluency through spaced repetition practice.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I learn to daven (pray in Hebrew)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use our interactive siddur with audio for every prayer. Each prayer has transliteration (romanized pronunciation), English translation, and a step-by-step coaching mode. Start with Modeh Ani and work through the daily service.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I say Kaddish?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Our Yahrzeit section includes the Mourner's Kaddish with audio recordings, transliteration, English translation, and a guide to when Kaddish is said during synagogue services.",
          },
        },
        {
          '@type': 'Question',
          name: 'What blessings (brachot) do I say before food?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our Jewish Living section covers all food blessings: Hamotzi for bread, Mezonot for grains, Ha\'etz for tree fruits, Ha\'adama for vegetables, and Shehakol for everything else. Each includes the Hebrew text, transliteration, and audio.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this app free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Aleph2Davening is completely free. All Hebrew lessons, prayer audio, transliteration, coaching, and guides are available at no cost.',
          },
        },
      ],
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
