# SyntaxMaruf Portfolio 🌿

I am Maruf Billah, a Computer Science and Engineering student at Daffodil International University.
First year, 3rd semester.

Idea is mine, implemented with AI support.

## 🌐 Live website
https://syntaxmaruf.github.io/

## 📓 ProgressDiary
Open `progressdiary.html` from the portfolio. The original design, P-and-arrow mark, weekly planner, daily log, reports, motivation, settings, history and backups are kept.

This GitHub Pages edition starts empty. It does not use ChatGPT login or a server database. Records are saved in this browser only. Anyone with access to the same browser can open them. Clearing browser data removes the diary. Different devices have separate records. Download regular JSON backups. History & backups includes Import backup. Complete original ChatGPT v3 and browser v1 JSON backups are supported. Imports add new dates and keep existing dates unchanged. Replacing the current profile and weekly routine is optional. Files are validated and processed on this device.

## 🛠 Edit the website
- `index.html`: home page and sections.
- `styles.css`, `premium.css`, `readability.css`: responsive design and readable text.
- `data.js`: project information and links.
- `app.js`: project explorer, search and filters.
- `motion.js`: animation controls.
- `ProgressDiary-source.zip`: editable React and TypeScript source for the diary.

To rebuild the diary, extract its source, run `npm ci`, then `npx esbuild main.tsx --bundle --minify --jsx=automatic --outfile=diary.js`. Copy the stylesheet and public images beside the output; adjust image paths for the publishing directory.

## ✅ Checks
Profile and daily record saving, stale edit protection, archive, history restore and complete backup were tested with separate temporary data. No old personal records were imported.
