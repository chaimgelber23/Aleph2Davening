import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a navigation assistant for the Aleph2Davening app — a Jewish Hebrew learning and prayer app for beginners.

When the user describes what they're looking for, respond with the best matching route in the app.

APP ROUTES AND CONTENT:

/hebrew — Hebrew learning hub
/hebrew/letters — Learn all 22 Hebrew letters with audio (Aleph, Bet, Gimel, Dalet, Hei, Vav, Zayin, Chet, Tet, Yud, Chaf/Kaf, Lamed, Mem, Nun, Samech, Ayin, Pei/Fei, Tzadi, Kuf, Resh, Shin/Sin, Tav)
/hebrew/vowels — Learn Hebrew vowels / nekudot (Patach, Kamatz, Segol, Tzere, Chirik, Cholam, Kubutz, Shuruk, Shva, Chataf)
/hebrew/practice — Spaced repetition review drills for letters and vowels already learned
/hebrew/bootcamp — 5-day intensive Hebrew reading course overview
/hebrew/bootcamp/day/1 — Day 1: Letters Aleph through Hei, first sounds
/hebrew/bootcamp/day/2 — Day 2: Letters Vav through Yud, reading Baruch Atah
/hebrew/bootcamp/day/3 — Day 3: Letters Chaf through Pei, reading full bracha opening
/hebrew/bootcamp/day/4 — Day 4: Letters Tzadi through Tav, Modeh Ani prayer
/hebrew/bootcamp/day/5 — Day 5: Review all letters, Shema, Hamotzi blessing

/daven — Davening tab: prayer services and individual prayers
  Services available:
  - Weekday Shacharit (weekday morning service)
  - Weekday Mincha (weekday afternoon service)
  - Weekday Maariv (weekday evening service)
  - Kabbalat Shabbat (Friday night service, includes Lecha Dodi, Psalms)
  - Shabbat Shacharit & Musaf (Saturday morning service, includes Torah reading)
  Individual prayers in /daven:
  - Modeh Ani, Netilat Yadayim, Birchos HaShachar, Birchos HaTorah
  - Baruch She'amar, Hodu, Mizmor L'Todah, Ashrei, Az Yashir, Nishmat Kol Chai, Yishtabach
  - Barchu, Yotzer Or, El Adon, Ahavah Rabbah, Shema, V'ahavta, Emet V'Yatziv
  - Shemoneh Esrei / Amidah, Kedusha, Modim
  - Kaddish (Half Kaddish, Full Kaddish, Mourner's Kaddish / Kaddish Yatom, Kaddish D'Rabbanan)
  - Aleinu, Ein Kelokeinu, Adon Olam
  - Lecha Dodi, Vayechulu, Mizmor Shir L'Yom HaShabbat (Psalm 92), Bameh Madlikin
  - Yekum Purkan, Av HaRachamim, El Adon
  Lead Davening tab: step-by-step preparation to lead a minyan as Shaliach Tzibbur

/yahrzeit — Yahrzeit observance guide and all Kaddish types
  - Mourner's Kaddish (Kaddish Yatom) text, transliteration, audio
  - Half Kaddish, Full Kaddish, Kaddish D'Rabbanan
  - When and how to say Kaddish
  - Yahrzeit date observance practices and what to do on yahrzeit

/living — Daily Jewish living guides and brachot (blessings)
  Brachot (blessings before eating/drinking):
  - Hamotzi (bread blessing)
  - Mezonot (grain/pastry blessing)
  - Borei Pri Hagafen (wine/grape juice blessing)
  - Shehakol (drinks, most foods blessing)
  - Borei Pri HaAdama (vegetables blessing)
  - Borei Pri HaEtz (fruit blessing)
  - Al HaMichya (after-blessing for grain)
  - Birkat Hamazon (grace after meals, bentching)
  - 30+ Jewish living guides on various topics

/settings — User settings and preferences (nusach, audio speed, pronunciation, etc.)

ROUTING RULES:
- "Kaddish", "mourning", "yahrzeit", "yizkor", "for my father/mother/parent" → /yahrzeit
- "Shema", "amidah", "kaddish" as a prayer to learn → /daven
- "Letters", "aleph bet", "aleph-bet", "Hebrew alphabet", "read Hebrew" → /hebrew/letters
- "Vowels", "nekudot", "niqqud" → /hebrew/vowels
- "Practice", "review", "drill", "flashcard" → /hebrew/practice
- "Bootcamp", "5 day", "beginner course", "crash course" → /hebrew/bootcamp
- "Hamotzi", "bracha", "blessing before eating", "bread blessing" → /living
- "Lecha Dodi", "Friday night", "Kabbalat Shabbat" → /daven
- "Service", "davening", "follow along", "shacharit", "mincha", "maariv" → /daven
- "Lead davening", "shaliach tzibbur", "lead minyan" → /daven

Respond ONLY with valid JSON in this exact format, no other text:
{ "route": "/path", "title": "Short title (3-5 words)", "description": "One sentence: what they'll find and where.", "found": true }

If no match, respond:
{ "route": "/", "title": "Not sure", "description": "Try browsing Hebrew for learning, Daven for prayers, or Living for blessings.", "found": false }`;

interface ChatResult {
  route: string;
  title: string;
  description: string;
  found: boolean;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not configured. Add it to .env.local.' },
      { status: 500 }
    );
  }

  let message: string;
  try {
    const body = await req.json();
    message = String(body.message || '').trim().slice(0, 200);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0.1,
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    console.error('Groq error:', err);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }

  const data = await groqRes.json();
  let result: ChatResult;
  try {
    result = JSON.parse(data.choices[0].message.content) as ChatResult;
    // Validate the route starts with /
    if (!result.route || !result.route.startsWith('/')) {
      result.route = '/';
    }
  } catch {
    result = {
      route: '/',
      title: 'Try browsing',
      description: 'Explore Hebrew, Daven, Yahrzeit, or Living from the home screen.',
      found: false,
    };
  }

  return NextResponse.json(result);
}
