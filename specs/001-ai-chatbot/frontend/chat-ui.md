# Chat UI Specification

**Feature Branch**: `001-ai-chatbot`
**Created**: 2026-01-16
**Status**: Draft

## UI Overview

The chat interface is a floating panel that provides natural language interaction with the Todo system. It operates independently of the existing Todo CRUD interface.

## Floating Chatbot Icon

### Visual Design

| Property | Value |
|----------|-------|
| Shape | Circular |
| Size | 56px diameter |
| Position | Fixed, bottom-right corner |
| Margin | 24px from edges |
| Background | Primary brand color (blue-600) |
| Icon | Chat bubble or robot icon |
| Shadow | Subtle drop shadow |
| Z-index | 1000 (above page content) |

### Icon States

| State | Visual |
|-------|--------|
| Default | Solid background, white icon |
| Hover | Slightly darker background, scale 1.05 |
| Active (chat open) | Hidden or minimized indicator |
| Disabled | Grayed out (when not authenticated) |

### Position Rules

| Screen Size | Position |
|-------------|----------|
| Desktop (>768px) | Bottom-right, 24px margin |
| Mobile (<768px) | Bottom-right, 16px margin |
| Keyboard open | Adjust above keyboard |

## Open/Close Animations

### Open Animation

| Property | From | To | Duration | Easing |
|----------|------|----|---------:|--------|
| Panel opacity | 0 | 1 | 200ms | ease-out |
| Panel scale | 0.95 | 1 | 200ms | ease-out |
| Panel Y position | 20px | 0 | 200ms | ease-out |
| Icon | Visible | Hidden | 150ms | ease-in |

### Close Animation

| Property | From | To | Duration | Easing |
|----------|------|----|---------:|--------|
| Panel opacity | 1 | 0 | 150ms | ease-in |
| Panel scale | 1 | 0.95 | 150ms | ease-in |
| Panel Y position | 0 | 20px | 150ms | ease-in |
| Icon | Hidden | Visible | 200ms | ease-out |

### Animation Trigger

| Action | Animation |
|--------|-----------|
| Click chat icon | Open panel |
| Click close button | Close panel |
| Click outside panel | Close panel (optional) |
| Press Escape key | Close panel |

## Chat Panel Layout

### Panel Dimensions

| Property | Desktop | Mobile |
|----------|---------|--------|
| Width | 400px | 100% - 32px |
| Height | 600px | 70vh |
| Max Height | 80vh | 85vh |
| Position | Fixed, bottom-right | Fixed, bottom-center |
| Border Radius | 16px | 16px top, 0 bottom |

### Panel Structure

```
┌─────────────────────────────────────────┐
│  Header                                 │
│  ┌───────────────────────────────────┐  │
│  │ Chat Title          [X] Close     │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│                                         │
│  Message Area (scrollable)              │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │        User Message              →│  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │←       Assistant Message          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │        User Message              →│  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │←       Assistant Message          │  │
│  │        (typing indicator)         │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│  Input Area                             │
│  ┌─────────────────────────┐ ┌──────┐  │
│  │  Type a message...      │ │ Send │  │
│  └─────────────────────────┘ └──────┘  │
└─────────────────────────────────────────┘
```

### Header Section

| Element | Description |
|---------|-------------|
| Title | "TodoBot" or similar |
| Close button | X icon, top-right |
| Background | Slightly darker than panel |
| Height | 48px |

### Message Area

| Property | Value |
|----------|-------|
| Overflow | Scroll Y, hidden X |
| Padding | 16px |
| Background | White or light gray |
| Scroll behavior | Smooth |
| Auto-scroll | Scroll to bottom on new message |

### Input Area

| Element | Description |
|---------|-------------|
| Input field | Multi-line textarea, auto-resize |
| Send button | Icon button or text |
| Height | Min 48px, max 120px |
| Background | White |
| Border | Top border separator |

## Message Bubbles

### User Messages

| Property | Value |
|----------|-------|
| Alignment | Right |
| Background | Primary color (blue-600) |
| Text color | White |
| Max width | 80% of container |
| Border radius | 16px (8px bottom-right) |
| Padding | 12px 16px |
| Margin | 8px 0 |

### Assistant Messages

| Property | Value |
|----------|-------|
| Alignment | Left |
| Background | Light gray (gray-100) |
| Text color | Dark gray (gray-900) |
| Max width | 80% of container |
| Border radius | 16px (8px bottom-left) |
| Padding | 12px 16px |
| Margin | 8px 0 |

### Message Content

| Element | Styling |
|---------|---------|
| Text | 14px, line-height 1.5 |
| Links | Underlined, primary color |
| Lists | Bullet points with spacing |
| Emoji | Native rendering |

### Message Metadata

| Element | Display |
|---------|---------|
| Timestamp | Optional, small, below bubble |
| Read receipt | Not required |
| Delivery status | Not required |

## Loading & Typing Indicators

### Typing Indicator

| Property | Value |
|----------|-------|
| Position | Left-aligned (assistant position) |
| Content | Three animated dots |
| Animation | Bounce/pulse, staggered |
| Duration | 1.4s loop |
| Display | While waiting for AI response |

### Visual Design

```
┌─────────────────────┐
│  ●  ●  ●            │
└─────────────────────┘
```

Animation sequence:
1. Dot 1 bounces (0ms)
2. Dot 2 bounces (200ms delay)
3. Dot 3 bounces (400ms delay)
4. Loop after 1s pause

### Send Button Loading

| State | Visual |
|-------|--------|
| Idle | Send icon |
| Sending | Spinner icon |
| Disabled | Grayed out |

### Full Panel Loading

For initial conversation load:

| Element | Description |
|---------|-------------|
| Spinner | Centered in message area |
| Text | "Loading conversation..." |
| Duration | Until history loaded |

## Error & Retry States

### Error Message Display

| Property | Value |
|----------|-------|
| Background | Light red (red-50) |
| Border | Red (red-200) |
| Icon | Warning icon |
| Text | Error description |
| Action | Retry button |

### Error Types

| Error | Display |
|-------|---------|
| Network error | "Connection lost. Tap to retry." |
| Server error | "Something went wrong. Please try again." |
| Auth error | "Session expired. Please sign in again." |
| Rate limit | "Too many messages. Please wait a moment." |

### Retry Button

| Property | Value |
|----------|-------|
| Position | Below error message |
| Text | "Retry" or refresh icon |
| Action | Resend failed message |

### Failed Message Indicator

When a user message fails to send:

```
┌───────────────────────────────────┐
│  Your message here            → │
│  ⚠️ Failed to send. Tap to retry │
└───────────────────────────────────┘
```

## Mobile Responsiveness

### Breakpoints

| Breakpoint | Chat Panel Behavior |
|------------|---------------------|
| >768px | Floating panel, 400px width |
| 480-768px | Floating panel, 90% width |
| <480px | Full-width, bottom sheet style |

### Mobile-Specific Adjustments

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| Panel position | Bottom-right | Bottom-center |
| Panel width | 400px | calc(100% - 32px) |
| Panel height | 600px | 70vh |
| Close button | X icon | X icon + swipe down |
| Input | Single line | Auto-expand |

### Touch Interactions

| Gesture | Action |
|---------|--------|
| Tap chat icon | Open panel |
| Tap close | Close panel |
| Swipe down | Close panel |
| Pull to refresh | Reload conversation |

### Keyboard Handling

| Event | Behavior |
|-------|----------|
| Keyboard opens | Panel adjusts height |
| Keyboard closes | Panel restores height |
| Enter key | Send message (optional) |
| Shift+Enter | New line in input |

## Accessibility Expectations

### ARIA Attributes

| Element | Attribute | Value |
|---------|-----------|-------|
| Chat icon | aria-label | "Open chat" |
| Chat panel | role | "dialog" |
| Chat panel | aria-modal | "true" |
| Close button | aria-label | "Close chat" |
| Message list | role | "log" |
| Message list | aria-live | "polite" |
| Input field | aria-label | "Type a message" |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between focusable elements |
| Enter | Send message (in input) |
| Escape | Close chat panel |
| Arrow keys | Scroll messages |

### Screen Reader Support

| Element | Announcement |
|---------|--------------|
| New message | "New message from [role]: [content]" |
| Typing indicator | "TodoBot is typing" |
| Error | "Error: [message]" |
| Send success | "Message sent" |

### Focus Management

| Event | Focus Target |
|-------|--------------|
| Panel opens | Input field |
| Panel closes | Chat icon |
| Message sent | Input field |
| Error shown | Error message/retry button |

### Color Contrast

| Element | Contrast Ratio |
|---------|----------------|
| User message text | At least 4.5:1 |
| Assistant message text | At least 4.5:1 |
| Input text | At least 4.5:1 |
| Error text | At least 4.5:1 |

### Motion Preferences

| Setting | Behavior |
|---------|----------|
| prefers-reduced-motion | Disable animations |
| Standard | Enable animations |
