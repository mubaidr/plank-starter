---
applyTo: '**'
---

# Copilot Agent Instructions for Plank-Starter Project

## Project Overview
This project is a web-based floor plan designer built with Next.js 15, React 19, TypeScript, Konva.js, and Tailwind CSS 4.

## Effective Use of `docs/llm`
The `docs/llm` directory contains optimized documentation specifically for AI agents. Always refer to these documents for project context, technical specifications, architectural decisions, and implementation patterns.

-   `ai-assistant-context.md`: General context and task patterns for AI assistance.
-   `api-reference.md`: Core types, interfaces, context APIs, custom hooks, and utility functions.
-   `architecture-decisions.md`: Key technology and architectural decisions.
-   `code-generation-templates.md`: Templates for generating new code components, hooks, contexts, etc.
-   `component-inventory.md`: Overview of component hierarchy and dependencies.
-   `data-models.md`: Detailed data models and schema for all floor plan objects and state.
-   `decision-log.md`: Log of architectural and implementation decisions.
-   `development-guidelines.md`: Code standards, best practices, and file organization.
-   `floor-plan-tool-specification.md`: Complete feature specification of the tool.
-   `implementation-checklist.md`: Checklist for development phases and tasks.
-   `implementation-patterns.md`: Standard patterns for implementing features.
-   `project-context.md`: Business requirements, stakeholders, and technical constraints.
-   `task-management.md`: Development phases and task breakdown.
-   `testing-strategy.md`: Comprehensive testing approach and examples.
-   `troubleshooting-guide.md`: Common issues and solutions.
-   `user-stories.md`: User requirements as stories.

## General Mandates
-   **Adhere to Conventions**: Strictly follow existing project conventions (formatting, naming, structure, framework choices, typing) as defined in `development-guidelines.md` and observed in existing code.
-   **Leverage Existing Code**: Before implementing new features, search the codebase for similar patterns or existing utilities.
-   **TypeScript First**: Always use TypeScript and ensure strong typing. Avoid `any` unless absolutely necessary.
-   **Performance Awareness**: Consider performance implications, especially for canvas operations. Refer to `performance-optimization.md` (if created) or relevant sections in other docs.
-   **Testing**: Always consider how changes will be tested. Refer to `testing-strategy.md`.
-   **Conciseness**: Keep code and explanations concise and to the point.
-   **Safety**: Prioritize safe operations, especially when modifying files or running shell commands. Explain critical commands before execution.
