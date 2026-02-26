#!/usr/bin/env bash
#
# Download Alex's recordings from Supabase, enhance with ffmpeg, place as MP3
#
# This downloads WAV files from the audio-uploads bucket,
# applies pro-grade audio enhancement, and outputs MP3 to public/audio/
#
# Usage:
#   bash scripts/download-and-enhance-alex.sh
#

set -euo pipefail

AUDIO_DIR="public/audio"
SUPABASE_URL="https://slmdeyhgdktigrsrevqc.supabase.co"
BUCKET="audio-uploads"

# Read service key from .env.local
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)

if [ -z "$SERVICE_KEY" ]; then
  echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
  exit 1
fi

# FFmpeg audio filter chain for pro-grade voice enhancement
ENHANCE_FILTER="highpass=f=80,agate=threshold=-40dB:ratio=3:attack=10:release=100,acompressor=threshold=-20dB:ratio=3:attack=5:release=50:makeup=2,equalizer=f=3000:t=q:w=1.5:g=3,equalizer=f=200:t=q:w=1:g=-2,loudnorm=I=-16:TP=-1:LRA=7"

# Check ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg not found. Install it first."
  exit 1
fi

count=0
errors=0

download_and_enhance() {
  local supabase_path="$1"   # e.g. "letters/shin.wav"
  local output_path="$2"     # e.g. "public/audio/letters/shin.mp3"
  local tmp_wav="/tmp/alex-$(echo "$supabase_path" | tr '/' '-')"
  local tmp_mp3="${output_path}.tmp.mp3"

  # Download from Supabase
  local url="${SUPABASE_URL}/storage/v1/object/audio-uploads/${supabase_path}"
  if ! curl -sf -o "$tmp_wav" "$url" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "apikey: ${SERVICE_KEY}"; then
    echo "  ✗ DOWNLOAD FAILED: $supabase_path"
    errors=$((errors + 1))
    return
  fi

  # Create output directory
  mkdir -p "$(dirname "$output_path")"

  # Enhance and convert to MP3
  if ffmpeg -y -i "$tmp_wav" -af "$ENHANCE_FILTER" -codec:a libmp3lame -b:a 192k -ar 44100 "$tmp_mp3" -loglevel error 2>/dev/null; then
    mv "$tmp_mp3" "$output_path"
    count=$((count + 1))
    local size=$(wc -c < "$output_path" | tr -d ' ')
    echo "  ✓ $output_path (${size} bytes)"
  else
    rm -f "$tmp_mp3"
    errors=$((errors + 1))
    echo "  ✗ ENHANCE FAILED: $supabase_path"
  fi

  rm -f "$tmp_wav"
}

echo ""
echo "=== Downloading & Enhancing Alex's Recordings ==="
echo ""

# ─── Letters ───
echo "--- Letters (31 files) ---"
LETTERS=(
  aleph ayin bet chaf chaf_sofit chet dalet fei fei_sofit gimel
  hei kaf kuf lamed mem mem_sofit nun nun_sofit pei resh
  samech shin sin tav tet tzadi tzadi_sofit vav vet yud zayin
)
for letter in "${LETTERS[@]}"; do
  download_and_enhance "letters/${letter}.wav" "${AUDIO_DIR}/letters/${letter}.mp3"
done

echo ""

# ─── Prayers ───
echo "--- Prayers ---"

# Modeh Ani (4 sections)
for i in 1 2 3 4; do
  download_and_enhance "prayers/modeh-ani/modeh-ani-${i}.wav" "${AUDIO_DIR}/prayers/modeh-ani/modeh-ani-${i}.mp3"
done

# Baruch She'amar (3 sections)
for i in 1 2 3; do
  download_and_enhance "prayers/baruch-sheamar/baruch-sheamar-${i}.wav" "${AUDIO_DIR}/prayers/baruch-sheamar/baruch-sheamar-${i}.mp3"
done

# Ashrei (3 sections)
download_and_enhance "prayers/ashrei/ashrei-intro-1.wav" "${AUDIO_DIR}/prayers/ashrei/ashrei-intro-1.mp3"
download_and_enhance "prayers/ashrei/ashrei-dalet-hei.wav" "${AUDIO_DIR}/prayers/ashrei/ashrei-dalet-hei.mp3"
download_and_enhance "prayers/ashrei/ashrei-poteach.wav" "${AUDIO_DIR}/prayers/ashrei/ashrei-poteach.mp3"

# Shema (1 section)
download_and_enhance "prayers/shema/shema-2.wav" "${AUDIO_DIR}/prayers/shema/shema-2.mp3"

echo ""
echo "=== Done ==="
echo "Enhanced: $count files"
echo "Errors: $errors files"
echo ""
