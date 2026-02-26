#!/usr/bin/env bash
#
# Batch enhance all audio recordings in public/audio/
#
# What it does:
#   1. High-pass filter at 80Hz (removes room rumble)
#   2. Noise gate (cuts low-level background hiss)
#   3. Dynamic compression (even volume throughout)
#   4. EQ boost at 2-5kHz (vocal presence/clarity)
#   5. Peak normalize to -1dB (consistent loudness)
#   6. Output as high-quality MP3 (192kbps)
#
# Usage:
#   bash scripts/enhance-audio.sh              # Enhance ALL audio
#   bash scripts/enhance-audio.sh letters      # Only letters
#   bash scripts/enhance-audio.sh vowels       # Only vowels
#   bash scripts/enhance-audio.sh prayers      # Only prayers
#   bash scripts/enhance-audio.sh bootcamp     # Only bootcamp
#
# The originals are backed up to public/audio-originals/
#

set -euo pipefail

AUDIO_DIR="public/audio"
BACKUP_DIR="public/audio-originals"
FILTER=${1:-all}

# FFmpeg audio filter chain for pro-grade voice enhancement
ENHANCE_FILTER="highpass=f=80,
  agate=threshold=-40dB:ratio=3:attack=10:release=100,
  acompressor=threshold=-20dB:ratio=3:attack=5:release=50:makeup=2,
  equalizer=f=3000:t=q:w=1.5:g=3,
  equalizer=f=200:t=q:w=1:g=-2,
  loudnorm=I=-16:TP=-1:LRA=7"

# Remove whitespace from filter for ffmpeg
ENHANCE_FILTER=$(echo "$ENHANCE_FILTER" | tr -d ' \n')

count=0
skipped=0
errors=0

enhance_file() {
  local src="$1"
  local rel="${src#$AUDIO_DIR/}"
  local backup="$BACKUP_DIR/$rel"
  local tmp="${src}.tmp.mp3"

  # Skip if already backed up (already enhanced)
  if [ -f "$backup" ]; then
    skipped=$((skipped + 1))
    return
  fi

  # Create backup directory
  mkdir -p "$(dirname "$backup")"

  # Back up original
  cp "$src" "$backup"

  # Enhance
  if ffmpeg -y -i "$src" -af "$ENHANCE_FILTER" -codec:a libmp3lame -b:a 192k -ar 44100 "$tmp" -loglevel error 2>/dev/null; then
    mv "$tmp" "$src"
    count=$((count + 1))
    echo "  ✓ $rel"
  else
    # Restore original on error
    mv "$backup" "$src"
    rm -f "$tmp"
    errors=$((errors + 1))
    echo "  ✗ $rel (error, kept original)"
  fi
}

echo ""
echo "=== Audio Enhancement ==="
echo "Filter: $FILTER"
echo ""

# Process based on filter
process_dir() {
  local dir="$1"
  local label="$2"

  if [ ! -d "$dir" ]; then
    echo "Directory not found: $dir"
    return
  fi

  local file_count
  file_count=$(find "$dir" -name "*.mp3" -type f 2>/dev/null | wc -l)
  echo "--- $label ($file_count files) ---"

  find "$dir" -name "*.mp3" -type f | sort | while read -r file; do
    enhance_file "$file"
  done

  echo ""
}

case "$FILTER" in
  letters)
    process_dir "$AUDIO_DIR/letters" "Letters"
    ;;
  vowels)
    process_dir "$AUDIO_DIR/vowels" "Vowels"
    ;;
  prayers)
    process_dir "$AUDIO_DIR/prayers" "Prayers"
    ;;
  bootcamp)
    process_dir "$AUDIO_DIR/bootcamp" "Bootcamp"
    ;;
  words)
    process_dir "$AUDIO_DIR/words" "Words"
    ;;
  all)
    process_dir "$AUDIO_DIR/letters" "Letters"
    process_dir "$AUDIO_DIR/vowels" "Vowels"
    process_dir "$AUDIO_DIR/prayers" "Prayers"
    process_dir "$AUDIO_DIR/bootcamp" "Bootcamp"
    process_dir "$AUDIO_DIR/words" "Words"
    ;;
  *)
    echo "Unknown filter: $FILTER"
    echo "Use: all, letters, vowels, prayers, bootcamp, words"
    exit 1
    ;;
esac

echo "=== Done ==="
echo "Enhanced: $count files"
echo "Skipped (already done): $skipped files"
echo "Errors: $errors files"
echo "Originals backed up to: $BACKUP_DIR/"
echo ""
