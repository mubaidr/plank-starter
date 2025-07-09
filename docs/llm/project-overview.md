# Project Overview

## Project Summary

This is a comprehensive web-based floor plan designer application built with Next.js 15, React 19, TypeScript, Konva.js, and Tailwind CSS 4. The application provides professional-grade tools for architects, interior designers, homeowners, real estate professionals, and contractors to create detailed floor plans with MEP (Mechanical, Electrical, Plumbing) systems integration.

## Current Implementation Status

### ✅ COMPLETED FEATURES
- **Core Canvas System**: Konva.js-based drawing canvas with zoom, pan, selection
- **Advanced Drawing Tools**: Wall, Door, Window, Room, Text, Dimension tools
- **Layer Management**: Full layer system with color coding, opacity, print control
- **Unlimited Undo/Redo**: Complete history management system
- **Lasso Selection**: Advanced object selection capabilities
- **Validation System**: Comprehensive validation rules for geometry, architecture, accessibility
- **MEP Systems**: Electrical, HVAC, and Plumbing type definitions and integration
- **File Operations**: Save/Load with IndexedDB and localStorage
- **Export System**: PDF, PNG, SVG export capabilities
- **Responsive UI**: Mobile-friendly interface with collapsible panels

### 🚧 IN PROGRESS / TODO ITEMS
- Save/Load functionality implementation (UI exists, backend needed)
- Export dialog functionality (UI exists, implementation needed)
- Grid toggle implementation
- Snap system enhancements
- Guides panel functionality
- Section view export

## AI Assistant Directives

-   **Code Quality First**: Maintain strict TypeScript, follow existing patterns
-   **Feature Completion**: Focus on completing TODO items before adding new features
-   **Performance Optimization**: Konva.js best practices, memory management
-   **Type Safety**: Use existing type definitions, avoid `any` types
-   **Context-Aware Development**: Understand the full application state before making changes

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
-   `FloorPlanContext`: Canvas state, objects, layers, unlimited history management
-   `ToolContext`: Active tool, tool settings, tool-specific state
-   `FileOperationsContext`: Save/load operations, project management

**Key State Features:**
- Unlimited undo/redo with `maxHistorySize: -1`
- Normalized object storage with efficient lookups
- Layer-based organization with visual properties
- Real-time validation and error tracking

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
