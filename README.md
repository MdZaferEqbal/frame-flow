# Frame Flow - Visual Media Gallery

Frame Flow is a polished, production-quality photo and video gallery built as a single responsive web application inside Next.js. The interface features a dark-neutral visual design appropriate for modern photography and sports media workflows. It securely connects to the Pexels API using a server-side route proxy, uses GSAP for smooth micro-animations, and follows accessibility and web performance best practices.

## Features

- **Photo Gallery**: Displays curated or searched photos inside a responsive masonry-style layout preserving original image aspect ratios.
- **Video Gallery**: Displays sports and popular videos inside a uniform card grid, showcasing video creator credits, durations, and play indicator overlays.
- **Full Media Search**: Active search query input with popular search chip suggestions (Nature, Architecture, People, Sports, Travel).
- **Page-Based Load More**: Fetches additional results dynamically and appends them without losing existing media grid elements.
- **Accessible Lightbox Modal**: Custom keyboard-accessible lightbox/portal for photos (high-res display, photographer details, source attribution) and videos (standard HTML video player with controls).
- **Responsive Dark/Light UI**: A premium dark-by-default visual interface with a clean toggler that seamlessly transitions both styling themes.
- **Secure API Handler**: Client-side queries never expose the Pexels API key; they fetch through a secure server-side Next.js route proxy.

## Tech Stack

- **Framework**: Next.js (v16.3.0 App Router)
- **Language**: TypeScript (Strict checks)
- **Styling**: Tailwind CSS (v4)
- **Animations**: GSAP (GreenSock Animation Platform) & CSS Keyframe/Transitions
- **Icons**: Custom responsive inline SVGs (no heavy external dependencies)
- **Image Optimization**: `next/image`

## Setup & Run Instructions

### 1. Environment Variable Setup

Frame Flow requires a valid Pexels API Key.

1. Go to [Pexels API Documentation](https://www.pexels.com/api/new/) and create a free developer account to obtain your API key.
2. Create a `.env.local` file in the root directory:
   ```env
   PEXELS_API_KEY=your_actual_pexels_api_key
   ```
   *(Ensure you replace `your_actual_pexels_api_key` with the real key value).*

### 2. Install Dependencies

Install the minimum required dependencies:
```bash
npm install
```

### 3. Run Development Server

Launch the Next.js Turbopack development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

### 4. Build and Production Run

To build the optimized package:
```bash
npm run build
```
To run the production bundle locally:
```bash
npm run start
```

## Architecture Overview

```text
app/
  api/
    pexels/
      route.ts       # Secure server-side Pexels API forwarding & data normalization
  page.tsx           # Home page layout with theme context & GSAP entry anims
  layout.tsx         # Root layout with fonts & SEO meta metadata tags
  globals.css        # Base Tailwind, scrollbar styling, and custom variables

components/
  gallery/
    media-gallery.tsx     # Main client-side coordinator
    media-card.tsx        # Card display (aspect-ratios, photographer hover info)
    media-grid.tsx        # Masonry column layout (photos) / Uniform grid (videos)
    gallery-tabs.tsx      # Toggle buttons for Photos/Videos with visual active pill
    search-bar.tsx        # Input form & suggestions chips
    load-more-button.tsx  # Dynamic paginated load-more button
    media-modal.tsx       # Reusable Portal modal with Escape listener & focus trap
    empty-state.tsx       # Friendly message for 0 results
    error-state.tsx       # Guided recovery flow if API keys are misconfigured
    loading-skeleton.tsx  # Pulse shimmers for photo column masonry / video cards

hooks/
  use-media-gallery.ts    # Central hook handling fetch states, page increment, and abort tokens

lib/
  types.ts                # Strict TypeScript typings for API & application states
```

## Animation Approach

- **GSAP**: Used specifically for staggered gallery card entries, hero heading slides, and media modal zoom/fade animations.
- **CSS Transitions**: Used for the theme toggle, hover scales, active tab sliding, button states, and skeleton shimmer keyframes.
- **Motion Reduction**: Respects user's system preferences using `@media (prefers-reduced-motion: reduce)`. Animations are completely bypassed when active to ensure accessibility.

## Accessibility Considerations

- Semantically correct elements (`main`, `header`, `footer`, `dialog`, `a`, `button`).
- Fully keyboard-navigable search suggestions, tab controls, cards, and modal dismissals.
- Portal modal uses a custom Focus Trap to prevent tabbing into background layout elements.
- Restoration of focus to the previously active element when closing lightbox modals.
- Escape (`Esc`) key listener to dismiss modals.
- `aria-selected` and `aria-controls` for tabs, `aria-busy` for loaders.

## Known Limitations

- **No Carousel / Reel Swiping**: Built strictly as a search grid with standard modals. Reels, vertical snap feeds, and horizontal carousels are omitted by design.
- **Third-Party Video Formats**: The video player relies on standard HTML5 video rendering. Pexels returns MP4 files; some larger clips may have brief buffers depending on local bandwidth.

## AI Assistance & Review

This project was built with the assistance of Antigravity:

- **AI-Assisted Portions**:
  - API Proxy Endpoint creation & data structure normalization.
  - Media Card, grid columns, and accessibility focus trap logic.
  - GSAP context layout hooks & cleanup handling.
  - TypeScript interfaces design.
- **Manually Reviewed & Verified**:
  - Standard React 19 / Next.js 16.3 compilation & linter configurations.
  - TypeScript compile checks (ran `npx tsc --noEmit` which completed with `0` errors).
  - ESLint checks (ran `npm run lint` which completed with `0` errors/warnings).
  - Next.js production packaging (ran `npm run build` which compiled successfully).
