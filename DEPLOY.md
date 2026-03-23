# Deploying Side Projects Navigator to TestFlight

## Prerequisites

- **Apple Developer account** (paid, $99/year) at [developer.apple.com](https://developer.apple.com)
- **Distribution certificate** — create in Xcode → Settings → Accounts → Manage Certificates → "Apple Distribution"
- **App Store provisioning profile** — create at [developer.apple.com/account](https://developer.apple.com/account) → Certificates, Identifiers & Profiles
  - Type: App Store
  - App ID: matches your bundle identifier (e.g. `com.yourcompany.SideProjectsNavigator`)
  - Linked to your Distribution certificate
- **Xcode 15+** installed
- **CocoaPods** installed (`sudo gem install cocoapods`)
- Pods installed: `cd ios && pod install`

---

## Step 1 — Set Up Signing in Xcode

1. Open `ios/SideProjectsNavigator.xcworkspace` in Xcode
2. Select the `SideProjectsNavigator` target → **Signing & Capabilities**
3. Uncheck **Automatically manage signing**
4. Set **Team** to your Apple Developer team
5. Set **Bundle Identifier** (e.g. `com.yourcompany.SideProjectsNavigator`)
6. Under **Release**, select your App Store provisioning profile

---

## Step 2 — Fill in ExportOptions.plist

Edit `ios/ExportOptions.plist` and replace the placeholders:

| Key | Value |
|-----|-------|
| `teamID` | Your 10-character Apple Team ID (found at developer.apple.com/account) |
| `provisioningProfiles` key | Your app's bundle identifier |
| `provisioningProfiles` value | The exact name of your provisioning profile |

Example:
```xml
<key>teamID</key>
<string>ABC1234DEF</string>
<key>provisioningProfiles</key>
<dict>
    <key>com.yourcompany.SideProjectsNavigator</key>
    <string>Side Projects Navigator App Store</string>
</dict>
```

---

## Step 3 — Run the Build Script

```bash
# From the repo root
./scripts/build-testflight.sh
```

The script will:
1. Archive the app → `build/SideProjectsNavigator.xcarchive`
2. Export an IPA → `build/SideProjectsNavigator-ipa/`

> **Note:** `xcpretty` makes output readable. Install with `gem install xcpretty` (optional — the script runs without it).

---

## Step 4 — Upload to TestFlight

### Option A — Xcode Organizer (recommended)

1. Open Xcode → **Window → Organizer**
2. Select your archive under **Archives**
3. Click **Distribute App** → **App Store Connect** → **Upload**
4. Follow the wizard — it validates and uploads automatically

### Option B — Transporter

1. Download **Transporter** from the Mac App Store
2. Open Transporter, sign in with your Apple ID
3. Drag your `.ipa` file from `build/SideProjectsNavigator-ipa/` into Transporter
4. Click **Deliver**

### After Upload

- Go to [App Store Connect](https://appstoreconnect.apple.com) → Your App → **TestFlight**
- Wait for processing (~5–15 minutes)
- Add internal or external testers
- Send invites

---

## Deep Link URL Scheme

Side Projects Navigator supports the custom URL scheme `sideprojects://` for launching directly to a project URL.

**Format:**
```
sideprojects://open?url=<percent-encoded-url>
```

**Example:**
```
sideprojects://open?url=https%3A%2F%2Fgithub.com%2Fai-no01-lou
```

This opens the app and navigates the WebView to `https://github.com/ai-no01-lou`.

---

## Example Apple Shortcut

You can create a Shortcut to open any link in Side Projects Navigator:

1. Open the **Shortcuts** app → tap **+** to create a new shortcut
2. Add action: **Text** → enter a URL (or use a variable/clipboard)
3. Add action: **URL** → set to:
   ```
   sideprojects://open?url=[URL from previous step, URL-encoded]
   ```
4. Add action: **Open URLs**
5. Name the shortcut "Open in Side Projects"

**Tip:** Add a **Encode URL** action between the Text and URL steps to handle special characters automatically. In Shortcuts, use **URL Encode** with the text input before building the `sideprojects://open?url=` string.

You can also add this shortcut to your Home Screen or share it with testers.
