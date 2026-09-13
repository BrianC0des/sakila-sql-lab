# ⚡ SQL Studio

> A 100% browser-based, zero-login, interactive SQL learning lab and practice sandbox powered by in-memory SQLite WebAssembly.

🌐 **Live Demo:** [https://sakila-sql-lab.vercel.app](https://sakila-sql-lab.vercel.app)

---

## ✨ Features

- **🚀 100% Client-Side & Private**: Runs entirely in the browser using official `sql.js` (SQLite compiled to WebAssembly). No backend servers, no database credentials required, zero tracking.
- **📚 36 Curated Progressive Milestones**:
  - **Beginner**: SELECT, WHERE, ORDER BY, LIMIT, LIKE, DISTINCT, BETWEEN, IN, NULL checks.
  - **Intermediate**: GROUP BY, HAVING, INNER JOIN, LEFT JOIN, Aggregations, CASE WHEN, Subqueries.
  - **Advanced**: Multi-table 5-way joins, self-joins, date aggregations, LEFT JOIN traps.
- **🗄️ Instant Database Switcher**:
  - **🎬 Sakila (DVD Rental)**: 8 relational tables with 36 curated milestones.
  - **📦 Northwind (Retail & Orders)**: 6 tables with commerce seed data and automated exploration milestones.
  - **🌍 World (Geography & Demographics)**: 3 tables (`country`, `city`, `country_language`) with demographic metrics.
  - **📂 Custom File Upload**: Drag & drop any `.db`, `.sqlite`, `.sqlite3`, or `.sql` file to practice queries on any schema instantly.
- **🏷️ Difficulty Filter Pills**: Filter questions instantly by *All*, *Beginner*, *Intermediate*, *Advanced*, and *Custom*.
- **📱 Fully Responsive & Device Adaptable**:
  - Desktop: Resizable split-pane layout with draggable divider.
  - Mobile & Tablet: Automatic single-pane layout with smooth off-canvas milestone drawer.
- **📖 Comprehensive SQL Cheat Sheet**: Conceptual query execution order, 5 classic academic exam traps, 7 core query shapes, and live schema viewer.
- **🤖 AI Prompt & Batch Question Generator**: Export structured prompts to ChatGPT, Claude, or Gemini to generate custom batches (5, 10, 15, or 20 questions) tailored to your active schema.
- **🎓 Interactive Spotlight Tour**: 6-step guided walkthrough for first-time learners.
- **✨ Built-in Prettier SQL Formatter**: Automatic keyword capitalization and clean indentation.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database Engine:** [sql.js](https://sql.js.org/) (SQLite WebAssembly)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Formatter:** [sql-formatter](https://github.com/sql-formatter-org/sql-formatter)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js 20+)

### Installation

```bash
# Clone the repository
git clone https://github.com/BrianC0des/sakila-sql-lab.git
cd sakila-sql-lab

# Install dependencies
bun install

# Start local development server
bun run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📦 Production Build

```bash
bun run build
bun run preview
```

---

## 📄 License

MIT © [Brian Saavedra](https://github.com/BrianC0des)
