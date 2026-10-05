# LeadSortix AI – Smart Lead Qualifier & Action Router
### Product Landing Page & Interactive Showcase Website

> **Transform Static Website Leads into Instant Emergency Calls & Automated Calendar Bookings.**

This repository contains the production-ready, ultra-modern product landing page and interactive showcase website for **LeadSortix AI** – the WordPress plugin that intercepts form submissions across Contact Form 7, Elementor Forms, WPForms, and Forminator, triaging lead urgency in <350ms across 5 top AI models.

---

## ✨ Features & Architecture

- **Theme & Aesthetic:** Deep Space Slate (`#090d16`) & Obsidian (`#0f172a`) with subtle glassmorphic borders and neon emergency accents (`#f97316`, `#ef4444`).
- **Interactive Lead Triage Simulator:**
  - Real-time multi-provider latency benchmarking (Groq, Google Gemini, OpenAI ChatGPT, Anthropic Claude, xAI Grok, Offline Heuristic Parser).
  - Circular SVG score gauge (0 to 100).
  - Dynamic dual-action routing cards (Emergency hotline auto-dialer vs. automated Cal.com / Calendly consultation booking).
  - Developer raw REST JSON payload inspector.
- **Universal Zero-Config Form Interceptor:** Out-of-the-box compatibility showcase for Forminator, Contact Form 7, Elementor Forms, WPForms, Fluent Forms, Gravity Forms, Ninja Forms, Formidable Forms, and REST Webhooks.
- **Multi-Provider AI Brain Grid:** Comparison cards with latency metrics and offline fallback guarantees.
- **Enterprise Security Hardening:** Dual-mode REST authentication (WordPress Nonces + Bearer headers), transient rate limiting, anti-formula CSV injection (DDE protection), and 100% GDPR compliance (zero tracking, zero remote Google fonts).
- **Zero Render-Blocking External Requests:** Built with pure semantic HTML5, modern CSS tokens, vanilla JavaScript, and native System UI typography for instantaneous load times.

---

## 🚀 Quick Start (Local Development)

To run the landing page locally:

```bash
# Clone the repository
git clone https://github.com/webcraftcode/LeadSortix-AI-website.git

# Navigate into directory
cd LeadSortix-AI-website

# Start the zero-dependency local static server
node server.js
```

Then open your browser at **`http://localhost:3030/`**.

---

## 📂 Project Structure

```
├── index.html            # Main semantic landing page
├── css/
│   └── style.css         # Design system, CSS tokens, glassmorphism, responsive queries
├── js/
│   ├── simulator.js      # Live multi-provider lead triage simulator engine
│   └── main.js           # Navigation, drawer toggle, FAQ accordion, clipboard helpers
├── server.js             # Lightweight zero-dependency static HTTP server (Port 3030)
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

---

## 📄 License & Attribution

- **License:** Open source under the [GNU General Public License v2 or later](LICENSE).
- **Developed by:** [wpemran](https://github.com/wpemran) / [webcraftcode](https://github.com/webcraftcode).
- **Plugin Repository:** [LeadSortix-AI on GitHub](https://github.com/webcraftcode/LeadSortix-AI).
