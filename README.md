# BGG What to Play

This repo is deployed to https://davidhorm.github.io/bgg-what-to-play/.

Website to visualize your [BGG](https://boardgamegeek.com/) collection to better figure out which board game to play based on number of players and game length.

![What To Play demo](./public/bgg-what-to-play-demo-v1.gif)

## Getting Started

1. `pnpm install` to install all the packages
1. `pnpm dev` to start the dev server
1. Navigate to http://localhost:5173/

### Troubleshoot

If an expected game isn't showing up, then add `debug=1` to the query parameter to see the list of games as it goes through the different filters outputted to the console.

## Other Scripts

These are the other scripts defined in `package.json`.

| Script            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `pnpm build`      | Build for production.                                      |
| `pnpm preview`    | Locally preview production build.                          |
| `pnpm lint`       | Report linting and formatting errors                       |
| `pnpm lint:fix`   | Fix linting and formatting errors                          |
| `pnpm test`       | Run unit and end-to-end tests                              |
| `pnpm test:unit`  | Run unit tests in watch mode                               |
| `pnpm test:cov`   | Run unit tests with coverage reports                       |
| `pnpm test:e2e`   | Run end-to-end tests (can add `--headed` and/or `--debug`) |
| `pnpm codegen`    | Generate end-to-end tests with codegen                     |
| `pnpm run deploy` | Deploy to Github pages                                     |
