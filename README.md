# BS Card Game Bluff Tracker

A browser-based companion for the BS (Bullshit) card game. Track players' hands, cards in the pile, and played ranks while estimating the chance that an opponent's claim is a bluff.

## Features

- Track a game with 2–10 players.
- Record the cards in your own hand and keep the remaining rank counts visible.
- Log a player's claimed rank and number of cards.
- See an estimated bluff probability based on the cards and plays recorded so far.
- Resolve a challenge as a bluff, truthful play, or no challenge.
- Keep the current game saved in this browser using `localStorage`.

## Play online

This is a static website and can be hosted with GitHub Pages. After enabling Pages for the repository, add the published site URL here.

## Run locally

No build tools or dependencies are needed. Clone or download the repository, then open `index.html` in a modern browser. You can also use VS Code's Live Server extension if you prefer to serve it locally.

## How to use

1. Set the number of players and select which player you are, then choose **New Game**.
2. Enter the ranks in your hand. This lets the tracker account for cards you know you hold.
3. After a player makes a claim, choose the player, rank, and quantity, then select **Log**.
4. Review the estimated bluff probability and resolve the play as **Caught Bluffing**, **Accept (Truthful)**, or **Pass / No Challenge**.

Keep the player card counts and your hand accurate as the game progresses. The estimate depends on the information entered, so it can be wrong if the game state is logged incorrectly or if players' hands are not randomly distributed.

## Data and privacy

The game state is stored in the browser's local storage on the device where you play. It is not synced between devices or players, and this project has no server or account system. Clearing the browser's site data will remove the saved game.

## Deploy with GitHub Pages

1. Push this repository to GitHub.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.
5. When GitHub Pages finishes publishing, copy the site URL into the **Play online** section above.

Because the app is a single HTML file, no build command or framework setup is required.

## Repository details

Suggested description: **A browser-based BS card game tracker and bluff probability calculator.**

Suggested topics: `card-game`, `probability`, `bluffing`, `javascript`, `github-pages`, `static-site`.

## License

No license is included yet. Until you choose one, others should assume they do not have permission to reuse, modify, or redistribute this code. Add a license if you want to grant those permissions.
