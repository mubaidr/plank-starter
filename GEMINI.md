# Gemini Agent Instructions for Plank-Starter Project

## Project Overview
This project is a web-based floor plan designer built with Next.js 15, React 19, TypeScript, Konva.js, and Tailwind CSS 4.

## Effective Use of `docs/llm`
The `docs/llm` directory contains optimized documentation specifically for AI agents. Always refer to these documents for project context, technical specifications, architectural decisions, and implementation patterns.

-   `agent-summary.md`: General context and task patterns for AI assistance.
-   `coding-agent-guide.md`: Guide for code generation and modification.
-   `development-guide.md`: Code standards, best practices, and file organization.
-   `feature-specifications.md`: Complete feature specification of the tool.
-   `implementation-roadmap.md`: Development phases and task breakdown.
-   `project-overview.md`: Business requirements, stakeholders, and technical constraints.
-   `task-management.md`: Development phases and task breakdown.
-   `troubleshooting-guide.md`: Common issues and solutions.

## General Mandates
-   **Adhere to Conventions**: Strictly follow existing project conventions (formatting, naming, structure, framework choices, typing) as defined in `development-guide.md` and observed in existing code.
-   **Leverage Existing Code**: Before implementing new features, search the codebase for similar patterns or existing utilities.
-   **TypeScript First**: Always use TypeScript and ensure strong typing. Avoid `any` unless absolutely necessary.
-   **Performance Awareness**: Consider performance implications, especially for canvas operations.
-   **Testing**: Always consider how changes will be tested.
-   **Conciseness**: Keep code and explanations concise and to the point.
-   **Safety**: Prioritize safe operations, especially when modifying files or running shell commands. Explain critical commands before execution.