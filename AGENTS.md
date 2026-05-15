# Project Tools

## Yarn

This project uses Yarn Modern for JS package management and running project-wide scripts.

- To install dependencies, run `yarn install` in the root directory.
- To execute scripts defined in the `package.json`, use `yarn <script-name>`. Scripts containing a colon (e.g., `yarn build:frontend`) can be run directly without needing to specify the workspace.
- To execute remote packages in a temporary environment, use `yarn dlx`.
- Do NOT execute any project-modifying `npm` or `pnpm` commands.