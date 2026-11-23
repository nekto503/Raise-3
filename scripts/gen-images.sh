#!/bin/bash
# Background generation of AI assets for Slaide promo site
set -u
DIR="/home/z/my-project/public/images-src"
mkdir -p "$DIR"
cd "$DIR"

gen () {
  local name="$1"; local size="$2"; local prompt="$3"
  if [ -s "$name.png" ]; then echo "skip $name"; return 0; fi
  for i in 1 2 3; do
    if z-ai image -p "$prompt" -o "./$name.png" -s "$size" >/dev/null 2>&1; then
      echo "OK $name"; return 0
    fi
    echo "retry $name ($i)"; sleep 4
  done
  echo "FAIL $name"; return 1
}

gen drone 1344x768 "Cinematic photograph of a sleek white delivery drone carrying a small package, flying above a modern city at golden hour, soft pastel sky, shallow depth of field, premium tech aesthetic, photorealistic, no text, high quality"
gen growth 1344x768 "Abstract 3D render of glossy translucent bar chart sculpture rising diagonally, glass material with soft blue and amber gradient reflections, studio lighting, pure white seamless background, minimal premium composition, no text, high quality"
gen mars 1344x768 "Minimal artistic illustration of planet Mars landscape with soft dunes and a tiny astronaut silhouette, pastel peach and violet gradient sky, flat design with subtle grain, dreamy mood, no text, high quality"
gen wedding 1344x768 "Elegant wedding flat lay on cream silk fabric, white and blush pink roses, delicate blank paper cards, soft natural light, luxury minimalist styling, no text, high quality photography"
gen food 1344x768 "Top view flat lay of colorful buddha bowl with fresh vegetables on white marble table, soft studio lighting, pastel colors, minimal composition, no text, high quality food photography"
gen og 1440x720 "Premium 3D render of a glossy chrome torus sculpture floating among translucent glass cards, soft studio gradient light in blue pink and violet on pure white background, minimal futuristic composition, no text, high quality"

echo "DONE ALL"
