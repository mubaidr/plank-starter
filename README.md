# Floor Plan Tool

This is a web-based floor plan designer application built with Next.js 15, React 19, TypeScript, Konva.js, and Tailwind CSS 4.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later) or yarn (v1 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/floor-plan-tool.git
   cd floor-plan-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
.
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js app router pages
│   ├── components/         # Reusable React components
│   │   ├── canvas/         # Konva.js related components
│   │   ├── ui/             # Generic UI components
│   │   ├── tools/          # Components for specific drawing tools
│   │   └── panels/         # Side/bottom panels
│   ├── context/            # React Context API providers
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles (Tailwind CSS)
├── docs/                   # Project documentation
│   └── llm/                # Documentation specifically for LLM agents
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
└── package.json            # Project dependencies and scripts
```

## Key Technologies

- **Next.js 15**: React framework for production.
- **React 19**: JavaScript library for building user interfaces.
- **TypeScript**: Superset of JavaScript that adds static typing.
- **Konva.js**: HTML5 Canvas JavaScript framework for 2D transformations on shapes.
- **Tailwind CSS 4**: A utility-first CSS framework for rapidly building custom designs.

## Contributing

Contributions are welcome! Please follow the [development guidelines](docs/llm/development-guide.md) and submit pull requests.

## License

[MIT License](LICENSE)