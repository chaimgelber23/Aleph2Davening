"""
Test Chatterbox Multilingual voice cloning with SiddurAudio recordings.
Clones Rabbi Zimmerman's voice and generates Hebrew test samples.

Usage:
  REPLICATE_API_TOKEN=your_token python scripts/test-chatterbox.py
"""

import os
import sys
import replicate

# Load .env.local
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key not in os.environ:
                    os.environ[key] = val

token = os.environ.get('REPLICATE_API_TOKEN')
if not token:
    print("Missing REPLICATE_API_TOKEN. Set it in .env.local or as env var.")
    sys.exit(1)

# Reference audio — Rabbi Zimmerman from SiddurAudio
REFERENCE_AUDIO = os.path.join(
    os.path.dirname(__file__), '..', '..',
    'AlephDavening', 'public', 'audio', 'prayers',
    'birchos-hashachar', 'birchos-hashachar-sidduraudio.mp3'
)

if not os.path.exists(REFERENCE_AUDIO):
    print(f"Reference audio not found: {REFERENCE_AUDIO}")
    sys.exit(1)

# Test texts — Hebrew with nekudot
TESTS = [
    ("bracha", "בָּרוּךְ אַתָּה אֲדֹנָי אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן"),
    ("modeh-ani", "מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה רַבָּה אֱמוּנָתֶךָ"),
    ("shema", "שְׁמַע יִשְׂרָאֵל אֲדֹנָי אֱלֹקֵינוּ אֲדֹנָי אֶחָד"),
    ("aleph", "אָלֶף"),
    ("shin", "שִׁין"),
]

out_dir = os.path.join(os.path.dirname(__file__), '..', 'test-audio')
os.makedirs(out_dir, exist_ok=True)

print(f"\nCloning Rabbi Zimmerman's voice from SiddurAudio...")
print(f"Reference: {os.path.basename(REFERENCE_AUDIO)}")
print(f"Output: {out_dir}\n")

for name, text in TESTS:
    out_path = os.path.join(out_dir, f"{name}_chatterbox.wav")
    print(f"  🔊 {name}: {text}")

    try:
        with open(REFERENCE_AUDIO, 'rb') as audio_file:
            output = replicate.run(
                "resemble-ai/chatterbox-multilingual",
                input={
                    "text": text,
                    "language": "he",
                    "audio_prompt": audio_file,
                    "exaggeration": 0.3,
                    "temperature": 0.6,
                }
            )

        # output is a URL to the generated audio
        import urllib.request
        urllib.request.urlretrieve(str(output), out_path)
        size = os.path.getsize(out_path)
        print(f"  ✓ Saved: {out_path} ({size} bytes)")

    except Exception as e:
        print(f"  ✗ Error: {e}")

print(f"\nDone! Listen to the files in: {out_dir}")
print("Files ending in _chatterbox.wav are the cloned voice samples.\n")
