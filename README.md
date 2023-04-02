# BGG What to Play

This repo is deployed to https://davidhorm.github.io/bgg-what-to-play/.

Website to visualize your [BGG](https://boardgamegeek.com/) collection to better figure out which board game to play based on number of players and game length.

![What To Play demo](./public/bgg-what-to-play-demo-v1.3.gif)

## Features

- Filter by:
  - Player count
  - Playtime
  - Complexity
  - Average or User Ratings
- Hide by default, but can show:
  - Average or User Ratings
  - Expansions
  - Not recommended player counts
  - Invalid player counts
- Sort by:
  - Name
  - Player Count Recommended
  - Average Playtime
  - Complexity
  - Average or User Ratings

## Getting Started

1. `pnpm install` to install all the packages
1. `pnpm dev` to start the dev server
1. Navigate to http://localhost:5173/

### Testing with Mock Users

When developing locally, mock users have been created to help test certain scenarios:

| User | Scenario                                          |
| ---- | ------------------------------------------------- |
| 000  | Mock response for an empty collection             |
| 001  | Mock response for a collection with a single game |
| 202  | Mock response that always returns the 202 code    |

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

FYI - when running Playwright end-to-end tests, there may be flakey firefox-specific tests:

```
page.goto: NS_ERROR_CONNECTION_REFUSED
=========================== logs ===========================
navigating to "http://localhost:5173/", waiting until "load"
```

This maybe an only Windows problem. Workaround is to execute end-to-end tests with just Chrome: `pnpm test -- --project=chromium`
