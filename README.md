# Mevo Waitlist Site

Simple launch-ready static waitlist for **Mevo**.

## Files

- `index.html` — landing page
- `styles.css` — styling
- `script.js` — local waitlist capture (for demo)
- `assets/` — drop your branding images here

## Add your Twitter branding

Save the same images you used on X/Twitter as:

- `assets/mevo-profile.jpg` (profile image)
- `assets/mevo-header.jpg` (header/banner)

The site already references these file names.

## Important (email collection)

Current form stores emails in browser localStorage only (demo-safe).

To go live, connect a real form backend (choose one):

1. Formspree
2. ConvertKit
3. Mailchimp embedded form
4. Beehiiv

If you want, Clawdia can wire this to your chosen provider in 2 minutes.

## Deploy fast

### Netlify
- Drag/drop this folder into Netlify deploy UI

### Vercel
- `npm i -g vercel`
- `vercel`

### Cloudflare Pages
- Create new project > upload this folder

## Optional next improvements

- Add social proof logos
- Add countdown timer to launch date
- Add referral waitlist (invite friends to move up queue)
- Add analytics (Plausible/GA4)
