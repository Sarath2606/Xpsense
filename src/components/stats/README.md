# Savings Goal Progress Component

A modern, animated circular progress indicator for tracking savings goals in the Xpenses application.

## Features

- **Smooth Animations**: Progress bar animates smoothly when component loads or progress changes
- **Multiple Sizes**: Three size options (sm, md, lg) for different use cases
- **Custom Icons**: Support for emoji icons or React icons in the center
- **Modern Design**: Clean, professional appearance with Tailwind CSS styling
- **Responsive**: Works well on all screen sizes
- **Accessible**: Proper ARIA labels and semantic HTML

## Usage

### Basic Usage

```jsx
import SavingsGoalProgress from './SavingsGoalProgress';

<SavingsGoalProgress progress={62} icon="🏝️" />
```

### With Size

```jsx
<SavingsGoalProgress progress={62} icon="🏝️" size="lg" />
```

### With Custom Class

```jsx
<SavingsGoalProgress 
  progress={62} 
  icon="🏝️" 
  size="md"
  className="my-4" 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | `number` | Required | Progress percentage (0-100) |
| `icon` | `string` | Required | Emoji or icon to display in center |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the progress circle |
| `className` | `string` | `''` | Additional CSS classes |

## Size Configurations

- **Small (sm)**: 120x120px, stroke width 8px, font size 16px
- **Medium (md)**: 160x160px, stroke width 10px, font size 20px  
- **Large (lg)**: 200x200px, stroke width 12px, font size 24px

## Design Features

- **Circular Progress Bar**: Smooth circular progress indicator
- **Background Track**: Light gray background circle
- **Progress Fill**: Blue-purple (#6266FF) progress fill
- **Marker Dots**: Small rectangular markers around the circle (like clock markers)
- **Center Icon**: Emoji or icon displayed in the center
- **Percentage Text**: Bold percentage text below the circle
- **Smooth Transitions**: 1-second ease-out animation for progress changes

## Integration Examples

### In SavingsGoalPost2 Component

```jsx
<SavingsGoalProgress 
  progress={percent}
  icon={goalIcon}
  size="md"
/>
```

### In SavingsGoalDetail Component

```jsx
<SavingsGoalProgress 
  progress={progressPercent}
  icon={getGoalEmoji(goal.name)}
  size="lg"
/>
```

### In Stats View Overview

```jsx
// Small progress circles for goal grid
<SavingsGoalProgress 
  progress={progress}
  icon={getGoalEmoji(goal.name)}
  size="sm"
/>
```

## Icon Suggestions

Common goal types and their suggested emoji icons:

- **Vacation/Travel**: 🏝️
- **Education**: 🎓
- **Car**: 🚗
- **House**: 🏠
- **Emergency Fund**: 🛡️
- **Retirement**: 💰
- **Wedding**: 💒
- **Business**: 💼
- **General Goal**: 🎯

## Styling

The component uses Tailwind CSS classes and can be customized with:

- Custom `className` prop for additional styling
- CSS custom properties for colors (if needed)
- Tailwind utility classes for spacing and layout

## Animation

The progress bar features:
- Smooth fill animation on component mount
- Animated progress updates when the `progress` prop changes
- 1-second duration with ease-out timing function
- CSS transitions for smooth visual updates

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- SVG animations and transforms
- CSS custom properties (for advanced customization)

## Examples

See the following files for complete examples:
- `SavingsGoalProgressDemo.tsx` - Interactive demo with all features
- `SavingsGoalProgressExample.js` - Simple usage examples
- `savings_goal_post2.js` - Integration in existing component
- `savings_goal_detail.js` - Integration in detail view
