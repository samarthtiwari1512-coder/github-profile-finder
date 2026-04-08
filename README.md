# 🔍 GitHub Profile Finder

A web app to search GitHub profiles, explore repositories, compare developers side by side, and visualise language distribution — all in one place.

> 🚀 **Live Demo:** [Click here to try it](https://github-finder-sam.netlify.app)

---

## ✨ Features

- **Profile Search** — Search any GitHub username and instantly see their profile, bio, location, and stats
- **Repository Explorer** — View top repositories sorted by stars with descriptions and fork counts
- **Language Chart** — Interactive doughnut chart showing language distribution across all repos
- **Compare Two Users** — Search two developers side by side and see who wins on followers, stars, and repos
- **Search History** — Recently searched profiles saved locally, clickable to re-search instantly
- **Fully Responsive** — Works on mobile, tablet, and desktop

---

## 📸 Screenshots

<img width="1898" height="864" alt="image" src="https://github.com/user-attachments/assets/8bdfee72-9c2f-49c2-adcf-ea3de9483f7e" />


---

## 🛠️ Built With

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| JavaScript (Vanilla) | Logic, API calls, DOM manipulation |
| GitHub REST API | Fetching user and repo data |
| Chart.js | Language distribution doughnut chart |
| localStorage | Persisting search history |

---

## 🚀 Getting Started

### Run locally

1. Clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/github-profile-finder.git
   ```

2. Open the project folder
   ```bash
   cd github-profile-finder
   ```

3. Open `index.html` in your browser — no server or install needed!

---

## 📡 API Used

This project uses the free [GitHub REST API](https://docs.github.com/en/rest).

- `GET https://api.github.com/users/{username}` — Profile data
- `GET https://api.github.com/users/{username}/repos` — Repository list

> **Note:** The GitHub API allows 60 requests/hour for unauthenticated users. No API key required.

---

## 💡 What I Learned

- How to work with REST APIs using `fetch()` and `async/await`
- Handling multiple API calls simultaneously with `Promise.all()`
- Rendering dynamic UI by manipulating the DOM with JavaScript
- Storing and retrieving data with `localStorage`
- Building charts with Chart.js
- Writing responsive layouts with CSS Grid and Flexbox

---

## 🔮 Future Improvements

- [ ] Add GitHub OAuth so users can see private repo stats
- [ ] Show contribution heatmap (activity graph)
- [ ] Export profile as a shareable card/image
- [ ] Add organisation search support

---

## 👤 Author


- GitHub: @samarthtiwari1512-coder](https://github.com/samarthtiwari1512-coder)
- LinkedIn: [Samarth Tiwari](www.linkedin.com/in/samarth-tiwari-28546a28a)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
