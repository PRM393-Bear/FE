---
name: Organic Vitality
colors:
  surface: '#f4fcf0'
  surface-dim: '#d5dcd1'
  surface-bright: '#f4fcf0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff6ea'
  surface-container: '#e9f0e5'
  surface-container-high: '#e3eadf'
  surface-container-highest: '#dde5d9'
  on-surface: '#171d16'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#2b322b'
  inverse-on-surface: '#ecf3e7'
  outline: '#6e7b6c'
  outline-variant: '#bdcaba'
  surface-tint: '#006e2d'
  primary: '#006b2c'
  on-primary: '#ffffff'
  primary-container: '#00873a'
  on-primary-container: '#f7fff2'
  inverse-primary: '#62df7d'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#a72d51'
  on-tertiary: '#ffffff'
  tertiary-container: '#c74668'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ffc97'
  primary-fixed-dim: '#62df7d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffd9de'
  tertiary-fixed-dim: '#ffb2bf'
  on-tertiary-fixed: '#3f0016'
  on-tertiary-fixed-variant: '#8a143c'
  background: '#f4fcf0'
  on-background: '#171d16'
  surface-variant: '#dde5d9'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 48px
---

## Brand & Style
The design system focuses on a sense of organic growth, reliability, and warmth. It is tailored for a marketplace experience that feels both professional and approachable. The aesthetic is rooted in **Corporate Modern** principles with a **Tactile** softness, utilizing generous whitespace and subtle depth to make the browsing experience feel effortless and high-end.

The target audience seeks quality and trust. The UI evokes an emotional response of clarity and calm through a clean, systematic arrangement of elements, avoiding visual clutter to prioritize product and event discovery.

## Colors
The palette is grounded in nature and warmth. 
- **Primary (Emerald Green):** Used for main actions, active states, and brand presence. It signals growth and positivity.
- **Secondary (Warm Amber):** Reserved for highlights, special categories, and secondary accents that require warmth without the urgency of a warning.
- **Background & Surface:** A layered approach using a warm off-white for the page foundation and pure white for interactive cards and containers to create a subtle lift.
- **Neutral Dark:** Provides high-contrast legibility for typography and deep structural elements.

## Typography
The system employs a dual-font strategy to balance character with utility. **Be Vietnam Pro** is used for headlines to provide a friendly, contemporary, and slightly geometric personality. **Inter** is utilized for all functional body text and labels to ensure maximum readability and a systematic feel. 

For the 1280px web experience, headlines use tighter tracking and generous line heights to maintain an editorial quality. Mobile overrides are provided for the largest display styles to ensure they remain within the viewport comfortably.

## Layout & Spacing
The design system utilizes a **Fixed Grid** model for desktop, centered within a 1280px container. 
- **Grid:** A 12-column system with 24px gutters.
- **Rhythm:** An 8px linear scale governs all padding and margins.
- **Responsive Behavior:** On tablet, the margins reduce to 24px. On mobile, the grid collapses to a single column with 16px side margins. 

The layout prioritizes a "vertical stack" philosophy for content sections, using `stack-xl` to separate major content blocks and `stack-md` for internal component spacing.

## Elevation & Depth
Hierarchy is achieved through **Ambient Shadows** and tonal layering. 
- **Level 0 (Background):** #FAFAF9, flat.
- **Level 1 (Cards/Surface):** #FFFFFF with a soft, diffused shadow (0px 4px 20px rgba(28, 25, 23, 0.05)).
- **Level 2 (Hover States/Modals):** Increased shadow spread and slightly higher opacity (0px 8px 30px rgba(28, 25, 23, 0.08)) to simulate physical lift.

Outlines are used sparingly—primarily for ghost buttons and input fields—to maintain a clean, airy appearance without heavy boxing.

## Shapes
The shape language is defined by **Rounded** geometry. The base radius is 8px (0.5rem), which scales up to 12-16px for larger containers like cards and modals. This roundedness eliminates harsh corners, reinforcing the friendly and organic brand personality. Buttons and small tags should feel substantial and soft to the touch.

## Components

### Top Navbar
A fixed height of 80px. Features a white surface with a bottom border or very soft shadow. 
- **Logo:** Left-aligned.
- **Search:** A centered, rounded (12px) input field with a subtle grey-100 background.
- **Nav Links:** Inter Medium, Neutral Dark. Active state uses a 2px Emerald Green underline or text color change.
- **Profile:** Circular avatar (40px) with a dropdown chevron.

### Product & Event Cards
- **Product Card:** White background, 16px corner radius. Image at top, followed by 16px padding for content. Uses `label-sm` for categories and `headline-md` for titles.
- **Event Card:** Features a secondary emphasis on the date/time. Use a Warm Amber badge for "Upcoming" status.

### Buttons
- **Primary:** Emerald Green background, white text. 12px corner radius.
- **Secondary:** Warm Amber background, white text.
- **Ghost:** Transparent background, 1.5px Neutral Dark or Emerald Green border.
- **Danger:** Subtle red-50 surface with red-600 text for destructive actions.

### Input Fields
Height of 48px. 12px roundedness. Use a 1.5px border in Neutral-200. On focus, the border shifts to Emerald Green with a soft outer glow.

### Badges & Tag Chips
- **Badges:** Small, pill-shaped, used for statuses (e.g., "New", "Limited"). High contrast.
- **Tag Chips:** Light grey or pale emerald backgrounds with `label-md` text. Used for filtering and metadata. Should have a 50% radius (pill) and include a dismiss icon if removable.

### Icons
All icons must be **outlined** (not filled) with a 1.5px stroke weight to match the clean, airy aesthetic of the typography.