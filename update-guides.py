#!/usr/bin/env python3
"""
Bulk update guides with beginner-friendly content
"""

# Map of guide IDs to their beginner content
BEGINNER_CONTENT = {
    'brachot-achronot': {
        'beginnerSummary': "Just like we say thank you before eating, we also say thank you after eating. It's a way to not take food for granted.",
        'beginnerWhy': "It's easy to eat and forget where the food came from. Saying a bracha after eating helps us remember to be grateful - not just before we enjoy something, but after too. It completes the circle of thanks.",
        'beginnerHow': 'After you finish eating, say a quick thank you to God. You can start in English: "Thank you God for the food I just ate." When you\'re ready, learn the Hebrew blessings - there\'s a short one (Borei Nefashot) for most foods, and a longer one (Birkat Hamazon) after bread meals.',
    },
    'asher-yatzar-guide': {
        'beginnerSummary': "After using the bathroom, Jews say a short prayer thanking God that our body works properly. It's a reminder that health is a gift.",
        'beginnerWhy': "Think about it - if your body didn't work right, you couldn't live. This prayer thanks God for the amazing design of the human body. Every time you use the bathroom, you're reminded that nothing is taken for granted.",
        'beginnerHow': 'After using the bathroom and washing your hands, say: "Thank you God for creating my body to work properly." When ready, learn the Hebrew prayer Asher Yatzar, which beautifully explains how our body is a miracle.',
    },
    'hair-and-nails': {
        'beginnerSummary': "Even simple things like cutting nails have Jewish customs. It's about bringing mindfulness to everyday actions.",
        'beginnerWhy': "Judaism teaches that everything we do can have meaning - even grooming. These customs remind us that we're not just bodies, but souls. Taking care of ourselves can be a spiritual act.",
        'beginnerHow': 'Start simple: many Jews cut their nails on Friday in honor of Shabbat. That\'s it! As you grow, you can learn more details like the traditional order. Don\'t stress about getting everything perfect at first.',
    },
    'shabbat-candles': {
        'beginnerSummary': "On Friday evening, Jews light candles to welcome Shabbat. It brings light, peace, and holiness into your home.",
        'beginnerWhy': "Lighting candles marks the transition from regular time to Shabbat - holy time. The moment you light them, Shabbat begins for you. It's one of the most beautiful Jewish rituals, traditionally done by women.",
        'beginnerHow': 'About 18 minutes before sunset on Friday, light at least 2 candles. After lighting, cover your eyes, say the blessing (you can start in English: "Thank you God for the mitzvah of Shabbat candles"), then uncover your eyes. Welcome Shabbat!',
    },
    'kiddush-guide': {
        'beginnerSummary': "Kiddush is a blessing said over wine or grape juice on Friday night and Shabbat day. It sanctifies Shabbat - declares it holy and special.",
        'beginnerWhy': 'The Torah says to "remember the Sabbath day to keep it holy." Kiddush is how we do that - we literally say out loud that Shabbat is different, sacred, set apart from the regular week.',
        'beginnerHow': 'Fill a cup with wine or grape juice. Say the blessing (Kiddush text is in any siddur). You can read it in English at first. Drink some, share with family. That\'s it! The blessing transforms regular time into holy time.',
    },
    'havdalah-guide': {
        'beginnerSummary': "Havdalah is a beautiful ceremony at the end of Shabbat (Saturday night). It uses wine, spices, and a special candle to say goodbye to Shabbat.",
        'beginnerWhy': "Shabbat is so special that we don't just let it end - we give it a proper sendoff. Havdalah means 'separation' - it marks the line between holy Shabbat and regular weekday time.",
        'beginnerHow': 'After Shabbat ends (when you can see 3 stars), gather wine, spices, and a candle. Say blessings over each (you can read in English), smell the spices, look at the candlelight. It\'s a multi-sensory goodbye to Shabbat.',
    },
    'kippah-guide': {
        'beginnerSummary': "A kippah (also called yarmulke) is a head covering that reminds us God is above us. Jewish men wear it during prayer, eating, and many wear it all day.",
        'beginnerWhy': "Covering your head cultivates humility and awareness of God. It's a physical reminder that there's something greater than us. It's also a visible sign of Jewish identity.",
        'beginnerHow': 'Get a kippah (any style works - knitted, velvet, whatever feels right). Wear it when you pray or eat. Many people start with just those times and gradually wear it more. There\'s no wrong way to begin.',
    },
    'tzitzit-guide': {
        'beginnerSummary': "Tzitzit are fringes on a special garment worn under your shirt. The Torah commands it as a reminder of God's commandments.",
        'beginnerWhy': 'The Torah says to look at the tzitzit and remember all of God\'s commandments. It\'s a wearable reminder to live with purpose and intention. Every time you see or feel them, you remember your connection to Judaism.',
        'beginnerHow': 'Get a tallit katan (the undershirt with fringes). Say a blessing when putting it on in the morning (you can say in English: "Thank you God for the mitzvah of tzitzit"). Wear it during the day. Start there.',
    },
    'mezuzah-guide': {
        'beginnerSummary': "A mezuzah is a small scroll with verses from the Torah, placed on doorposts of your home. It makes your home a Jewish space.",
        'beginnerWhy': 'The Torah commands us to write God\'s words on our doorposts. A mezuzah transforms your home - every time you pass through a doorway, you remember God\'s presence. Your house becomes a sanctuary.',
        'beginnerHow': 'Buy a kosher mezuzah scroll (from a Jewish bookstore or online). Put it on the right side of your main entrance doorway. Say the blessing (you can say in English: "Thank you God for the mitzvah of mezuzah"). Touch it when you pass by.',
    },
    'kashrut-basics': {
        'beginnerSummary': "Keeping kosher means following Jewish dietary laws - what we eat and how we eat it. It sanctifies the act of eating.",
        'beginnerWhy': "Food is necessary for life, but kashrut makes eating a spiritual act. By being mindful of what we eat, we connect every meal to our Jewish identity and values.",
        'beginnerHow': 'Start simple: Don\'t mix meat and dairy in the same meal. Look for kosher symbols (like OU) on packaged foods. Every step toward kosher is meaningful - you don\'t have to do everything at once.',
    },
}

def format_beginner_fields(content):
    """Format beginner fields as TypeScript code"""
    return f"""
    beginnerSummary:
      '{content['beginnerSummary']}',
    beginnerWhy:
      '{content['beginnerWhy']}',
    beginnerHow:
      '{content['beginnerHow']}',
"""

# Print the content for manual insertion
print("# Add these beginner fields to each guide:\n")
for guide_id, content in BEGINNER_CONTENT.items():
    print(f"\n## {guide_id}:")
    print(format_beginner_fields(content))
