# Task Management Document

## Project State
- **Status**: Feature-complete floor plan app
- **Architecture**: Next.js 15 + React 19 + TypeScript + Konva.js
- **State**: Context+Reducer, unlimited undo/redo
- **Quality**: 0 TS errors, 171 ESLint warnings (unused vars)

## Priority Tasks
1. **File Ops** - Connect UI to storage (FloorPlanApp.tsx:24,29,34)
2. **Export** - Connect dialogs to PDF/PNG exporters
3. **Grid Toggle** - Implement visibility controls (FloorPlanApp.tsx:39)
4. **Snap Enhancement** - Enhance existing system (FloorPlanApp.tsx:44)
5. **Guides Panel** - Implement functionality (FloorPlanApp.tsx:49)

## Implementation Patterns
```typescript
// Context usage
const { state, addObject, updateObject, undo, redo } = useFloorPlanContext();

// Object creation
const obj: FloorPlanObject = {
  id: `${Date.now()}-${Math.random()}`,
  type, position, rotation: 0, scale: {x:1,y:1},
  visible: true, locked: false, layerId: state.activeLayerId,
  properties: {}, metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1 }
};
```

## Key Files
- `src/context/FloorPlanContext.tsx` - State management
- `src/components/FloorPlanApp.tsx` - Main app with TODOs
- `src/types/index.ts` - Type definitions
- `src/utils/storage/` - Storage utilities
- `src/utils/export/` - Export utilities

## Constraints
- Follow existing patterns, don't reinvent
- Use context methods for state changes
- Maintain type safety
- Test canvas interactions
- Complete TODOs before new features

## Testing Focus
- Canvas rendering (Konva.js)
- State management (Context)
- Validation rules
- File operations
- Tool interactions

---
*Format: Extendable sections for new findings/tasks*