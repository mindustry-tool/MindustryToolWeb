You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind, Zod/v4-mini.

Always use these skills:
- Caveman

Code Style and Structure

- Project is a monorepo using pnpm workspaces.
- Write concise, technical TypeScript code with accurate examples.
- Prefer type over interface most of the time unless type is not possible
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling, use shadcn color in globals.css instead of tailwind default color.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.
- Use modern and minimal styles, make sure UI look good in both light and dark mode
- Size should be small, don't use too large padding or margin

Performance Optimization

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

Key Conventions

- Use 'nuqs' for URL search parameter state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
  - Favor server components and Next.js SSR.
  - Use only for Web API access in small components.
  - Avoid for data fetching or state management.

For API

- All api endpoint is defined in packages/api
- After create new api endpoint, you need to add it to the list in packages/api/routes
- When using api, you must use imported apiInstance
- You must use apiInstance to call api endpoint with .request() when using with react-query, otherwise use .tryRequest()

Follow Next.js docs for Data Fetching, Rendering, and Routing.
