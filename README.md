# 💎 iGlass AI Ultimate Pro

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Platform](https://img.shields.io/badge/platform-Web-orange.svg)

**iGlass AI Ultimate Pro** is a next-generation, **single-file** AI interface designed for power users, developers, and creatives. Built with a stunning **Glassmorphism UI**, it brings the power of models like **DeepSeek R1**, **GPT-4o**, and **Claude 3.5** directly to your browser without needing a backend server.

> 🚀 **No Installation Required:** Just open the file in your browser, add your API key, and start chatting.

---

## ✨ Key Features (Highlights)

### 🧠 Advanced AI Reasoning
* **Multi-Model Support:** Seamlessly switch between OpenRouter, OpenAI, and Anthropic models.
* **Thinking Process Visualization:** See exactly *how* the AI is solving problems with the collapsible **"Thinking Process"** box (optimized for DeepSeek R1 & Reasoning models).
* **Real-Time Streaming:** Enjoy smooth, typewriter-style text generation.

### 🎨 Premium Interface
* **Glassmorphism Design:** A beautiful, translucent UI with dynamic mesh gradients and blur effects.
* **Responsive Sidebar:** A fully optimized mobile sidebar with **backdrop blur** (z-index optimized) for a native app feel.
* **Canvas Mode:** A dedicated **split-screen editor** for writing code or documents while chatting side-by-side.

### 🛠️ Power Tools
* **📁 File Attachments:** Drag-and-drop support for **Images**, **PDFs**, and **Text files**.
* **🎤 Voice Interaction:** Built-in **Speech-to-Text** (Input) and **Text-to-Speech** (Read Aloud).
* **⚡ Slash Commands:** Type `/` to access quick actions like `/code`, `/clear`, or `/canvas`.
* **📝 Syntax Highlighting:** Automatic code highlighting with a "Copy" button for developers.
* **🧮 Math Support:** Renders complex mathematical equations using KaTeX (LaTeX).

---

## 🚀 Installation & Setup

### Prerequisite
You only need a modern web browser (Chrome, Edge, Safari, Firefox). **No Node.js or Python required.**

### Step-by-Step Guide

1.  **Download:** Save the `index.html` file to your computer.
2.  **Open:** Double-click the file to open it in your browser.
3.  **Configure API:**
    * Click the **Settings (⚙️)** icon in the sidebar (or bottom menu on mobile).
    * Scroll to **"AI Profiles"**.
    * Click **+ Add Profile**.
    * **IMPORTANT:** Enter your **API Key** (e.g., from [OpenRouter](https://openrouter.ai/) or OpenAI).
    * Select your model (e.g., `deepseek/deepseek-r1:free`).
    * Click **Save**.

> 💡 **Pro Tip:** You can create multiple profiles (e.g., one for Coding, one for Creative Writing) and switch between them instantly from the header.

---

## 🎮 Usage Guide

### 1. Canvas Mode (Split Screen)
Perfect for coding or writing long articles.
* **To Activate:** Click the "Canvas Mode" button in the sidebar or type `/canvas`.
* **Left Side:** Your chat conversation.
* **Right Side:** A dedicated editor.
* **Actions:** You can **Copy** or **Download** the content from the editor directly.

### 2. Voice Input & Output
* **To Speak:** Click the **Microphone 🎙️** icon in the input bar. The icon will pulse red while recording.
* **To Listen:** Hover over any AI response and click the **Speaker 🔈** icon to hear the text read aloud.

### 3. Managing Chats
* **History:** All chats are saved automatically.
* **Search:** Use the search bar in the sidebar to filter chats by title or content.
* **Context Menu:** Right-click any chat in the sidebar to **Rename**, **Duplicate**, or **Delete** it.

---

## ⌨️ Keyboard Shortcuts

Maximize your productivity with these hotkeys:

| Key Combination | Action |
| :--- | :--- |
| **`Cmd/Ctrl + K`** | Open **Command Palette** (Quick Actions) |
| **`/`** | Open **Slash Commands** menu (in input box) |
| **`Esc`** | Close Modals, Sidebar, or Overlays |
| **`Enter`** | Send Message |
| **`Shift + Enter`** | Add a new line (don't send) |

---

## 🔒 Privacy & Security

We take data privacy seriously.

* **100% Client-Side:** The application runs entirely in your browser.
* **Local Storage:** Your **API Keys**, **Chat History**, and **Settings** are stored in your browser's `localStorage`.
* **No Middleman:** Data is sent **directly** from your browser to the AI Provider (e.g., OpenAI/OpenRouter). No data passes through our servers.

> ⚠️ **Warning:** Since data is stored locally, clearing your browser cache/data will **delete your chat history**. Use the **"Export All Chats"** button in Settings to backup your data regularly.

---

## 🛠️ Tech Stack

This project is built using vanilla technologies for maximum performance and portability:

* **HTML5** (Structure)
* **Tailwind CSS** (Styling via CDN)
* **Vanilla JavaScript ES6+** (Logic & State Management)
* **Libraries:**
    * `Marked.js` & `DOMPurify` (Markdown Rendering & Sanitization)
    * `Highlight.js` (Code Syntax Highlighting)
    * `KaTeX` (Math Rendering)
    * `FontAwesome` (Icons)

---

## 🤝 Contributing

Contributions are welcome! If you want to improve iGlass AI:

1.  **Fork** the repository.
2.  Create a new **Branch** for your feature.
3.  Commit your changes.
4.  Push to the branch and open a **Pull Request**.

---

**Developed with ❤️ by Tanvir Tasin**
