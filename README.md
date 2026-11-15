# BS Card Game Bluff Tracker

A browser-based companion for the BS (Bullshit) card game. Track players' hands, cards in the pile, and played ranks while estimating the chance that an opponent's claim is a bluff.

## Tech stack

- HTML for the page structure (`index.html`).
- CSS for the appearance and responsive layout (`style.css`).
- Vanilla JavaScript for game state, interactions, and bluff probability calculations (`script.js`).
- Browser `localStorage` for saving the current game on the device.

There is no framework, build step, server, or external dependency.

## Features

- Track a game with 2–10 players.
- Record the cards in your own hand and keep the remaining rank counts visible.
- Log a player's claimed rank and number of cards.
- See an estimated bluff probability based on the cards and plays recorded so far.
- Resolve a challenge as a bluff, truthful play, or no challenge.
- Keep the current game saved in this browser using `localStorage`.

## Run locally

Clone or download the repository, then open `index.html` in a modern browser. You can also use VS Code's Live Server extension. Keep `index.html`, `style.css`, and `script.js` in the same folder so the page can load its stylesheet and script.

## How to use

1. Set the number of players and select which player you are, then choose **New Game**.
2. Enter the ranks in your hand. This lets the tracker account for cards you know you hold.
3. After a player makes a claim, choose the player, rank, and quantity, then select **Log**.
4. Review the estimated bluff probability and resolve the play as **Caught Bluffing**, **Accept (Truthful)**, or **Pass / No Challenge**.

Keep the player card counts and your hand accurate as the game progresses. The estimate depends on the information entered, so it can be wrong if the game state is logged incorrectly or if players' hands are not randomly distributed.

## How browser storage works

The app saves the game as JSON in your browser's `localStorage`. The `bsState` entry stores the players' remaining card counts, cards remaining by rank, the pile contents, your known hand, and any pending play. The `yourPlayerIndex` entry stores which player you selected as yourself.

The app reads these entries when it starts and saves the updated state as you use it, so refreshing or reopening the page in the same browser profile on the same device usually restores the game. This data stays in that browser profile: it is not uploaded, synced to other devices, or shared with other players. Clearing the browser's site data removes it. Use **New Game** to start a fresh game; it replaces the saved game state.

## Play online with GitHub Pages

This is a static website and can be hosted with GitHub Pages:

1. Push this repository to GitHub.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.
5. When GitHub Pages finishes publishing, copy the site URL into this section.

No build command is needed.

## Repository details

Suggested description: **A browser-based BS card game tracker and bluff probability calculator.**

Suggested topics: `card-game`, `probability`, `bluffing`, `javascript`, `github-pages`, `static-site`.

## License

No license is included yet. Until you choose one, others should assume they do not have permission to reuse, modify, or redistribute this code. Add a license if you want to grant those permissions.
