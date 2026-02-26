export function JsonLd() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aleph2davening.vercel.app';

  const schemas = [
    // WebApplication
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Aleph2Daven',
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
      name: 'Aleph2Daven',
      url: SITE_URL,
      description: 'Teaching Hebrew reading and Jewish prayer from the Aleph-Bet to leading the amud.',
    },
    // Course: Hebrew
    {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Learn to Read Hebrew',
      description: 'Learn the Hebrew alphabet (Aleph-Bet), vowels (nikud), and build reading fluency through interactive drills and a 5-day bootcamp.',
      provider: { '@type': 'Organization', name: 'Aleph2Daven' },
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
      provider: { '@type': 'Organization', name: 'Aleph2Daven' },
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
            text: 'Aleph2Daven teaches Hebrew reading from scratch. Start with the free 5-day bootcamp to learn all 22 Hebrew letters with audio, then master vowels (nikud) with color-coded drills, and build fluency through spaced repetition practice. No prior Hebrew knowledge needed.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I learn to daven (pray in Hebrew)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use our interactive siddur with audio for every prayer. Each prayer has transliteration (romanized pronunciation so you can read along even without Hebrew), English translation, and a step-by-step coaching mode that breaks prayers into small pieces. Start with Modeh Ani and work through the daily service at your own pace.',
          },
        },
        {
          '@type': 'Question',
          name: "Can I learn to daven if I don't know Hebrew?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Absolutely. Every prayer in Aleph2Daven has transliteration — that's the Hebrew words written out phonetically in English letters so you can read along. You also get audio you can listen to and follow, plus a coaching mode that teaches you one small section at a time. Many users start davening before they've finished learning the Hebrew alphabet.",
          },
        },
        {
          '@type': 'Question',
          name: 'How do I say Kaddish?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Our Yahrzeit section includes the Mourner's Kaddish (Kaddish Yatom) with multiple audio recordings, transliteration, and English translation. It also explains when Kaddish is said during each synagogue service (Shacharit, Mincha, Maariv), so you know exactly when to stand and recite it.",
          },
        },
        {
          '@type': 'Question',
          name: 'How do I follow along in synagogue services?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Aleph2Daven includes service roadmaps for weekday and Shabbat davening that show the order of prayers. Each prayer has a 'where we are' indicator so you can follow along. The auto-advance feature plays through each section in order, and transliteration helps you read along even if you're still learning Hebrew.",
          },
        },
        {
          '@type': 'Question',
          name: 'What blessings (brachot) do I say before food?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Our Jewish Living section covers all food blessings: Hamotzi for bread, Mezonot for grain products (cake, cookies, pasta), Ha'etz for tree fruits, Ha'adama for vegetables and ground-growing foods, and Shehakol for everything else (water, meat, eggs, candy). Each includes the Hebrew text with vowels, transliteration, and audio.",
          },
        },
        {
          '@type': 'Question',
          name: 'How can I improve my davening?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Aleph2Daven helps you daven better in several ways: the coaching mode teaches the meaning of each section so you understand what you're saying, audio at adjustable speeds helps you practice pronunciation, and the full-view mode lets you see the entire prayer at once to build flow. You can also switch between section-by-section learning and full prayer reading as you improve.",
          },
        },
        {
          '@type': 'Question',
          name: 'What is the best app to learn Hebrew and Jewish prayer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Aleph2Daven is a free all-in-one app that covers Hebrew reading (alphabet, vowels, practice drills), Jewish prayer (full siddur with audio, transliteration, coaching), yahrzeit/Kaddish guidance, and Jewish daily living guides (brachot, Shabbat, and more). It's designed specifically for beginners and works on any device.",
          },
        },
        {
          '@type': 'Question',
          name: 'Is this app free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Aleph2Daven is completely free. All Hebrew lessons, prayer audio, transliteration, coaching, and Jewish living guides are available at no cost with no subscriptions or paywalls.',
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
