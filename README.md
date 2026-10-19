# Dayflow — Task Manager

A responsive, browser-based productivity app built with HTML, CSS, and vanilla JavaScript for Datheon Internship Task 2. It runs without a backend or server-side database.

## Features

- Create, read, edit, and delete tasks (CRUD)
- Categorize tasks as **Work**, **Personal**, or **Study**
- Add optional notes, due dates, and priority levels
- Mark tasks complete with a completion animation
- Filter by **All**, **Active**, and **Completed** status
- Search tasks and filter by category
- Sort by recently added, due date, or priority
- Summary statistics and light/dark theme
- Responsive layout for desktop and mobile
- Persist tasks with `localStorage`, using `saveToLocalStorage()` and `loadFromLocalStorage()`
- Escaped user-provided text before rendering it into the page

## Run locally

1. Download or clone this project.
2. Open `index.html` in a modern browser. For the most consistent `localStorage` behavior, use a local development server (for example, VS Code Live Server) or publish it on GitHub Pages.
3. Add a task and reload the page to check persistence.

The app has no backend dependency. `localStorage` data is scoped to the browser origin and profile, so it does not automatically sync between devices or different origins. Browser privacy settings may prevent storage from being available.

## Project files

- `index.html` — app structure and form controls
- `style.css` — responsive layout, theme, and completion animation
- `script.js` — task CRUD, filters, and local storage persistence

## Reference

- MDN Web Docs, [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- MDN Web Docs, [Window: localStorage property](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
