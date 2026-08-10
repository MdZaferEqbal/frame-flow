---
name: media-react-data
description: Integrating the Core SDK, React wrapper providers, hooks, and fetching/caching logic.
---

# Media React Data Integration Skill

This skill explains how to integrate and use the headless `MediaSDK` and React wrappers for data fetching, caching, and analytics tracking.

## Core Concepts

1. **MediaSDK**: Under the hood, this is a framework-agnostic client managing authentication, request de-duplication, caching, and event emission.
2. **MediaProvider**: Wrap the root layout or feature boundaries in the React tree with `MediaProvider`.
3. **useMediaSDK**: Access the core client to manually track analytics events like `download` and `view`.
4. **useMediaGalleryState**: Maintain the reactive search, pagination, and state machine matching the gallery interface.

## Usage Reference

```tsx
import { MediaSDK } from "@media-core";
import { MediaProvider, useMediaSDK, useMediaGalleryState } from "@media-react";

// 1. Initialize the SDK
const sdk = new MediaSDK({ baseUrl: "/api/pexels" });

// 2. Wrap components
function App() {
  return (
    <MediaProvider sdk={sdk}>
      <Gallery />
    </MediaProvider>
  );
}

// 3. Consume state and SDK hooks
function Gallery() {
  const sdk = useMediaSDK();
  const { items, isLoading, loadMore } = useMediaGalleryState();
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id} onClick={() => sdk.trackView(item)}>
          {item.alt}
        </div>
      ))}
    </div>
  );
}
```
