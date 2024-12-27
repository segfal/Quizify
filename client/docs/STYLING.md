# Styling System Documentation

## Overview
The styling system in Quizify is built on Tailwind CSS with custom configurations and animations. It provides a robust foundation for creating consistent, responsive, and accessible user interfaces.

## Global Styles (`globals.css`)

### Theme Variables
```css
:root {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --card: 0 0% 6.7%;
  --card-foreground: 0 0% 100%;
  --border-radius: 20px;
}
```

These variables provide consistent theming across the application.

### Custom Animations

#### Success Pulse
```css
@keyframes success-pulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
```
Used for success state feedback in interactive elements.

#### Error Shake
```css
@keyframes error-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```
Provides visual feedback for error states.

### Performance Optimizations
```css
.animated-background * {
    will-change: transform, opacity;
    backface-visibility: hidden;
}
```

### Visual Effects
```css
.gif-container {
    mask-image: linear-gradient(to bottom, 
        transparent 0%,
        black 20%,
        black 80%,
        transparent 100%
    );
}
```

## Typography System

### Fonts
- Primary: Geist Sans
- Monospace: Geist Mono

### Usage
```typescript
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
```

## Component Classes

### Cards
```css
.card {
  border-width: 1px;
  border-style: solid;
  border-radius: var(--border-radius);
}
```

### Containers
```css
.gif-container {
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
}
```

## Best Practices

### 1. Class Organization
- Use Tailwind's layer system
- Group related utilities
- Maintain consistent ordering

### 2. Dark Mode
- Use CSS variables for theme colors
- Implement proper contrast ratios
- Test in both light and dark modes

### 3. Responsive Design
- Mobile-first approach
- Use Tailwind breakpoints consistently
- Test across different devices

### 4. Performance
- Minimize custom CSS
- Use Tailwind's JIT compiler
- Optimize animations

### 5. Accessibility
- Maintain WCAG compliance
- Test with screen readers
- Ensure proper contrast ratios

## Usage Guidelines

### 1. Component Styling
```typescript
// Preferred
<div className="bg-background text-foreground p-4 rounded-lg">

// Avoid
<div style={{ backgroundColor: 'black', color: 'white' }}>
```

### 2. Animation Usage
```typescript
// Success state
<div className="success">Success!</div>

// Error state
<div className="error-shake">Error occurred</div>
```

### 3. Container Usage
```typescript
// With gradient mask
<div className="gif-container">
  {/* Content */}
</div>
```

## Maintenance

### 1. CSS Updates
- Document all custom CSS
- Update theme variables centrally
- Test changes across components

### 2. Performance Monitoring
- Regular lighthouse audits
- Animation performance checks
- Bundle size monitoring

### 3. Accessibility Checks
- Regular contrast checking
- Screen reader testing
- Keyboard navigation verification 