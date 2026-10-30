# Redline theme (Dan's T3 Code theme)

Night-garage look: carbon black and gunmetal panels, SlingMods red for the main
buttons, the thread you're in, and your own messages. Warnings are VU-meter amber,
update notices are Premiere-playhead blue. A daylight version kicks in when the
app is in light mode.

Nothing here changes T3 Code's code. It's a theme file T3 reads from its data
folder, so it survives every app update.

## Install on a machine (once per computer)

Close T3 Code first. Then, from this folder:

**Windows (PowerShell)**

```powershell
Copy-Item .\redline.json "$env:USERPROFILE\.t3\userdata\themes\redline.json" -Force
& "$env:USERPROFILE\.t3\bin\t3.cmd" theme set redline
```

**Mac (Terminal)** — needs the `t3` command (T3 Code → Settings → About → Install).

```bash
mkdir -p ~/.t3/userdata/themes && cp redline.json ~/.t3/userdata/themes/redline.json
t3 theme set redline
```

Open T3 Code. It switches to Redline on its own. If it doesn't, pick it in
**Settings → Appearance**.

## Dark vs daylight

T3 follows Windows/macOS light or dark mode. For the full night-garage look,
press **Ctrl+Alt+Shift+A** (Mac: **Cmd+Option+Shift+A**) until it says Dark, or
choose **Dark** in **Settings → Appearance**.

## Changing colors

Edit `redline.json`, then check it before installing:

```bash
node check_theme.mjs redline.json ../../packages/shared/src/themePalettes.ts
```

It must print `ALL CHECKS PASS` (every color slot filled, text readable on its
background). Copying the file into the themes folder updates a running T3 Code
live. To go back to the stock look: `t3 theme clear`, then pick a theme in
Settings → Appearance.
