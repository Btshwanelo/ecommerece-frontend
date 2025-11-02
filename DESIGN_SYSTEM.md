# Yeezy-Inspired Design System

This design system provides a minimal, clean aesthetic inspired by Yeezy's design language.

## Quick Start

### Using Components

```tsx
import { YeezyButton } from '@/components/ui/YeezyButton';
import { YeezyInput } from '@/components/ui/YeezyInput';
import { YeezySelect } from '@/components/ui/YeezySelect';
import { YeezyProductCard } from '@/components/ui/YeezyProductCard';

// Button
<YeezyButton variant="primary">Add to Cart</YeezyButton>
<YeezyButton variant="secondary">Cancel</YeezyButton>
<YeezyButton variant="text">Learn More</YeezyButton>

// Input
<YeezyInput 
  label="EMAIL ADDRESS"
  placeholder="your@email.com"
/>

// Select
<YeezySelect
  label="CATEGORY"
  options={[
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' }
  ]}
/>

// Product Card
<YeezyProductCard product={productData} />
```

## Color Palette

Use Tailwind classes with the `neutral-*` color scale:

```tsx
// Backgrounds
className="bg-neutral-50"   // Lightest
className="bg-neutral-100"
className="bg-neutral-900"  // Darkest

// Text
className="text-neutral-900" // Primary text
className="text-neutral-500" // Secondary text
className="text-neutral-400" // Placeholder text

// Borders
className="border-neutral-300"
className="border-neutral-900"
```

## Typography

### Utility Classes

```tsx
// Product codes / SKUs
<span className="text-product-code">SKU-12345</span>

// Category labels
<span className="text-category">SNEAKERS</span>

// Hero text (large headings)
<h1 className="text-hero-large">NEW COLLECTION</h1>

// Uppercase tracking
<span className="uppercase tracking-widest">MINIMAL TEXT</span>
```

### Typography Scale

- `text-xs` - 10px (category labels)
- `text-sm` - 14px (product names, buttons)
- `text-base` - 16px (body text)
- `text-lg` - 18px (section headings)
- `text-xl` - 20px (page headings)

## Spacing

Use the spacing scale for consistent layouts:

```tsx
className="p-2"    // xs: 4px
className="p-4"    // sm: 8px
className="p-8"    // md: 16px
className="p-12"   // lg: 24px
className="p-16"   // xl: 32px
className="p-24"   // 2xl: 48px
className="p-32"   // 3xl: 64px
```

## Grid System

```tsx
// Mobile: 2 columns, 16px gap
<div className="grid grid-cols-2 gap-4">
  {items.map(item => <Item key={item.id} />)}
</div>

// Tablet: 3 columns, 24px gap
<div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => <Item key={item.id} />)}
</div>

// Desktop: 5 columns, 24px gap
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
  {items.map(item => <Item key={item.id} />)}
</div>

// Large Desktop: 6 columns, 32px gap
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 xl:gap-8">
  {items.map(item => <Item key={item.id} />)}
</div>
```

## Form Elements

### Custom Input Styling

```tsx
<input
  className="w-full px-6 py-4 bg-transparent border border-neutral-300 text-neutral-900 placeholder-neutral-400 text-sm uppercase tracking-widest focus:outline-none focus:border-neutral-900 transition-colors"
  placeholder="EMAIL ADDRESS"
/>
```

### Custom Select Styling

```tsx
<select className="w-full px-6 py-4 bg-white border border-neutral-300 text-neutral-900 text-sm uppercase tracking-wide focus:outline-none focus:border-neutral-900 transition-colors">
  <option>Select option</option>
</select>
```

## Product Cards

Minimal product card pattern:

```tsx
<div className="group">
  <div className="aspect-square bg-neutral-50 mb-3 overflow-hidden">
    <img 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
      src={imageUrl}
      alt={productName}
    />
  </div>
  <h3 className="text-sm uppercase tracking-wide font-medium mb-1">
    {productName}
  </h3>
  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">
    {category}
  </p>
  <p className="text-sm text-neutral-900 font-medium">
    ${price}
  </p>
</div>
```

## Design Principles

### ✅ Do's
- Use neutral color palette
- Embrace whitespace
- Keep typography minimal and uppercase
- Use high-quality product photography
- Maintain consistent spacing
- Focus on the product
- Create breathing room
- Use subtle hover effects

### ❌ Don'ts
- Avoid bright, saturated colors
- No heavy shadows or gradients
- No excessive rounded corners (use sharp or very subtle rounding)
- No busy patterns or textures
- No multiple font families
- No excessive decoration
- No dense layouts

## Animation Guidelines

### Hover Effects

```tsx
// Button hover
className="hover:bg-neutral-700 transition-colors duration-200"

// Image hover scale
className="group-hover:scale-105 transition-transform duration-500"

// Link hover underline
className="underline hover:no-underline transition-all"
```

### Page Transitions
- Keep minimal and quick (200-300ms)
- Use fade or slide effects
- Avoid bouncy or elastic animations

## Examples

### Navigation

```tsx
<header className="border-b border-neutral-200 bg-white">
  <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <div className="text-xl font-bold tracking-tight">LOGO</div>
    <ul className="flex gap-8 text-xs uppercase tracking-widest">
      <li><a href="/products" className="hover:text-neutral-500">Shop</a></li>
      <li><a href="/about" className="hover:text-neutral-500">About</a></li>
    </ul>
  </nav>
</header>
```

### Footer

```tsx
<footer className="bg-neutral-900 text-white py-12">
  <div className="max-w-7xl mx-auto px-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      <div>
        <h4 className="text-xs uppercase tracking-widest mb-4">Shop</h4>
        <ul className="space-y-2 text-xs text-neutral-400">
          <li><a href="#" className="hover:text-white">Products</a></li>
          <li><a href="#" className="hover:text-white">New Arrivals</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-neutral-800 pt-8 text-xs text-neutral-500 text-center">
      © 2024 All rights reserved
    </div>
  </div>
</footer>
```
