# Project Overview

## Project Summary

This is a web-based floor plan designer application built with Next.js 15, React 19, TypeScript, Konva.js, and Tailwind CSS 4. Its primary goal is to provide an intuitive, professional-grade tool for architects, interior designers, homeowners, real estate professionals, and contractors.

## 2. AI Assistant Directives

-   **Prioritize existing documentation**: Always refer to `feature-specifications.md`, `development-guide.md`, `api-reference.md`, and `troubleshooting-guide.md`.
-   **Incremental implementation**: Start with core functionality, then add complexity.
-   **Strict TypeScript**: Adhere to types defined in `api-reference.md`.
-   **Test-driven development**: Follow patterns in `development-guide.md`.

## 3. Core Architectural Patterns

### Technology Stack Decisions

-   **Frontend Framework**: Next.js 15 + React 19 for server-side rendering, optimization, and strong TypeScript support.
-   **Canvas Library**: Konva.js + React-Konva for high-performance 2D rendering and excellent React integration.
-   **Styling**: Tailwind CSS 4 for a utility-first approach, rapid development, and responsive design.
-   **State Management**: React Context + `useReducer` for global state, avoiding external dependencies while maintaining good TypeScript integration.

### Component Architecture: Feature-Based Organization

```
src/
├── components/
│   ├── canvas/
│   ├── sidebar/
│   ├── panels/
│   ├── tools/
│   └── ui/
├── hooks/
├── context/
├── types/
└── utils/
```

### State Management Pattern: Context + Reducer

Centralized state with multiple contexts:
-   `FloorPlanContext`: Canvas state, objects, layers
-   `ToolContext`: Active tool, tool settings
-   `ViewContext`: Zoom, pan, view mode
-   `SelectionContext`: Selected objects, manipulation

### Event Handling: Command Pattern

```typescript
interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
}
```

## 4. Performance & Testing Priorities

-   **Canvas**: Focus on layers, caching, optimized event handling, and proper memory management.
-   **State**: Keep state flat, use normalized data, implement undo/redo, batch updates.
-   **Testing**: Prioritize canvas rendering, tool interactions, state persistence, and overall performance. Consider edge cases, browser compatibility, mobile responsiveness, and accessibility.

## 5. Common Pitfalls

-   **Konva.js**: Remember `layer.draw()`, destroy stages, use `listening: false`, and cache complex shapes.
-   **React/TypeScript**: Avoid direct state mutation, use proper types, clean up `useEffect`, and memoize expensive calculations.
-   **Architecture**: Adhere to component hierarchy, use context appropriately, implement error boundaries, and plan for scalability.
