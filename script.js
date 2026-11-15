// ----- state management -----
        const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        let state = loadState();
        let yourPlayerIndex = parseInt(localStorage.getItem('yourPlayerIndex')) || 0;

        function defaultState(playerCount = 4) {
            const totalCards = 52;
            const base = Math.floor(totalCards / playerCount);
            const remainder = totalCards % playerCount;
            const players = Array(playerCount).fill(base);
            for (let i = 0; i < remainder; i++) {
                players[i] += 1;
            }
            const cardsRemaining = {};
            RANKS.forEach(r => cardsRemaining[r] = 4);
            const pileContents = {};
            RANKS.forEach(r => pileContents[r] = 0);
            const yourHand = {};
            RANKS.forEach(r => yourHand[r] = 0);
            return { players, cardsRemaining, lastPlay: null, pile: 0, pileContents, yourHand };
        }

        function loadState() {
            try {
                const raw = localStorage.getItem('bsState');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed.players && parsed.cardsRemaining && typeof parsed.cardsRemaining === 'object') {
                        if (parsed.pile === undefined) parsed.pile = 0;
                        if (!parsed.pileContents) {
                            const pileContents = {};
                            RANKS.forEach(r => pileContents[r] = 0);
                            parsed.pileContents = pileContents;
                        }
                        if (!parsed.yourHand) {
                            const yourHand = {};
                            RANKS.forEach(r => yourHand[r] = 0);
                            parsed.yourHand = yourHand;
                        }
                        return parsed;
                    }
                }
            } catch (_) { }
            return defaultState(4);
        }

        function saveState() {
            localStorage.setItem('bsState', JSON.stringify(state));
            localStorage.setItem('yourPlayerIndex', yourPlayerIndex);
        }

        // ----- probability engine with POV -----
        function combinations(n, k) {
            if (k < 0 || k > n) return 0;
            if (k === 0 || k === n) return 1;
            let res = 1;
            for (let i = 1; i <= k; i++) {
                res = res * (n - i + 1) / i;
            }
            return res;
        }

        function calculateBluffProb(playerIndex, claimedRank) {
            // Get total unknown cards (all hands)
            let totalUnknown = state.players.reduce((a, b) => a + b, 0);

            // If this is NOT the player's own POV, subtract your known cards
            if (playerIndex !== yourPlayerIndex) {
                const yourTotal = Object.values(state.yourHand || {}).reduce((a, b) => a + b, 0);
                totalUnknown = totalUnknown - yourTotal;
            }

            if (totalUnknown <= 0) return 0;

            const handSize = state.players[playerIndex];
            if (handSize === 0) return 0;

            // Available cards of this rank - subtract what YOU have
            let available = state.cardsRemaining[claimedRank] || 0;

            // If calculating for another player, subtract your known cards of this rank
            if (playerIndex !== yourPlayerIndex) {
                available = available - (state.yourHand[claimedRank] || 0);
            }

            available = Math.max(0, available);

            // If there are 0 available, check the pile
            if (available === 0) {
                const pileCount = state.pileContents ? state.pileContents[claimedRank] || 0 : 0;
                if (pileCount > 0) {
                    return 100;
                }
                return 100;
            }

            const probZero = combinations(totalUnknown - available, handSize) / combinations(totalUnknown, handSize);
            const bluff = (1 - probZero) * 100;
            return Math.min(100, Math.max(0, Math.round(bluff)));
        }

        // ----- UI update -----
        function updateUI() {
            // Update "You are" selector
            const youSelect = document.getElementById('youSelect');
            youSelect.value = yourPlayerIndex;

            // Ranks - show deck + your hand + pile = 52 total
            const ranksContainer = document.getElementById('ranks');
            ranksContainer.innerHTML = RANKS.map(r => {
                const deckCount = state.cardsRemaining[r] ?? 0;
                const pileCount = state.pileContents ? state.pileContents[r] || 0 : 0;
                const yourCount = state.yourHand ? state.yourHand[r] || 0 : 0;
                const total = deckCount + pileCount + yourCount;
                let countClass = '';
                if (total === 0) countClass = 'zero';
                else if (total <= 1) countClass = 'low';
                // Show the dominant indicator
                let indicator = '·';
                if (deckCount > 0) indicator = '♠';
                else if (yourCount > 0) indicator = '🙋';
                else if (pileCount > 0) indicator = '📦';
                return `
        <div class="rank-box">
          <span class="rank-symbol">${r}</span>
          <span class="rank-count ${countClass}">${total}</span>
          <span class="suit-indicator">${indicator}</span>
        </div>
      `;
            }).join('');

            // Your hand editor
            const handInputs = document.getElementById('handInputs');
            handInputs.innerHTML = RANKS.map(r => {
                const count = state.yourHand ? state.yourHand[r] || 0 : 0;
                return `
          <div class="rank-input">
            <span>${r}</span>
            <input type="number" id="hand_${r}" value="${count}" min="0" max="4" 
                   onchange="updateYourHand('${r}', this.value)">
          </div>
        `;
            }).join('');

            const yourTotal = Object.values(state.yourHand || {}).reduce((a, b) => a + b, 0);
            document.getElementById('handTotal').textContent = `(${yourTotal} cards)`;

            // Players
            const playersContainer = document.getElementById('players');
            playersContainer.innerHTML = state.players.map((count, i) => {
                const isYou = i === yourPlayerIndex;
                const bluffProb = calculateBluffProb(i, 'A');
                const probDisplay = isYou ? 'YOU' : `${bluffProb}%`;
                const probColor = isYou ? '#4caf84' :
                    bluffProb > 60 ? '#e6b86a' :
                        bluffProb > 30 ? '#d4a040' : '#4caf84';
                return `
        <div class="player-card ${isYou ? 'you' : ''}">
          <span class="player-name">
            🃏 Player ${i + 1} 
            <span style="color:#9aaec9;font-size:0.85rem;">(${count} cards)</span>
            ${isYou ? '<span class="player-badge">YOU</span>' : ''}
          </span>
          <div class="opponent-prob">
            ${isYou ? '<span class="you-tag">Your hand</span>' : `
              <span style="color:${probColor};font-weight:600;">${probDisplay}</span>
              <div class="prob-bar-small">
                <div class="fill" style="width: ${bluffProb}%;background:${probColor};"></div>
              </div>
            `}
          </div>
        </div>
      `;
            }).join('');

            // Selects
            const pSel = document.getElementById('playerSelect');
            pSel.innerHTML = state.players.map((_, i) => `<option value="${i}">Player ${i + 1}</option>`).join('');

            const rSel = document.getElementById('rankSelect');
            rSel.innerHTML = RANKS.map(r => `<option value="${r}">${r}</option>`).join('');

            // Last play
            const lastPlaySummary = document.getElementById('lastPlaySummary');
            const lastPlayDisplay = document.getElementById('lastPlayDisplay');
            const pendingWarning = document.getElementById('pendingWarning');

            if (state.lastPlay) {
                const lp = state.lastPlay;
                const playerName = `Player ${lp.player + 1}`;
                lastPlaySummary.textContent = `${playerName} · ${lp.qty}× ${lp.rank}`;
                lastPlayDisplay.innerHTML = `📌 Active: <span class="inline-code">${playerName}</span> claimed <strong>${lp.qty}× ${lp.rank}</strong>`;
                pendingWarning.style.display = 'inline-block';

                const bluffProb = calculateBluffProb(lp.player, lp.rank);
                const isYou = lp.player === yourPlayerIndex;
                const bluffText = isYou ? 'You are playing this hand' :
                    bluffProb > 60 ? '🔴 High chance of bluffing!' :
                        bluffProb > 30 ? '🟡 Moderate chance' :
                            bluffProb > 0 ? '🟢 Likely truthful' : '🟢 Very likely truthful';
                document.getElementById('probExample').innerHTML = `
        📊 <strong>${isYou ? 'Your play' : 'Bluff probability for this play'}:</strong> 
        ${isYou ? 'You know what you have!' : `${bluffProb}% ${bluffText}`}
        ${bluffProb === 100 && !isYou ? ' ⚠️ ALL cards of this rank are accounted for - definitely bluffing!' : ''}
        ${bluffProb === 0 && state.cardsRemaining[lp.rank] > 0 && !isYou ? ' 📈 Many of this rank available - likely truthful' : ''}
      `;
            } else {
                lastPlaySummary.textContent = '—';
                lastPlayDisplay.innerHTML = '⏳ No active play';
                pendingWarning.style.display = 'none';
                document.getElementById('probExample').innerHTML = '📊 Log a play to see the bluff probability';
            }

            // Pile
            const totalPile = Object.values(state.pileContents || {}).reduce((a, b) => a + b, 0);
            state.pile = totalPile;
            document.getElementById('pileDisplay').textContent = `📦 Pile: ${totalPile}`;

            saveState();
        }

        // ----- Hand management - FIXED! -----
        function updateYourHand(rank, value) {
            let count = parseInt(value) || 0;
            // Clamp between 0 and 4
            count = Math.max(0, Math.min(4, count));
            state.yourHand[rank] = count;
            // Update the input display
            document.getElementById(`hand_${rank}`).value = count;

            // Recalculate deck: total 4 cards per rank - your hand - pile = deck
            const pileCount = state.pileContents ? state.pileContents[rank] || 0 : 0;
            state.cardsRemaining[rank] = Math.max(0, 4 - count - pileCount);

            updateUI();
        }

        function resetYourHand() {
            // Reset hand to 0 and restore deck to 4 minus pile
            RANKS.forEach(r => {
                state.yourHand[r] = 0;
                const pileCount = state.pileContents ? state.pileContents[r] || 0 : 0;
                state.cardsRemaining[r] = Math.max(0, 4 - pileCount);
            });
            updateUI();
        }

        // ----- Internal function to auto-resolve a pending play as "Pass" -----
        function autoResolvePending() {
            if (!state.lastPlay) return false;

            const { player, rank, qty } = state.lastPlay;

            // Auto-accept as truthful (Pass / No Challenge)
            state.players[player] = Math.max(0, state.players[player] - qty);
            const available = state.cardsRemaining[rank] || 0;
            const remove = Math.min(qty, available);
            state.cardsRemaining[rank] = available - remove;
            if (!state.pileContents) {
                state.pileContents = {};
                RANKS.forEach(r => state.pileContents[r] = 0);
            }
            state.pileContents[rank] = (state.pileContents[rank] || 0) + remove;

            state.lastPlay = null;
            return true;
        }

        // ----- game actions -----
        function initGame() {
            const count = parseInt(document.getElementById('playerCount').value, 10);
            if (count < 2 || count > 10) return;
            yourPlayerIndex = parseInt(document.getElementById('youSelect').value, 10);
            state = defaultState(count);
            state.lastPlay = null;
            state.pile = 0;
            updateUI();
        }

        function logPlay() {
            // If there's a pending play, auto-resolve it as "Pass" first
            if (state.lastPlay) {
                autoResolvePending();
                const lastPlayDisplay = document.getElementById('lastPlayDisplay');
                lastPlayDisplay.innerHTML = '🔄 Previous play auto-resolved as Pass';
                setTimeout(() => {
                    if (!state.lastPlay) {
                        lastPlayDisplay.innerHTML = '⏳ No active play';
                    }
                }, 1500);
            }

            const playerIdx = parseInt(document.getElementById('playerSelect').value, 10);
            const rank = document.getElementById('rankSelect').value;
            const qty = parseInt(document.getElementById('qtyInput').value, 10);
            if (qty < 1 || qty > 4) {
                alert('Quantity must be between 1 and 4.');
                return;
            }

            // If YOU are playing, check your hand
            if (playerIdx === yourPlayerIndex) {
                const youHave = state.yourHand[rank] || 0;
                if (youHave < qty) {
                    alert(`You only have ${youHave} ${rank}(s) in your hand!`);
                    return;
                }
                // Remove from your known hand
                state.yourHand[rank] = youHave - qty;
                // Update deck: 4 - yourHand - pile
                const pileCount = state.pileContents ? state.pileContents[rank] || 0 : 0;
                state.cardsRemaining[rank] = Math.max(0, 4 - state.yourHand[rank] - pileCount);
                // Update the hand display
                document.getElementById(`hand_${rank}`).value = state.yourHand[rank];
            } else {
                if (state.players[playerIdx] < qty) {
                    alert(`Player ${playerIdx + 1} only has ${state.players[playerIdx]} cards.`);
                    return;
                }
            }

            state.lastPlay = { player: playerIdx, rank, qty };
            updateUI();
        }

        function clearPendingPlay() {
            if (!state.lastPlay) return;
            state.lastPlay = null;
            updateUI();
        }

        function resolveChallenge(wasBluff) {
            if (!state.lastPlay) {
                alert('No active play to resolve.');
                return;
            }
            const { player, rank, qty } = state.lastPlay;

            if (wasBluff) {
                // Bluff: player takes the pile + their fake cards
                if (state.pileContents) {
                    const pileSize = Object.values(state.pileContents).reduce((a, b) => a + b, 0);
                    state.players[player] += pileSize + qty;

                    // Return pile contents to the deck (they're back in someone's hand)
                    RANKS.forEach(r => {
                        state.cardsRemaining[r] = (state.cardsRemaining[r] || 0) + (state.pileContents[r] || 0);
                        state.pileContents[r] = 0;
                    });
                    state.pile = 0;
                } else {
                    state.players[player] += qty;
                }
            } else {
                // Truthful: remove from hand, remove from deck, add to pile
                state.players[player] = Math.max(0, state.players[player] - qty);
                const available = state.cardsRemaining[rank] || 0;
                const remove = Math.min(qty, available);
                state.cardsRemaining[rank] = available - remove;
                if (!state.pileContents) {
                    state.pileContents = {};
                    RANKS.forEach(r => state.pileContents[r] = 0);
                }
                state.pileContents[rank] = (state.pileContents[rank] || 0) + remove;
            }

            state.lastPlay = null;
            updateUI();
        }

        // attach to window
        window.initGame = initGame;
        window.logPlay = logPlay;
        window.clearPendingPlay = clearPendingPlay;
        window.resolveChallenge = resolveChallenge;
        window.updateYourHand = updateYourHand;
        window.resetYourHand = resetYourHand;

        // initial render
        updateUI();

        document.addEventListener('DOMContentLoaded', function () {
            if (!state.lastPlay) {
                document.getElementById('lastPlayDisplay').innerHTML = '⏳ No active play';
                document.getElementById('lastPlaySummary').textContent = '—';
                document.getElementById('pendingWarning').style.display = 'none';
            }

            document.getElementById('youSelect').addEventListener('change', function () {
                yourPlayerIndex = parseInt(this.value, 10);
                updateUI();
            });
        });
