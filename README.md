# rakheeb.vercel.app

> A Windows 95–themed chat portfolio — because every good quant needs a retro terminal.

## About

A pixel-perfect Win95 desktop experience where all my info lives inside a single chat window. Type commands to explore — just like a retro terminal, but with beveled borders and gradient title bars.

**Live:** [rakheebshaik.vercel.app](https://rakheebshaik.vercel.app)

## Commands

| Command | What it does |
|---------|-------------|
| `/about` | Who I am, what I do, quick facts |
| `/systems` | My algorithmic trading systems with details |
| `/stack` | Full tech stack — languages, frameworks, tools |
| `/resume` | Work experience timeline |
| `/contact` | All my links — GitHub, LinkedIn, email |
| `/help` | List of available commands |

## Features

- **Boot sequence** — typewriter-effect Win95 startup (click/key to skip)
- **Teal desktop** with draggable speech bubble icon
- **Chat window** with gradient title bar, menu dropdowns, and status bar
- **Message bubbles** — yellow system bubbles, blue user bubbles
- **Typing cursor** — blinks between messages as they load one by one
- **Command chips** — tap to explore without typing
- **Autocomplete** — start typing `/` for command suggestions
- **Menu dropdowns** — File, View, Help with Win95-style dropdowns
- **Easter egg** — double-click "2003" in the status bar
- **Mobile responsive** — full-screen chat window on phones

## Tech

- **HTML/CSS/JS** — no frameworks, no build step
- **VT323 + IBM Plex Mono** — pixel font meets monospace
- **Win95 bevel styling** — `#c0c0c0`, `#808080`, `#000080` and all the classics

## Deploy

Just push to `main` — Vercel auto-deploys on every commit.

```bash
git add .
git commit -m "your change"
git push
```

## License

MIT
