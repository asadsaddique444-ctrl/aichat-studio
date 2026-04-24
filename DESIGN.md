# Design Brief

## Direction

Dark Editorial Chat — refined, minimal interface for AI conversations with content-first message threads and calm productivity aesthetic.

## Tone

Clean, modern, content-focused. Messages drive the design; interface minimizes decoration to let conversations breathe. Inspired by Linear and Vercel editorial patterns.

## Differentiation

Asymmetric two-column layout (sidebar + thread) with chroma accent applied selectively only to AI responses and CTAs, creating clear visual distinction between user and AI without visual noise.

## Color Palette

| Token      | OKLCH          | Role                                     |
| ---------- | -------------- | ---------------------------------------- |
| background | 0.12 0 0       | Deep dark canvas, near-black             |
| foreground | 0.95 0.01 260  | Off-white text, cool undertone           |
| card       | 0.16 0 0       | Slightly elevated surface for cards      |
| primary    | 0.75 0.15 190  | Cyan/teal accent for CTAs and highlights |
| accent     | 0.7 0.18 195   | Cyan accent for AI responses             |
| secondary  | 0.25 0.08 45   | Warm amber for generated content         |
| muted      | 0.22 0.02 260  | Subdued UI elements, dividers            |
| destructive| 0.55 0.2 25    | Red for alerts and destructive actions   |

## Typography

- **Display**: Space Grotesk — modern, geometric, personality in headings and hero text
- **Body**: DM Sans — clean, readable at all sizes, UI labels and message threads
- **Mono**: Geist Mono — code and technical content
- **Scale**: hero `text-3xl md:text-4xl font-bold`, h2 `text-2xl font-semibold`, label `text-sm font-medium`, body `text-base`

## Elevation & Depth

Minimal shadow hierarchy via subtle elevation of card surfaces. Cards (sidebar items, message bubbles, input field) sit above background with `bg-card`. No hover shadows; instead, background color shifts + border state changes on interaction.

## Structural Zones

| Zone    | Background      | Border          | Notes                                          |
| ------- | --------------- | --------------- | ---------------------------------------------- |
| Header  | `bg-background` | `border-b`      | Title + dark mode toggle, minimal padding      |
| Sidebar | `bg-sidebar`    | `border-r`      | Conversation list with card items, tight spacing |
| Content | `bg-background` | —               | Message thread area, spacious vertical rhythm  |
| Input   | `bg-card`       | `border-t`      | Message input field with send button           |

## Spacing & Rhythm

Generous vertical rhythm in threads (1rem gap between messages). Sidebar items compact (0.75rem padding). Micro-spacing uses 0.25rem, 0.5rem, 1rem, 1.5rem to create breathing room. Message thread content centered within viewport for focus and readability.

## Component Patterns

- **Buttons**: Primary (cyan, pill-shaped `rounded-full`), secondary (transparent text), destructive (red)
- **Message Bubbles**: User messages left-aligned with subtle background, AI messages right-aligned with cyan accent border-left
- **Cards**: `rounded-lg`, `bg-card` with no shadow, subtle `border` on hover
- **Badges**: Rounded, muted background for status and tags

## Motion

- **Entrance**: Messages fade in + slide up 4px via `message-fade-in` class (0.3s)
- **Hover**: Color shift on cards and buttons (no shadow), border state change on inputs (0.2s smooth)
- **Loading**: Subtle pulse animation on AI loading indicator (2s cycle)

## Constraints

- No full-page gradients; depth via layered surfaces only
- Accent chroma applied sparingly (AI responses, CTAs) — user messages stay neutral
- No arbitrary Tailwind colors; all colors from OKLCH token system
- Minimum spacing between interactive elements: 0.5rem (touch-friendly on mobile)

## Signature Detail

Selective accent chroma on AI-generated content creates visual hierarchy without visual overload—cyan text or border-left on AI messages signals non-human origin and guides focus. This establishes a calm, readable interface where the conversation itself is the primary interface element.
