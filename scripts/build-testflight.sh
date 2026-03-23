#!/bin/bash
set -e

# ── Configuration ────────────────────────────────────────────────────────────
SCHEME="SideProjectsNavigator"
WORKSPACE="ios/SideProjectsNavigator.xcworkspace"
CONFIGURATION="Release"
ARCHIVE_PATH="build/SideProjectsNavigator.xcarchive"
EXPORT_OPTIONS_PLIST="ios/ExportOptions.plist"
EXPORT_PATH="build/SideProjectsNavigator-ipa"

# ── Archive ──────────────────────────────────────────────────────────────────
echo "▶ Archiving $SCHEME …"
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -archivePath "$ARCHIVE_PATH" \
  CODE_SIGN_STYLE=Manual \
  | xcpretty || true

echo "✅ Archive created at $ARCHIVE_PATH"

# ── Export IPA ───────────────────────────────────────────────────────────────
echo "▶ Exporting IPA …"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PLIST" \
  -exportPath "$EXPORT_PATH" \
  | xcpretty || true

echo "✅ IPA exported to $EXPORT_PATH"
echo "🚀 Ready to upload to TestFlight via Xcode Organizer or Transporter."
