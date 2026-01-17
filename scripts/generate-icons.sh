#!/bin/bash
# Generate PWA icons from SVG
# Requires: brew install librsvg (for rsvg-convert) or use online converter

# If you have rsvg-convert installed:
# rsvg-convert -w 192 -h 192 public/favicon.svg -o public/pwa-192x192.png
# rsvg-convert -w 512 -h 512 public/favicon.svg -o public/pwa-512x512.png
# rsvg-convert -w 180 -h 180 public/favicon.svg -o public/apple-touch-icon.png

echo "To generate PWA icons, you can:"
echo "1. Use an online SVG to PNG converter"
echo "2. Install librsvg: brew install librsvg"
echo "3. Use ImageMagick: brew install imagemagick"
echo ""
echo "Example with ImageMagick:"
echo "  convert -background none -resize 192x192 public/favicon.svg public/pwa-192x192.png"
echo "  convert -background none -resize 512x512 public/favicon.svg public/pwa-512x512.png"
echo "  convert -background none -resize 180x180 public/favicon.svg public/apple-touch-icon.png"
