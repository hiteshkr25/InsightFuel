# Contributing to InsightFuel

We welcome contributions to our SaaS analytics platform! To maintain code reliability and style alignment:

---

## Coding Guidelines

1.  **TypeScript Standards:**
    *   Expose fully-typed interface parameters.
    *   Do not disable the compiler by using type `any` configurations.
2.  **Linting Rules:**
    *   Verify code formatting conforms to Prettier configurations:
        `pnpm exec prettier --write "**/*.{ts,tsx,json}"`
    *   Ensure double quotes are converted to single quotes:
        `pnpm run lint`

---

## Pull Request Submission Flow

1.  Create a descriptive branch name mapping your focus (e.g. `feature/circuit-breakers`).
2.  Ensure both backend pytests and frontend vitest suites pass:
    `pnpm run test`
3.  Submit a Pull Request linking to target issues.
