---
name: media-ui-react-components
description: Consuming headless UI prop-getters and state hooks (Grid, Lightbox, Reels).
---

# Media UI React Headless Components Skill

This skill explains how to build layouts, grids, modals, and scrolling reels using headless hooks that export accessibility roles, properties, and handlers.

## Hooks Provided

1. **useHeadlessGrid**: Handles roles like `grid`, `row`, `gridcell` and keyboard grid accessibility layout attributes.
2. **useHeadlessLightbox**: Manages escape key bindings, focus trapping, and backdrop selection callbacks.
3. **useHeadlessReelSwiper**: Vertical scrolling layouts with scroll snap alignment properties, scroll position index checking, and programmatic scrolling handlers.

## Example Integration

```tsx
import { useHeadlessGrid, useHeadlessLightbox, useHeadlessReelSwiper } from "@media-ui-react";

// Headless Grid
function Grid({ items }) {
  const { getGridProps, getGridRowProps, getGridCellProps } = useHeadlessGrid({ itemsCount: items.length });
  
  return (
    <div {...getGridProps()}>
      {items.map((item, idx) => (
        <div key={item.id} {...getGridRowProps(idx)}>
          <div {...getGridCellProps(idx)}>{item.alt}</div>
        </div>
      ))}
    </div>
  );
}
```
