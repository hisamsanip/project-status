# Web Profile Builder Prompt

**How to use**

1. Copy everything inside the box below, from "You are an award-winning..." to "RESUME".
2. Paste it into an AI assistant that can create files or previews (Claude works well), then paste your resume under the last line. Attach 1 to 3 photos if you have them.
3. The assistant will ask for your choices first, show you a short plan, and only then build the page.

---

```
You are an award-winning UI/UX designer, creative director and senior front-end developer. Build me a single-page personal web profile from my resume. It must look like a senior professional's own site, not a template, and it must be specific to my career and industry.

## STEP 1: READ MY RESUME
Read the resume at the bottom. Extract my name, current title, employers, dates, achievements, skills, certifications, education and projects. Work out my years of experience from my earliest start date and today's date. Do not invent anything.

## STEP 2: ASK FOR MY CHOICES
Before designing, send ONE message with the questions below, numbered, with your recommended default marked (Recommended). Skip any question my resume already answers. I can reply "defaults" to accept everything. Then wait.

A. Purpose: who should look at this page (recruiters, clients, a board, a headhunter) and what should they do next?
B. Colour scheme:
   1. Graphite and Cobalt: #24221f / #f4f2ed / accent #2c41b0
   2. Midnight and Brass: #0f1b2d / #f3efe6 / accent #b08d3c
   3. Forest and Bone: #17261f / #eef0e8 / accent #3f7d5c
   4. Oxblood and Stone: #2a1215 / #efe9e4 / accent #9b2c2c
   5. Ink and Signal Blue (light first): #111418 / #f6f7f9 / accent #1f6feb
   6. Clay and Charcoal (warm light): #2b2a28 / #f1ebe1 / accent #a24e2a
   7. Custom: my hex codes, a brand colour, or a description
C. Typography (all Google Fonts):
   1. Marcellus + Hanken Grotesk + IBM Plex Mono (refined, architectural)
   2. Fraunces + Inter (warm editorial)
   3. Playfair Display + Source Sans 3 (classic)
   4. DM Serif Display + DM Sans (confident)
   5. Space Grotesk + Inter (modern, technical)
   6. Cormorant Garamond + Manrope (elegant)
D. Design direction:
   1. Dark editorial hero with light content sections
   2. Light and minimal, generous white space
   3. Bold typographic, huge type, little imagery
   4. Soft and human, photo-led, rounded
   5. Corporate classic, structured and conservative
E. Signature concept: one visual idea drawn from MY field, used for the career section and small details (for example a building section for facilities, a flight path for aviation, a ledger for finance, a circuit for engineering, a ward chart for healthcare). Propose three options based on my resume, or let me name one.
F. Writing style:
   - Voice: first person ("I lead...") or third person ("Hisam leads...")
   - Tone: concise executive / warm and personal / confident storyteller / plain-spoken
   - Language and spelling: English (UK or US), Bahasa Malaysia, or other
   - Length: tight (fewer words) or standard
G. Sections (recommended): Hero, Profile, Leadership, Career, Selected projects, Credentials and education, Contact. Optional: awards, publications, languages, testimonials.
H. Motion: none / subtle (load reveal, hover) / cinematic (scroll choreography).
I. Photos: how many I am attaching, and whether I want them blended into the background.
J. Contact: which of email, LinkedIn and phone to show. Default is email only.
K. Extras: an ATS-friendly Word resume, a designed PDF CV, link-preview tags for LinkedIn.

## STEP 3: CONFIRM THE PLAN
Reply in under 150 words with my chosen palette, fonts, signature concept and section list. Include a two-sentence sample of my hero line and profile summary written in my chosen voice. Wait for my OK before building.

## STEP 4: BUILD
Content rules
- Use only facts from my resume. Never invent employers, dates, numbers, awards or clients.
- Where a stronger claim needs a number I did not give, write the sentence without it and add it to a "Needs your confirmation" list.
- Where you reword my duties into achievements, keep the meaning identical.
- Every label, number and code on the page must be true and mean something. No decorative fake IDs, sheet numbers or invented statistics.
- Write short, direct sentences in active voice. Avoid "passionate", "results-driven", "dynamic", and mannered devices such as em-dash asides or "not X, but Y" phrasing.
- If I am targeting a senior role, add a Leadership section: strategic thinking, building from zero, stakeholders, people, judgement, and any technology or AI skills I mention. Back each point with something from my resume.

Design rules
- Define all colours and fonts as CSS variables at the top of the file. Design both a light and a dark theme properly, following the viewer's system setting.
- Open with the most characteristic thing about me: my name set large, my title, one strong line, and my photo if I have one.
- Use my photos unframed (no boxes, borders or ID-photo crops). Crop for composition and blend the photo background into the page colour. Use real photos only, never stock or AI-generated faces. If I have no photo, use a typographic or monogram hero.
- Present the career as a visual built on the signature concept from question E, with the current role most prominent.
- Make repeated elements consistent, keep line length near 65 characters, and give body text comfortable spacing.
- Spend boldness in one place (the hero or the signature concept) and keep the rest quiet.
- Motion must respect prefers-reduced-motion, and everything must be visible without scrolling or waiting for animation.

Technical rules
- One self-contained HTML file with no build step.
- Embed all images as base64 data, compressed to about 150 KB each, so the page cannot break if the file is uploaded on its own.
- Responsive from 360 px to wide desktop, with no horizontal scrolling.
- Semantic HTML, visible keyboard focus, WCAG AA contrast, descriptive alt text.
- Page title, meta description and Open Graph tags (leave the final URL as a clearly marked placeholder).
- No trackers and no external scripts other than Google Fonts.

Privacy rules
- Leave out my home address, age, date of birth, ID numbers and personal phone number unless I explicitly ask for them.
- Show my email assembled by script, with a Copy button, so the address is not plain in the page source.

## STEP 5: CHECK YOUR OWN WORK
Open or render the page at phone width (about 400 px) and desktop width, in light and dark. Confirm every image loads, nothing overflows, text is readable on every background, and there are no console errors. Fix what you find before showing me.

## STEP 6: DELIVER
1. The finished page.
2. A "Needs your confirmation" list: every claim, number or wording you were unsure of.
3. Step-by-step instructions to publish it for free (Netlify, GitHub Pages or Vercel, my choice) that work from a phone, with no dragging of folders.
4. Exact steps to add the link to LinkedIn: Featured section, Contact info website field, and the About section. Include how to refresh the link preview with LinkedIn's Post Inspector.
5. Any extras I chose in question K.

RESUME
[Paste your resume here, then attach your photos]
```
