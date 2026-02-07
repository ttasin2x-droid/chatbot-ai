<div align="center">

# 🔮 iGlass AI Ultimate Pro
### The Next-Generation Client-Side AI Interface

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0.0-success.svg?style=flat-square)](https://github.com/yourusername/iglass-ai)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-orange.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Tech Stack](https://img.shields.io/badge/Tech-HTML5%20%7C%20Tailwind%20%7C%20JS-blueviolet.svg?style=flat-square)](https://tailwindcss.com/)

<p align="center">
  <img src="https://via.placeholder.com/800x400.png?text=iGlass+AI+Dashboard+Preview" alt="iGlass AI Dashboard" width="100%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  <br>
  <em>(Replace this link with an actual screenshot of your UI)</em>
</p>

<p align="center">
  <b>Immersive Glassmorphism UI</b> • <b>Multi-Model Support</b> • <b>Privacy-First Architecture</b>
</p>

</div>

---

## 📑 Table of Contents
- [Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [⚙️ Configuration & Models](#-configuration--models)
- [🛡️ Privacy & Security](#-privacy--security)
- [⌨️ Shortcuts](#-shortcuts)
- [🛠️ Tech Architecture](#-tech-architecture)
- [🤝 Contributing](#-contributing)

---

## 🔭 Overview

**iGlass AI Ultimate Pro** is a sophisticated, single-file web application designed to bridge the gap between users and powerful Large Language Models (LLMs). Built with a focus on aesthetics and functionality, it leverages a **Glassmorphism design language** to provide a distraction-free, premium environment for coding, writing, and reasoning.

Unlike traditional AI interfaces, **iGlass AI requires no backend server**. It connects directly from your browser to API providers (OpenAI, Anthropic, OpenRouter), ensuring maximum speed and privacy.

---

## ✨ Key Features

### 🧠 Intelligent Core
| Feature | Description |
| :--- | :--- |
| **Multi-Provider Support** | Seamlessly switch between **DeepSeek R1**, **GPT-4o**, **Claude 3.5 Sonnet**, and Gemini via OpenRouter. |
| **Reasoning Engine** | Visualizes the AI's **"Chain of Thought"** in a collapsible block, perfect for debugging logic or math problems. |
| **Memory Retention** | Custom "User Memory" block allows the AI to remember your preferences across sessions. |

### 🎨 Premium Interface
* **Dynamic Glassmorphism:** Real-time background mesh gradients with frosted glass effects (Backdrop Filter).
* **Canvas Mode (IDE):** A split-screen environment separating Chat from Code/Content, ideal for developers.
* **Mobile Optimized:** A fully responsive sidebar with smooth transitions and touch-friendly controls.

### 🛠️ Advanced Tools
* **📁 File System:** Drag-and-drop support for **Images**, **PDFs**, and **Code files**.
* **🎙️ Voice Suite:** Integrated **Speech-to-Text** (Input) and **Text-to-Speech** (Playback) with visual wave animations.
* **⚡ Smart Commands:** Type `/` to access a command palette (e.g., `/canvas`, `/clear`, `/summarize`).
* **📝 Syntax Highlighting:** Auto-detects code languages and provides a "Copy" button.

---

## 🚀 Quick Start Guide

**No installation, npm, or Python required.**

1.  **Download:** Get the latest `index.html` from the [Releases](#) page.
2.  **Launch:** Double-click the file to open it in any modern browser (Chrome/Edge/Brave recommended).
3.  **Authenticate:**
    * Click the **Settings (⚙️)** icon.
    * Navigate to **AI Profiles**.
    * Enter your **API Key**.
    * Click **Save**.

> **Note:** The application works offline for UI navigation, but requires an internet connection to fetch AI responses.

---

## ⚙️ Configuration & Models

To get the most out of iGlass AI, configure your profiles correctly:

### Recommended Setup (OpenRouter)
OpenRouter allows access to all major models with a single API key.

1.  **Provider:** Select `OpenRouter`.
2.  **Model ID:**
    * DeepSeek R1: `deepseek/deepseek-r1`
    * Claude 3.5: `anthropic/claude-3.5-sonnet`
    * Gemini Pro: `google/gemini-pro-1.5`
3.  **API Key:** Get it from [openrouter.ai/keys](https://openrouter.ai/keys).

### System Prompts (Personas)
You can define custom personas (e.g., "Python Expert", "Creative Writer") in the **Settings > System Persona** menu.

---

## 🛡️ Privacy & Security

We adhere to a **"Your Data, Your Control"** policy.

* ✅ **Local Storage Only:** Chat history, API keys, and settings are stored in your browser's `localStorage`.
* ✅ **Direct API Calls:** Requests are sent directly from the client to the API provider. No middleman servers intercept your data.
* ✅ **Data Export:** You can export your entire chat history to a JSON file for backup.

> ⚠️ **IMPORTANT:** Clearing your browser's cache or "Site Data" will delete your chat history. Please use the **Export** feature regularly.

---

## ⌨️ Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Cmd</kbd> + <kbd>K</kbd> | Open Command Palette |
| <kbd>/</kbd> | Quick Slash Commands |
| <kbd>Esc</kbd> | Close Sidebar / Modals |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | New Line |

---

## 🛠️ Tech Architecture

This project demonstrates the power of modern Vanilla JavaScript without build steps.

* **Core:** HTML5, CSS3, ES6+ JavaScript.
* **Styling:** Tailwind CSS (CDN) + Custom CSS Variables for Glassmorphism.
* **Libraries (CDN):**
    * `Marked.js` (Markdown Parsing)
    * `DOMPurify` (XSS Sanitization)
    * `Highlight.js` (Syntax Highlighting)
    * `KaTeX` (Mathematical Typesetting)
    * `FontAwesome` (UI Icons)

---

## 🤝 Contributing

We welcome contributions from the community!

1.  **Fork** the repository.
2.  Create a branch: `git checkout -b feature/new-feature`.
3.  Commit changes: `git commit -m 'Add amazing feature'`.
4.  Push to branch: `git push origin feature/new-feature`.
5.  Open a **Pull Request**.

---

<div align="center">

**Developed with ❤️ by iGlass AI Team**
<br>
*Simplicity is the ultimate sophistication.*

</div>
