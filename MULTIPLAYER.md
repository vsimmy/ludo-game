# Testing multiplayer locally

The game syncs state between browser tabs/windows via a WebSocket server
(`ws-server.js`). This is a "shared state broadcast" setup for local/offline
testing — every connected client mirrors the same full game state. It is
**not** an authoritative server: there's no per-connection identity, no
room/session isolation, and no server-side move validation. Anyone connected
can act as any color, and there's only ever one shared game per running
server. That's the gap to close before this is ready for a public,
shareable-URL production setup.

## 1. Start the WebSocket server

In one terminal:

```
npm run ws
```

This starts `ws-server.js` on `ws://localhost:8080`. You should see:

```
running socket
```

Leave this running for the rest of the session.

## 2. Start the app

In a second terminal:

```
npm start
```

This opens the app at `http://localhost:3000`.

(Or run both at once with `npm run dev`, which runs the two scripts above
together — useful day-to-day, but running them in separate terminals makes
it easier to see server-side logs like `new client` / `Client disconnected`
while you test.)

## 3. Open multiple clients

Open `http://localhost:3000` in two or more browser tabs, windows, or even
different browsers on the same machine. Each one connects to the same
`ws://localhost:8080` server by default.

Look for the small connection status line under the dice roll panel:

- `🟢 Synced with other players` — connected and syncing
- `⚪ Offline (multiplayer: ...)` — not connected (check the server is
  running and nothing else is using port 8080)

## 4. Play across tabs

Complete player setup and start a game in **one** tab. Once `gameStarted`
is true, that tab's full game state (piece positions, turn, roll, round,
winner, etc.) broadcasts to every other connected tab automatically.

In the other tab(s), the board should update to match within a moment —
rolling the dice or moving a piece in either tab reflects in both.

**Note on turn enforcement**: because every connected client mirrors the
same shared state, there's currently no restriction tying a specific
browser tab to a specific color. Any tab can roll or move pieces for
whichever color's turn it currently is — there's no "this is your color,
you can't touch the others" enforcement across separate clients yet. For
local testing this is fine (it's effectively a shared screen you're passing
control between manually); it's one of the things a "secure, shareable URL"
version would need to add (per-connection identity + server-side
enforcement of whose turn it is).

## 5. Testing on other devices on your network

To test from a phone or another computer on the same local network:

1. Find your machine's local IP (e.g. `192.168.1.23`).
2. Set the app to point at your machine's IP instead of `localhost` for the
   WebSocket connection:
   ```
   REACT_APP_WS_URL=ws://192.168.1.23:8080 npm start
   ```
3. On the other device, browse to `http://192.168.1.23:3000`.

Your machine's firewall may need to allow inbound connections on ports 3000
and 8080 for this to work.

## Troubleshooting

- **Status stuck on "Offline"**: confirm `npm run ws` is actually running
  and didn't error out (check that terminal). Also confirm nothing else on
  your machine is already using port 8080.
- **One tab's moves aren't showing up in the other**: check both tabs show
  the 🟢 connected indicator. If only one is connected, the other tab won't
  receive or send updates.
- **Server crashed with a port-in-use error**: something else is already
  listening on 8080 — stop that process, or change the port in
  `ws-server.js` and update `REACT_APP_WS_URL` to match.
