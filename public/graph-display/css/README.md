# Interactive Career Graph - Modular CSS Architecture (Template)

## 📁 File Structure

```
css/
├── styles-new.css          # Main import file (use this in HTML)
├── styles.css              # Old monolithic file (deprecated)
└── components/
    ├── _variables.css      # CSS custom properties & theme
    ├── _base.css           # Reset & typography
    ├── _accessibility.css  # Skip links & a11y features
    ├── _buttons.css        # All button components
    ├── _header.css         # Header & profile button
    ├── _graph.css          # D3 visualization styles
    ├── _menu.css           # Menu panel & search
    ├── _popups.css         # Modals & CV content
    ├── _tooltip.css        # Hover tooltips
    ├── _walkthrough.css    # Interactive tour
    ├── _colors.css         # Dynamic color utilities
    └── _responsive.css     # Mobile & breakpoints
```

## 🚀 Usage

### In HTML
Update your `index.php` to use the new modular CSS:

```html
<!-- Replace old CSS -->
<!-- <link rel="stylesheet" href="css/styles.css"> -->

<!-- With new modular CSS -->
<link rel="stylesheet" href="css/styles-new.css">
```

### Browser Compatibility
The new CSS uses:
- CSS Custom Properties (CSS Variables)
- CSS Grid & Flexbox
- `@import` for modularization
- Modern media queries

**Supported Browsers:**
- ✅ Safari 14+ (iOS 14+)
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+

## 📱 iPhone Optimizations

### 1. Minimum Text Size (16px)
All text elements use minimum 16px to prevent iOS auto-zoom on input focus.

**Variables:**
```css
--font-size-base: 16px;
--font-size-sm: 16px;  /* Changed from 14px */
```

### 2. Touch Targets (44x44px minimum)
All interactive elements meet Apple's HIG minimum touch target size.

**Elements optimized:**
- Buttons: 44px minimum
- Profile button: 60px (56px on tablet, 52px on mobile)
- Input fields: 44px height
- Close buttons: 44px minimum

### 3. Modal/Popup Centering
Popups use Flexbox for perfect centering on all screen sizes.

```css
#popup {
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### 4. Touch Feedback
Visual feedback on touch devices:
- Scale down on press (0.95x)
- Reduced opacity (0.8)
- Fast transition (150ms)

### 5. Safe Area Support
Automatic padding for iPhone X+ notch:
```css
@supports (padding: max(0px)) {
    header {
        top: max(var(--spacing-md), env(safe-area-inset-top));
    }
}
```

## 🎨 Customization Guide

### Changing Colors

Edit `_variables.css`:
```css
:root {
    --layer0-base: #b07aa1;  /* Profile color */
    --layer1-base: #4e79a7;  /* Foundations */
    /* ... etc */
}
```

### Adjusting Spacing

Edit spacing variables in `_variables.css`:
```css
:root {
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
}
```

### Modifying Touch Targets

Edit `_variables.css`:
```css
:root {
    --touch-target-min: 44px;  /* Increase for larger targets */
}
```

### Changing Typography

Edit font variables in `_variables.css`:
```css
:root {
    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --font-size-base: 16px;
    --line-height-base: 1.6;
}
```

## 📐 Responsive Breakpoints

| Breakpoint | Size | Target Devices |
|------------|------|----------------|
| Mobile | ≤ 480px | iPhone, small phones |
| Tablet | ≤ 768px | iPad, tablets |
| Desktop | > 768px | Laptops, desktops |

### Mobile-First Approach
All base styles are mobile-optimized. Larger screens inherit and enhance.

```css
/* Mobile first (default) */
.element { font-size: 16px; }

/* Tablet and up */
@media (min-width: 769px) {
    .element { font-size: 18px; }
}
```

## 🔧 Component Editing Guide

### To Edit Buttons
Edit `components/_buttons.css`

### To Edit Popups
Edit `components/_popups.css`

### To Edit Graph Nodes
Edit `components/_graph.css`

### To Edit Menu
Edit `components/_menu.css`

### To Add New Breakpoints
Edit `components/_responsive.css`

## 🐛 Troubleshooting

### CSS Not Loading
1. Clear browser cache
2. Check file paths in `@import` statements
3. Verify all component files exist

### Styles Not Applying
1. Check browser DevTools for import errors
2. Verify CSS variable names match
3. Check for `!important` conflicts

### Mobile Issues
1. Test viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. Check safe area insets for iPhone X+
3. Verify touch-action properties

## ✅ Testing Checklist

### iPhone Testing
- [ ] Text is readable (minimum 16px)
- [ ] All buttons are tappable (44x44px minimum)
- [ ] Profile button is visible and sized correctly
- [ ] Popups are centered on screen
- [ ] Search input doesn't cause zoom on focus
- [ ] Touch feedback works (scale/opacity)
- [ ] Menu slides in/out smoothly
- [ ] Safe areas respected on iPhone X+

### iPad Testing
- [ ] Layout adapts to larger screen
- [ ] Touch targets remain adequate
- [ ] Popups are properly sized

### Desktop Testing
- [ ] Hover states work
- [ ] Click interactions work
- [ ] Graph is fully interactive

## 🔄 Migration from Old CSS

### Step 1: Backup
```bash
cp css/styles.css css/styles-old-backup.css
```

### Step 2: Update HTML
Change CSS link in `index.php`:
```html
<link rel="stylesheet" href="css/styles-new.css">
```

### Step 3: Test Thoroughly
Test all functionality before deploying.

### Step 4: Deploy
Once tested, you can rename:
```bash
mv css/styles.css css/styles-legacy.css
mv css/styles-new.css css/styles.css
```

## 📊 Performance

### Benefits of Modular CSS
- ✅ Easier maintenance (edit specific components)
- ✅ Better organization (logical file structure)
- ✅ Faster debugging (find styles quickly)
- ✅ Team collaboration (multiple devs can work on different files)

### Optimization Tips
1. **Minify for production** - Use CSS minifier
2. **Combine for deployment** - Reduce HTTP requests
3. **Use HTTP/2** - Parallel loading of component files

## 🆘 Support

### Common Questions

**Q: Do I need to modify JavaScript?**
A: No, JavaScript remains unchanged. Only CSS is modularized.

**Q: Will old browsers work?**
A: Modern browsers only (Safari 14+, Chrome 90+, Firefox 88+)

**Q: Can I use SCSS/SASS?**
A: Yes! These files can be converted to SCSS partials.

**Q: How do I add a new color variant?**
A: Add to `_variables.css` and create corresponding class in `_colors.css`

## 📝 Version History

### Version 2.0 (Current)
- ✨ Modular CSS architecture
- 📱 iPhone-optimized (16px minimum, 44px touch targets)
- 🎯 Perfect modal centering
- 👆 Enhanced touch feedback
- 🔧 Easy maintenance & editing

### Version 1.0 (Legacy)
- Monolithic `styles.css`
- Basic mobile support

---

**Created:** October 2025  
**Author:** Template (replace with your name/team)  
**License:** Proprietary
