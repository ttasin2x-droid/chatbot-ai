// --- ENHANCED DATA & STATE ---
const DEFAULT_PROFILES = [
    { id: 1, name: "DeepSeek R1", key: "", model: "deepseek/deepseek-r1:free", provider: "openrouter", active: true, reasoning: true },
    { id: 2, name: "GPT-4o", key: "", model: "openai/gpt-4o", provider: "openrouter", active: false },
    { id: 3, name: "Claude 3.5 Sonnet", key: "", model: "anthropic/claude-3.5-sonnet", provider: "openrouter", active: false }
];

const SUGGESTED_PROMPTS = [
    { icon: "fa-wand-magic-sparkles", text: "Explain quantum computing in simple terms", color: "text-ios-purple" },
    { icon: "fa-code", text: "Write a Python function to sort a list", color: "text-ios-blue" },
    { icon: "fa-image", text: "Analyze this image and describe what you see", color: "text-ios-pink" },
    { icon: "fa-brain", text: "Help me brainstorm ideas for a startup", color: "text-ios-orange" },
    { icon: "fa-bug", text: "Debug this code and fix the errors", color: "text-ios-red" },
    { icon: "fa-language", text: "Translate this to French and explain grammar", color: "text-ios-teal" }
];

const SLASH_COMMANDS = [
    { cmd: "/image", desc: "Generate an image", icon: "fa-image" },
    { cmd: "/code", desc: "Write code with syntax highlighting", icon: "fa-code" },
    { cmd: "/explain", desc: "Explain like I'm 5", icon: "fa-child" },
    { cmd: "/summarize", desc: "Summarize the conversation", icon: "fa-compress" },
    { cmd: "/canvas", desc: "Open canvas mode", icon: "fa-laptop-code" },
    { cmd: "/clear", desc: "Clear conversation", icon: "fa-trash" }
];

let state = {
    profiles: JSON.parse(localStorage.getItem('profiles') || JSON.stringify(DEFAULT_PROFILES)),
    chats: JSON.parse(localStorage.getItem('chats') || '[]'),
    currentChatId: null,
    isGenerating: false,
    attachments: [],
    canvasMode: false,
    voiceRecording: false,
    recognition: null,
    preferences: JSON.parse(localStorage.getItem('preferences') || '{}'),
    memory: localStorage.getItem('userMemory') || '',
    streamingController: null,
    sidebarOpen: false
};

// Initialize preferences defaults
state.preferences = {
    autoTitle: true,
    showReasoning: false,
    tts: false,
    highlight: true,
    ...state.preferences
};

// --- ENHANCED INIT ---
document.addEventListener('DOMContentLoaded', () => {
    renderProfileList();
    updateHeader();
    renderChatList();
    renderSuggestedPrompts();
    loadPreferences();
    
    if(state.chats.length > 0) loadChat(state.chats[0].id);
    else createNewChat(false);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if((e.metaKey || e.ctrlKey) && e.key === 'k') { 
            e.preventDefault(); 
            toggleCommandPalette(); 
        }
        if(e.key === 'Escape') {
            closeAllModals();
            closeSidebar();
        }
        if(e.key === '/' && document.activeElement.id !== 'user-input' && document.activeElement.id !== 'cmd-input') {
            e.preventDefault();
            document.getElementById('user-input').focus();
        }
    });

    // Drag and drop
    setupDragAndDrop();
    
    // Setup speech recognition
    setupVoiceInput();

    // Handle window resize
    window.addEventListener('resize', handleResize);
});

// --- SIDEBAR FUNCTIONS ---
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if(window.innerWidth < 768) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('mobile-open');
        sidebar.classList.remove('mobile-closed');
        overlay.classList.add('active');
        state.sidebarOpen = true;
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if(window.innerWidth < 768) {
        sidebar.classList.remove('mobile-open');
        sidebar.classList.add('mobile-closed');
        overlay.classList.remove('active');
        state.sidebarOpen = false;
        document.body.style.overflow = '';
        
        // Hide after animation completes
        setTimeout(() => {
            if(!state.sidebarOpen) sidebar.classList.add('hidden');
        }, 300);
    }
}

function handleResize() {
    if(window.innerWidth >= 768) {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('hidden', 'mobile-open', 'mobile-closed');
        document.getElementById('sidebar-overlay').classList.remove('active');
        state.sidebarOpen = false;
        document.body.style.overflow = '';
    } else {
        const sidebar = document.getElementById('sidebar');
        if(!state.sidebarOpen) sidebar.classList.add('hidden');
    }
}

// --- DRAG AND DROP ---
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        document.body.addEventListener(eventName, () => dropZone.classList.add('active'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('active'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// --- VOICE INPUT ---
function setupVoiceInput() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        state.recognition = new SpeechRecognition();
        state.recognition.continuous = false;
        state.recognition.interimResults = true;
        state.recognition.lang = 'en-US';

        state.recognition.onstart = () => {
            state.voiceRecording = true;
            updateVoiceButton();
            showToast('Listening...', 'info');
        };

        state.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const input = document.getElementById('user-input');
            if (finalTranscript) {
                input.value = finalTranscript;
                autoResize(input);
            } else if (interimTranscript) {
                input.value = interimTranscript;
                autoResize(input);
            }
        };

        state.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            showToast('Voice input error: ' + event.error, 'error');
            state.voiceRecording = false;
            updateVoiceButton();
        };

        state.recognition.onend = () => {
            state.voiceRecording = false;
            updateVoiceButton();
        };
    }
}

function toggleVoiceInput() {
    if (!state.recognition) {
        showToast('Voice input not supported in this browser', 'error');
        return;
    }

    if (state.voiceRecording) {
        state.recognition.stop();
    } else {
        state.recognition.start();
    }
}

function updateVoiceButton() {
    const btn = document.getElementById('voice-btn');
    if (state.voiceRecording) {
        btn.classList.add('text-red-500', 'animate-pulse');
        btn.innerHTML = '<div class="voice-wave"><div class="voice-bar" style="animation-delay:0s"></div><div class="voice-bar" style="animation-delay:0.1s"></div><div class="voice-bar" style="animation-delay:0.2s"></div></div>';
    } else {
        btn.classList.remove('text-red-500', 'animate-pulse');
        btn.innerHTML = '<i class="fa-solid fa-microphone text-sm"></i>';
    }
}

// --- SUGGESTED PROMPTS ---
function renderSuggestedPrompts() {
    const container = document.getElementById('suggested-prompts');
    container.innerHTML = SUGGESTED_PROMPTS.map((prompt, idx) => `
        <button onclick="useSuggestedPrompt(${idx})" class="suggested-prompt p-3 glass-card rounded-xl text-left w-full group">
            <i class="fa-solid ${prompt.icon} ${prompt.color} mb-2 text-lg block group-hover:scale-110 transition-transform"></i>
            <span class="text-xs text-gray-300 line-clamp-2">${prompt.text}</span>
        </button>
    `).join('');
}

function useSuggestedPrompt(idx) {
    const prompt = SUGGESTED_PROMPTS[idx];
    document.getElementById('user-input').value = prompt.text;
    autoResize(document.getElementById('user-input'));
    sendMessage();
}

function handleInputSuggestions(value) {
    const container = document.getElementById('input-suggestions');
    if (value.startsWith('/')) {
        container.classList.remove('hidden');
        const query = value.slice(1).toLowerCase();
        const matches = SLASH_COMMANDS.filter(cmd => cmd.cmd.includes(query) || cmd.desc.toLowerCase().includes(query));
        
        container.innerHTML = matches.map(cmd => `
            <button onclick="useSlashCommand('${cmd.cmd}')" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs whitespace-nowrap">
                <i class="fa-solid ${cmd.icon} text-ios-blue"></i>
                <span>${cmd.cmd}</span>
                <span class="text-gray-500">- ${cmd.desc}</span>
            </button>
        `).join('');
    } else {
        container.classList.add('hidden');
    }
}

function useSlashCommand(cmd) {
    const input = document.getElementById('user-input');
    input.value = cmd + ' ';
    input.focus();
    document.getElementById('input-suggestions').classList.add('hidden');
}

// --- ENHANCED CHAT FUNCTIONS ---
function createNewChat(load = true) {
    const chat = { 
        id: Date.now().toString(), 
        title: "New Conversation", 
        msgs: [], 
        sys: "", 
        created: new Date().toISOString(),
        model: state.profiles.find(p => p.active)?.model || "deepseek/deepseek-r1:free"
    };
    state.chats.unshift(chat);
    saveChats();
    renderChatList();
    if(load) { 
        loadChat(chat.id); 
        closeSettings(); 
        renderSuggestedPrompts();
    }
}

function loadChat(id) {
    state.currentChatId = id;
    const chat = state.chats.find(c => c.id === id);
    document.getElementById('sys-prompt').value = chat.sys || "";
    
    if (state.canvasMode) {
        renderCanvasChat();
    } else {
        renderMessages();
    }
    
    renderChatList();
    document.getElementById('empty-state').classList.add('hidden');
    
    // Close sidebar on mobile after selecting chat
    if(window.innerWidth < 768) {
        closeSidebar();
    }
}

// --- ENHANCED MESSAGE SENDING ---
async function sendMessage() {
    const input = document.getElementById('user-input');
    const txt = input.value.trim();
    const files = [...state.attachments];
    
    if((!txt && files.length === 0) || state.isGenerating) return;
    
    const profile = state.profiles.find(p => p.active);
    if(!profile) { showToast('Select profile first', 'error'); openSettings(); return; }

    // Check for slash commands
    if (txt.startsWith('/')) {
        handleSlashCommand(txt);
        return;
    }

    // Reset UI
    input.value = '';
    state.attachments = [];
    renderAttachments();
    autoResize(input);
    state.isGenerating = true;
    updateSendBtn();
    
    const chat = state.chats.find(c => c.id === state.currentChatId);
    
    // Build Content with context
    let contextContent = txt;
    const textFiles = files.filter(f => f.type === 'text');
    const imageFiles = files.filter(f => f.type === 'image');
    
    // Add text file contents
    textFiles.forEach(f => {
        contextContent += `\n\n[File: ${f.name}]\n\`\`\`\n${f.content}\n\`\`\``;
    });

    // Build message object
    const msgObj = { 
        role: 'user', 
        content: contextContent, 
        displayFiles: files,
        images: imageFiles
    };
    
    chat.msgs.push(msgObj);
    
    // Auto Title
    if(chat.msgs.length === 1 && state.preferences.autoTitle) {
        generateAutoTitle(chat, profile, txt);
    }
    
    saveChats();
    renderMessages();

    // Assistant Placeholder with reasoning support
    const tempId = Date.now();
    const showReasoning = profile.reasoning || state.preferences.showReasoning;
    
    chat.msgs.push({ 
        role: 'assistant', 
        content: '', 
        id: tempId, 
        typing: true,
        reasoning: showReasoning ? '' : null,
        reasoningTime: 0
    });
    
    renderMessages();
    const reasoningStartTime = Date.now();

    try {
        // Prepare Messages with memory
        const messages = [
            {role: "system", content: buildSystemPrompt(chat.sys, profile)},
            ...chat.msgs.filter(m => !m.typing && !m.id).map(m => ({
                role: m.role, 
                content: m.content,
                ...(m.images && m.images.length > 0 ? {
                    content: [
                        { type: "text", text: m.content },
                        ...m.images.map(img => ({
                            type: "image_url",
                            image_url: { url: img.content }
                        }))
                    ]
                } : {})
            }))
        ];

        // Setup streaming
        const abortController = new AbortController();
        state.streamingController = abortController;

        const res = await fetch(getApiEndpoint(profile), {
            method: "POST",
            headers: getApiHeaders(profile),
            body: JSON.stringify(getApiBody(profile, messages)),
            signal: abortController.signal
        });

        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let reasoningText = "";

        while(true) {
            const {done, value} = await reader.read();
            if(done) break;
            
            const lines = decoder.decode(value).split('\n');
            for(const line of lines) {
                if(line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if(data === '[DONE]') continue;
                    try {
                        const json = JSON.parse(data);
                        
                        // Handle reasoning content (for models like DeepSeek R1)
                        const reasoning = json.choices?.[0]?.delta?.reasoning_content;
                        const content = json.choices?.[0]?.delta?.content;
                        
                        if(reasoning) {
                            reasoningText += reasoning;
                            const msg = chat.msgs.find(m => m.id === tempId);
                            if(msg) {
                                msg.reasoning = reasoningText;
                                updateMessageReasoning(tempId, reasoningText);
                            }
                        }
                        
                        if(content) {
                            fullText += content;
                            const msg = chat.msgs.find(m => m.id === tempId);
                            if(msg) {
                                msg.content = fullText;
                                msg.typing = false;
                                msg.reasoningTime = (Date.now() - reasoningStartTime) / 1000;
                                updateStreamingMessage(tempId, fullText);
                            }
                        }
                    } catch(e) {}
                }
            }
        }
        
        const msg = chat.msgs.find(m => m.id === tempId);
        if(msg) { 
            delete msg.id; 
            delete msg.typing;
            
            // TTS if enabled
            if(state.preferences.tts && fullText) {
                speakMessage(fullText);
            }
        }
        
        saveChats(); 
        renderMessages();

    } catch(e) {
        if(e.name === 'AbortError') {
            const msg = chat.msgs.find(m => m.id === tempId);
            if(msg) { 
                msg.content = fullText || "[Generation stopped by user]";
                msg.typing = false; 
                delete msg.id; 
            }
        } else {
            const msg = chat.msgs.find(m => m.id === tempId);
            if(msg) { 
                msg.content = `Error: ${e.message}`; 
                msg.typing = false; 
                delete msg.id; 
            }
            showToast('Error: ' + e.message, 'error');
        }
        renderMessages();
    } finally {
        state.isGenerating = false;
        state.streamingController = null;
        updateSendBtn();
    }
}

function buildSystemPrompt(customSys, profile) {
    let sys = customSys || "You are a helpful AI assistant.";
    if(state.memory) {
        sys += `\n\nUser Memory: ${state.memory}`;
    }
    if(profile.reasoning) {
        sys += "\n\nShow your reasoning process before giving the final answer.";
    }
    return sys;
}

function getApiEndpoint(profile) {
    if(profile.provider === 'openai') return 'https://api.openai.com/v1/chat/completions';
    return 'https://openrouter.ai/api/v1/chat/completions';
}

function getApiHeaders(profile) {
    const headers = {
        "Authorization": `Bearer ${profile.key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href
    };
    if(profile.provider === 'openai') {
        headers['OpenAI-Beta'] = 'assistants=v2';
    }
    return headers;
}

function getApiBody(profile, messages) {
    return {
        model: profile.model,
        messages: messages,
        stream: true,
        ...(profile.reasoning && { include_reasoning: true })
    };
}

function updateStreamingMessage(id, content) {
    const bubbles = document.querySelectorAll('.msg-bubble-ai');
    const target = bubbles[bubbles.length - 1];
    if(target) {
        const contentArea = target.querySelector('.content-area');
        if(contentArea) {
            contentArea.innerHTML = parseMarkdown(content) + '<span class="streaming-cursor"></span>';
            if(state.preferences.highlight) {
                contentArea.querySelectorAll('pre code').forEach((block) => {
                    if(!block.classList.contains('hljs')) {
                        hljs.highlightElement(block);
                    }
                });
            }
        }
        scrollToBottom();
    }
}

function updateMessageReasoning(id, reasoning) {
    const msgEl = document.querySelector(`[data-msg-id="${id}"]`);
    if(msgEl) {
        let reasoningBox = msgEl.querySelector('.thinking-box');
        if(!reasoningBox && reasoning) {
            reasoningBox = document.createElement('div');
            reasoningBox.className = 'thinking-box';
            msgEl.insertBefore(reasoningBox, msgEl.firstChild);
        }
        if(reasoningBox) {
            reasoningBox.innerHTML = `
                <div class="thinking-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    <span><i class="fa-solid fa-brain mr-2"></i>Thinking Process</span>
                    <i class="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
                <div class="thinking-content">${reasoning}</div>
            `;
        }
    }
}

function handleSlashCommand(txt) {
    const parts = txt.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1).join(' ');
    
    switch(cmd) {
        case '/clear':
            clearCurrentChat();
            break;
        case '/canvas':
            toggleCanvasMode();
            break;
        case '/image':
            showToast('Image generation coming soon!', 'info');
            break;
        case '/summarize':
            summarizeConversation();
            break;
        default:
            showToast('Unknown command: ' + cmd, 'error');
    }
}

function summarizeConversation() {
    const chat = state.chats.find(c => c.id === state.currentChatId);
    if(chat.msgs.length === 0) return;
    
    document.getElementById('user-input').value = "Please summarize our conversation so far in 3 bullet points.";
    sendMessage();
}

// --- ENHANCED FILE HANDLING ---
function handleFileUpload(input) {
    handleFiles(input.files);
    input.value = '';
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        // Check file size (max 10MB)
        if(file.size > 10 * 1024 * 1024) {
            showToast('File too large (max 10MB): ' + file.name, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            
            if(file.type.startsWith('image/')) {
                state.attachments.push({ type: 'image', name: file.name, content: content, size: file.size });
                renderAttachments();
            } else if(file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                // For PDFs, we'd ideally extract text, but for now we'll note it
                showToast('PDF support: Text extraction in beta', 'info');
                state.attachments.push({ type: 'file', name: file.name, content: '[PDF Content]', size: file.size });
                renderAttachments();
            } else {
                // Text files
                const textReader = new FileReader();
                textReader.onload = (ev) => {
                    state.attachments.push({ 
                        type: 'text', 
                        name: file.name, 
                        content: ev.target.result,
                        size: file.size 
                    });
                    renderAttachments();
                };
                textReader.readAsText(file);
            }
        };
        reader.readAsDataURL(file);
    });
}

function handlePaste(e) {
    const items = e.clipboardData.items;
    for(let item of items) {
        if(item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
                state.attachments.push({ 
                    type: 'image', 
                    name: 'pasted-image.png', 
                    content: event.target.result 
                });
                renderAttachments();
                showToast('Image pasted from clipboard', 'success');
            };
            reader.readAsDataURL(blob);
        }
    }
}

function renderAttachments() {
    const area = document.getElementById('file-preview-area');
    area.innerHTML = '';
    if(state.attachments.length === 0) { area.classList.add('hidden'); return; }
    area.classList.remove('hidden');
    
    state.attachments.forEach((file, idx) => {
        const el = document.createElement('div');
        el.className = 'relative shrink-0 w-16 h-16 rounded-lg border border-white/20 overflow-hidden group bg-black/40 flex items-center justify-center cursor-pointer hover:border-ios-blue transition';
        
        if(file.type === 'image') {
            el.innerHTML = `<img src="${file.content}" class="w-full h-full object-cover">`;
        } else {
            const icon = file.name.endsWith('.pdf') ? 'fa-file-pdf text-red-400' : 'fa-file-code text-ios-blue';
            el.innerHTML = `<div class="text-[10px] text-center p-1 break-all text-gray-300"><i class="fa-solid ${icon} block mb-1 text-lg"></i>${file.name.slice(0,8)}</div>`;
        }
        
        el.innerHTML += `<button onclick="removeAttachment(${idx})" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition"><i class="fa-solid fa-xmark"></i></button>`;
        area.appendChild(el);
    });
}

function removeAttachment(idx) {
    state.attachments.splice(idx, 1);
    renderAttachments();
}

// --- ENHANCED MESSAGE ACTIONS ---
function editMessage(index) {
    const chat = state.chats.find(c => c.id === state.currentChatId);
    const msg = chat.msgs[index];
    const original = msg.content.split('\n\n[File:')[0];
    const div = document.getElementById(`msg-${index}`);
    
    div.innerHTML = `
        <div class="glass-card p-2 rounded-xl w-full max-w-2xl ml-auto animate-fade-in">
            <textarea id="edit-area-${index}" class="w-full bg-black/20 text-white text-sm p-2 rounded h-24 border border-white/10 outline-none resize-none">${original}</textarea>
            <div class="flex gap-2 justify-end mt-2">
                <button onclick="renderMessages()" class="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10">Cancel</button>
                <button onclick="saveEdit(${index})" class="px-3 py-1 text-xs rounded bg-ios-blue hover:bg-blue-600">Regenerate</button>
            </div>
        </div>`;
}

function saveEdit(index) {
    const newText = document.getElementById(`edit-area-${index}`).value;
    const chat = state.chats.find(c => c.id === state.currentChatId);
    chat.msgs = chat.msgs.slice(0, index);
    saveChats(); 
    renderMessages();
    document.getElementById('user-input').value = newText;
    sendMessage();
}

function speakMessage(text) {
    if('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Strip markdown for TTS
        const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block.').replace(/`([^`]+)`/g, '$1').replace(/\*\*|\*|__|_/g, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        const u = new SpeechSynthesisUtterance(cleanText);
        u.rate = 1;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
    }
}

function stopSpeaking() {
    if('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function feedbackMessage(index, type) {
    const chat = state.chats.find(c => c.id === state.currentChatId);
    const msg = chat.msgs[index];
    msg.feedback = type;
    saveChats();
    renderMessages();
    showToast(type === 'positive' ? 'Thanks for your feedback!' : 'Thanks, we\'ll improve this.', 'success');
}

function branchFromMessage(index) {
    const chat = state.chats.find(c => c.id === state.currentChatId);
    const newChat = { 
        id: Date.now().toString(), 
        title: "Branch: " + chat.title, 
        msgs: chat.msgs.slice(0, index + 1), 
        sys: chat.sys, 
        created: new Date().toISOString(),
        parentId: chat.id,
        branchPoint: index
    };
    state.chats.unshift(newChat);
    saveChats();
    renderChatList();
    loadChat(newChat.id);
    showToast('Created new branch from this message', 'success');
}

function copyMessage(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard', 'success');
    });
}

// --- CANVAS MODE ---
function toggleCanvasMode() {
    state.canvasMode = !state.canvasMode;
    const chatContainer = document.getElementById('chat-container');
    const canvasContainer = document.getElementById('canvas-container');
    const emptyState = document.getElementById('empty-state');
    
    if(state.canvasMode) {
        chatContainer.classList.add('hidden');
        emptyState.classList.add('hidden');
        canvasContainer.classList.remove('hidden');
        renderCanvasChat();
    } else {
        chatContainer.classList.remove('hidden');
        canvasContainer.classList.add('hidden');
        if(state.chats.find(c => c.id === state.currentChatId)?.msgs.length === 0) {
            emptyState.classList.remove('hidden');
        }
        renderMessages();
    }
}

function renderCanvasChat() {
    const chat = state.chats.find(c => c.id === state.currentChatId);
    const canvasChat = document.getElementById('canvas-chat');
    
    canvasChat.innerHTML = chat.msgs.map((m, idx) => `
        <div class="p-3 rounded-lg ${m.role === 'user' ? 'bg-ios-blue/20 ml-8' : 'bg-white/5 mr-8'}">
            <div class="text-[10px] text-gray-500 mb-1">${m.role === 'user' ? 'You' : 'AI'}</div>
            <div class="text-sm">${m.role === 'user' ? m.content.replace(/</g, "&lt;") : parseMarkdown(m.content)}</div>
        </div>
    `).join('');
    
    // Update editor with last code block if exists
    const lastAiMsg = [...chat.msgs].reverse().find(m => m.role === 'assistant');
    if(lastAiMsg) {
        const codeBlock = lastAiMsg.content.match(/```[\w]*\n([\s\S]*?)```/);
        if(codeBlock) {
            document.getElementById('canvas-editor').innerText = codeBlock[1];
        }
    }
}

function canvasAction(action) {
    const editor = document.getElementById('canvas-editor');
    if(action === 'copy') {
        navigator.clipboard.writeText(editor.innerText);
        showToast('Copied to clipboard', 'success');
    } else if(action === 'download') {
        const blob = new Blob([editor.innerText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.txt';
        a.click();
    }
}

// --- ENHANCED RENDERING ---
function renderMessages() {
    const container = document.getElementById('chat-container');
    const emptyState = document.getElementById('empty-state');
    const chat = state.chats.find(c => c.id === state.currentChatId);
    
    if(!chat || chat.msgs.length === 0) { 
        emptyState.classList.remove('hidden'); 
        container.innerHTML=''; 
        container.appendChild(emptyState); 
        return; 
    }
    
    emptyState.classList.add('hidden'); 
    container.innerHTML = ''; 
    container.appendChild(emptyState);

    chat.msgs.forEach((m, idx) => {
        const div = document.createElement('div');
        div.className = `msg-group flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in mb-6 relative`;
        div.id = `msg-${idx}`;
        if(m.id) div.setAttribute('data-msg-id', m.id);
        
        const inner = document.createElement('div');
        inner.className = `max-w-[85%] md:max-w-[75%] p-4 text-sm rounded-[20px] shadow-lg relative ${m.role === 'user' ? 'msg-bubble-user text-white rounded-br-sm' : 'msg-bubble-ai text-gray-100 rounded-bl-sm'}`;
        
        let html = '';
        
        // Reasoning box
        if(m.reasoning && state.preferences.showReasoning) {
            html += `
                <div class="thinking-box mb-3">
                    <div class="thinking-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
                        <span><i class="fa-solid fa-brain mr-2"></i>Thinking Process ${m.reasoningTime ? `(${m.reasoningTime.toFixed(1)}s)` : ''}</span>
                        <i class="fa-solid fa-chevron-down text-[10px]"></i>
                    </div>
                    <div class="thinking-content">${m.reasoning}</div>
                </div>
            `;
        }

        // File attachments display
        if(m.displayFiles && m.displayFiles.length) {
            html += `<div class="flex gap-2 mb-3 flex-wrap">`;
            m.displayFiles.forEach(f => {
                if(f.type === 'image') html += `<img src="${f.content}" class="w-32 h-32 rounded-lg border border-white/10 object-cover hover:scale-105 transition cursor-pointer" onclick="window.open('${f.content}')">`;
                else {
                    const icon = f.name.endsWith('.pdf') ? 'fa-file-pdf text-red-400' : 'fa-file-code text-ios-blue';
                    html += `<div class="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/10"><i class="fa-solid ${icon}"></i> <span class="text-xs truncate max-w-[100px]">${f.name}</span></div>`;
                }
            });
            html += `</div>`;
        }

        // Content
        if(m.typing) {
            html += `<div class="typing-container"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
        } else {
            html += `<div class="content-area prose prose-invert max-w-none prose-p:mb-2 prose-pre:my-2 prose-sm">${m.role === 'user' ? m.content.replace(/</g, "&lt;") : parseMarkdown(m.content)}</div>`;
        }
        
        inner.innerHTML = html;
        div.appendChild(inner);

        // Enhanced Actions
        if(!m.typing) {
            const actions = document.createElement('div');
            actions.className = `msg-actions absolute ${m.role === 'user' ? 'left-[-80px] top-0' : 'right-[-80px] top-0'} flex flex-col gap-1`;
            
            if(m.role === 'assistant') {
                actions.innerHTML = `
                    <button onclick="speakMessage(this.closest('.msg-group').querySelector('.content-area').innerText)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition" title="Read aloud"><i class="fa-solid fa-volume-high text-[10px]"></i></button>
                    <button onclick="copyMessage(this.closest('.msg-group').querySelector('.content-area').innerText)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition" title="Copy"><i class="fa-solid fa-copy text-[10px]"></i></button>
                    <button onclick="branchFromMessage(${idx})" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition" title="Branch from here"><i class="fa-solid fa-code-branch text-[10px]"></i></button>
                `;
                
                // Feedback buttons
                const feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'flex gap-1 mt-1';
                feedbackDiv.innerHTML = `
                    <button onclick="feedbackMessage(${idx}, 'positive')" class="feedback-btn ${m.feedback === 'positive' ? 'active' : ''}" title="Good response"><i class="fa-solid fa-thumbs-up"></i></button>
                    <button onclick="feedbackMessage(${idx}, 'negative')" class="feedback-btn ${m.feedback === 'negative' ? 'active' : ''}" title="Bad response"><i class="fa-solid fa-thumbs-down"></i></button>
                `;
                actions.appendChild(feedbackDiv);
            } else {
                actions.innerHTML = `
                    <button onclick="editMessage(${idx})" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition" title="Edit & regenerate"><i class="fa-solid fa-pencil text-[10px]"></i></button>
                `;
            }
            div.appendChild(actions);
        }

        container.appendChild(div);
    });
    
    // Syntax highlighting
    if(state.preferences.highlight) {
        container.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
            if(!block.parentElement.querySelector('.copy-btn')) {
                const btn = document.createElement('button');
                btn.className = 'copy-btn'; 
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                btn.onclick = () => { 
                    navigator.clipboard.writeText(block.innerText); 
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied'; 
                    setTimeout(() => btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy', 1500); 
                };
                block.parentElement.appendChild(btn);
            }
        });
    }
    
    // Math rendering
    renderMathInElement(container, { 
        delimiters: [
            {left: "$$", right: "$$", display: true}, 
            {left: "$", right: "$", display: false}
        ] 
    });
    
    scrollToBottom();
}

function parseMarkdown(text) {
    return DOMPurify.sanitize(marked.parse(text));
}

// --- CHAT LIST & UI ---
function renderChatList() {
    const list = document.getElementById('chat-list-desktop');
    list.innerHTML = '';
    state.chats.forEach(c => {
        const isActive = c.id === state.currentChatId;
        const date = new Date(c.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const hasBranch = c.parentId ? '<i class="fa-solid fa-code-branch text-[8px] text-ios-blue ml-1"></i>' : '';
        
        const el = document.createElement('div');
        el.className = `sidebar-item p-2.5 rounded-xl mb-1 cursor-pointer transition-all duration-200 flex items-center justify-between group ${isActive ? 'active bg-white/10 border border-white/5' : 'hover:bg-white/5 border border-transparent'}`;
        el.onclick = () => loadChat(c.id);
        el.oncontextmenu = (e) => showContextMenu(e, c.id);
        el.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-8 h-8 rounded-lg ${isActive ? 'bg-ios-blue/20 text-ios-blue' : 'bg-white/5 text-gray-500'} flex items-center justify-center text-xs shrink-0"><i class="fa-regular fa-message"></i></div>
                <div class="truncate flex-1">
                    <div class="text-xs font-medium text-gray-200 truncate flex items-center">${c.title}${hasBranch}</div>
                    <div class="text-[10px] text-gray-600">${date} • ${c.msgs.length} msgs</div>
                </div>
            </div>
            <button onclick="deleteChat(event, '${c.id}')" class="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-gray-600 transition"><i class="fa-solid fa-times text-[10px]"></i></button>
        `;
        list.appendChild(el);
    });
}

function showContextMenu(e, chatId) {
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    menu.innerHTML = `
        <div class="context-menu-item" onclick="loadChat('${chatId}'); hideContextMenu()"><i class="fa-solid fa-folder-open"></i> Open</div>
        <div class="context-menu-item" onclick="renameChat('${chatId}'); hideContextMenu()"><i class="fa-solid fa-pen"></i> Rename</div>
        <div class="context-menu-item" onclick="duplicateChat('${chatId}'); hideContextMenu()"><i class="fa-solid fa-copy"></i> Duplicate</div>
        <div class="context-menu-item text-red-400" onclick="deleteChat(event, '${chatId}'); hideContextMenu()"><i class="fa-solid fa-trash"></i> Delete</div>
    `;
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    menu.classList.remove('hidden');
    
    document.addEventListener('click', hideContextMenu, { once: true });
}

function hideContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
}

function renameChat(id) {
    const chat = state.chats.find(c => c.id === id);
    const newName = prompt('New name:', chat.title);
    if(newName) {
        chat.title = newName;
        saveChats();
        renderChatList();
    }
}

function duplicateChat(id) {
    const chat = state.chats.find(c => c.id === id);
    const newChat = { ...chat, id: Date.now().toString(), title: chat.title + ' (Copy)', created: new Date().toISOString() };
    state.chats.unshift(newChat);
    saveChats();
    renderChatList();
    showToast('Chat duplicated', 'success');
}

function filterChats(q) {
    const list = document.getElementById('chat-list-desktop');
    const chats = state.chats.filter(c => c.title.toLowerCase().includes(q.toLowerCase()) || c.msgs.some(m => m.content.toLowerCase().includes(q.toLowerCase())));
    list.innerHTML = ''; 
    chats.forEach(c => {
        const el = document.createElement('div');
        el.className = 'p-2.5 rounded-xl text-xs text-gray-400 hover:bg-white/5 cursor-pointer transition';
        el.innerText = c.title; 
        el.onclick = () => loadChat(c.id);
        list.appendChild(el);
    });
}

// --- COMMAND PALETTE ---
function toggleCommandPalette() {
    const el = document.getElementById('cmd-overlay');
    if(el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        setTimeout(() => { document.getElementById('cmd-input').focus(); }, 10);
        renderCommands();
    } else {
        el.classList.add('hidden');
    }
}

function renderCommands() {
    const list = document.getElementById('cmd-list'); 
    list.innerHTML = '';
    const cmds = [
        { icon: 'fa-plus', label: 'New Chat', shortcut: '⌘N', action: () => createNewChat() },
        { icon: 'fa-trash', label: 'Clear Chat', action: () => clearCurrentChat() },
        { icon: 'fa-laptop-code', label: 'Toggle Canvas Mode', shortcut: '⌘⇧C', action: () => toggleCanvasMode() },
        { icon: 'fa-sliders', label: 'Settings', shortcut: '⌘,', action: () => openSettings() },
        { icon: 'fa-download', label: 'Export Chat', action: () => exportChats() },
        { icon: 'fa-microphone', label: 'Voice Input', action: () => toggleVoiceInput() },
        { icon: 'fa-stop', label: 'Stop Generation', shortcut: '⌘.', action: () => stopGeneration(), condition: () => state.isGenerating },
        { icon: 'fa-volume-xmark', label: 'Stop Speaking', action: () => stopSpeaking(), condition: () => window.speechSynthesis.speaking }
    ].filter(cmd => !cmd.condition || cmd.condition());
    
    cmds.forEach(cmd => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-3 rounded-lg hover:bg-white/10 cursor-pointer text-sm text-gray-300 transition';
        item.innerHTML = `
            <div class="flex items-center gap-3"><i class="fa-solid ${cmd.icon} w-5 text-center"></i> ${cmd.label}</div>
            ${cmd.shortcut ? `<span class="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-500">${cmd.shortcut}</span>` : ''}
        `;
        item.onclick = () => { cmd.action(); toggleCommandPalette(); };
        list.appendChild(item);
    });
}

// --- SETTINGS & PROFILES ---
function renderProfileList() {
    const list = document.getElementById('profile-list');
    const modelList = document.getElementById('model-list');
    
    list.innerHTML = state.profiles.map(p => `
        <div onclick="activateProfile(${p.id})" class="p-3 glass-card rounded-xl cursor-pointer transition ${p.active ? 'border-ios-blue' : 'border-transparent'} hover:bg-white/5">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full ${p.active ? 'bg-ios-green' : 'bg-gray-600'}"></div>
                    <span class="text-xs font-medium">${p.name}</span>
                    ${p.reasoning ? '<span class="text-[9px] bg-ios-purple/20 text-ios-purple px-1.5 rounded">R</span>' : ''}
                </div>
                <button onclick="deleteProfile(event, ${p.id})" class="text-gray-600 hover:text-red-400"><i class="fa-solid fa-times text-xs"></i></button>
            </div>
            <div class="text-[10px] text-gray-500 mt-1 truncate">${p.model}</div>
        </div>
    `).join('');
    
    if(modelList) {
        modelList.innerHTML = state.profiles.map(p => `
            <div onclick="activateProfile(${p.id}); toggleModelSelector()" class="p-2 hover:bg-white/10 rounded-lg cursor-pointer flex items-center gap-2 ${p.active ? 'bg-white/5' : ''}">
                <div class="w-2 h-2 rounded-full ${p.active ? 'bg-ios-green' : 'bg-gray-600'}"></div>
                <span class="text-xs">${p.name}</span>
            </div>
        `).join('');
    }
}

function toggleModelSelector() {
    const el = document.getElementById('model-selector');
    el.classList.toggle('hidden');
}

function activateProfile(id) {
    state.profiles.forEach(p => p.active = (p.id === id));
    saveProfiles();
    renderProfileList();
    updateHeader();
}

function addProfile() {
    const n = document.getElementById('p-name').value;
    const k = document.getElementById('p-key').value;
    const m = document.getElementById('p-model').value;
    const provider = document.getElementById('p-provider').value;
    
    if(n && m) {
        state.profiles.push({
            id: Date.now(), 
            name: n, 
            key: k, 
            model: m, 
            provider: provider,
            active: true,
            reasoning: m.includes('deepseek') || m.includes('o1') || m.includes('claude')
        });
        saveProfiles();
        renderProfileList();
        updateHeader();
        toggleAddForm();
        showToast('Profile added', 'success');
    }
}

function deleteProfile(e, id) {
    e.stopPropagation();
    if(confirm('Delete this profile?')) {
        state.profiles = state.profiles.filter(p => p.id !== id);
        if(!state.profiles.find(p => p.active) && state.profiles.length) state.profiles[0].active = true;
        saveProfiles();
        renderProfileList();
        updateHeader();
    }
}

function loadPreferences() {
    document.getElementById('pref-auto-title').checked = state.preferences.autoTitle;
    document.getElementById('pref-show-reasoning').checked = state.preferences.showReasoning;
    document.getElementById('pref-tts').checked = state.preferences.tts;
    document.getElementById('pref-highlight').checked = state.preferences.highlight;
    document.getElementById('user-memory').value = state.memory;
}

function savePreferences() {
    state.preferences = {
        autoTitle: document.getElementById('pref-auto-title').checked,
        showReasoning: document.getElementById('pref-show-reasoning').checked,
        tts: document.getElementById('pref-tts').checked,
        highlight: document.getElementById('pref-highlight').checked
    };
    localStorage.setItem('preferences', JSON.stringify(state.preferences));
}

function saveMemory() {
    state.memory = document.getElementById('user-memory').value;
    localStorage.setItem('userMemory', state.memory);
    showToast('Memory updated', 'success');
}

// --- UTILITIES ---
function autoResize(el) { 
    el.style.height = 'auto'; 
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'; 
}

function scrollToBottom() { 
    const c = document.getElementById('chat-container'); 
    c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' }); 
}

function handleEnter(e) { 
    if(e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        sendMessage(); 
    } 
}

function updateSendBtn() {
    const btn = document.getElementById('send-btn');
    const icon = document.getElementById('send-icon');
    if(state.isGenerating) { 
        btn.classList.add('bg-red-500', 'hover:bg-red-600'); 
        btn.classList.remove('bg-ios-blue', 'hover:bg-blue-600');
        icon.className = 'fa-solid fa-stop'; 
        btn.onclick = stopGeneration;
    } else { 
        btn.classList.remove('bg-red-500', 'hover:bg-red-600');
        btn.classList.add('bg-ios-blue', 'hover:bg-blue-600');
        icon.className = 'fa-solid fa-arrow-up'; 
        btn.onclick = sendMessage;
        btn.disabled = false;
    }
}

function stopGeneration() {
    if(state.streamingController) {
        state.streamingController.abort();
        state.streamingController = null;
    }
}

function saveChats() { 
    localStorage.setItem('chats', JSON.stringify(state.chats)); 
}

function saveProfiles() { 
    localStorage.setItem('profiles', JSON.stringify(state.profiles)); 
}

function updateHeader() { 
    const p = state.profiles.find(x => x.active); 
    if(p) { 
        document.getElementById('header-profile').innerText = p.name; 
        document.getElementById('profile-avatar').innerText = p.name.substring(0,2).toUpperCase();
        document.getElementById('status-text').innerText = p.key ? 'Online' : 'Offline';
        document.getElementById('status-dot').className = `w-1 h-1 rounded-full ${p.key ? 'bg-ios-green' : 'bg-red-500'}`;
    } 
}

async function generateAutoTitle(chat, profile, firstMsg) {
    if(!state.preferences.autoTitle) return;
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${profile.key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-preview-02-05:free",
                messages: [{role: "system", content: "Create a very short title (2-4 words) for this conversation. No quotes."}, {role: "user", content: firstMsg}]
            })
        });
        const data = await res.json();
        chat.title = data.choices[0].message.content.replace(/"/g, '').trim();
        saveChats(); 
        renderChatList();
    } catch(e) {}
}

function exportChats() { 
    const data = {
        version: "1.0",
        exported: new Date().toISOString(),
        chats: state.chats,
        profiles: state.profiles,
        preferences: state.preferences,
        memory: state.memory
    };
    const b = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}); 
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(b); 
    a.download = `iglass_backup_${new Date().toISOString().split('T')[0]}.json`; 
    a.click();
    showToast('Chats exported', 'success');
}

function deleteChat(e, id) { 
    e.stopPropagation(); 
    if(confirm('Delete this conversation?')) { 
        state.chats = state.chats.filter(c => c.id !== id); 
        saveChats(); 
        state.chats.length ? loadChat(state.chats[0].id) : createNewChat(); 
        showToast('Deleted', 'success');
    } 
}

function clearCurrentChat() { 
    if(confirm('Clear this conversation?')) { 
        const chat = state.chats.find(c => c.id === state.currentChatId);
        if(chat) {
            chat.msgs = [];
            saveChats(); 
            renderMessages();
            showToast('Cleared', 'success');
        }
    } 
}

function clearAllChats() { 
    if(confirm('Delete ALL conversations? This cannot be undone.')) { 
        state.chats = []; 
        saveChats(); 
        createNewChat(); 
        closeSettings();
        showToast('All chats deleted', 'success');
    } 
}

function closeAllModals() {
    closeSettings();
    document.getElementById('cmd-overlay').classList.add('hidden');
    document.getElementById('model-selector').classList.add('hidden');
    closeSystemModal();
    hideContextMenu();
}

function openSettings() { 
    document.getElementById('settings-modal').classList.remove('hidden'); 
    renderProfileList();
}

function closeSettings() { 
    document.getElementById('settings-modal').classList.add('hidden'); 
}

function openSystemModal() { 
    document.getElementById('system-modal').classList.remove('hidden'); 
}

function closeSystemModal() { 
    document.getElementById('system-modal').classList.add('hidden'); 
}

function saveSys() { 
    const c = state.chats.find(x => x.id === state.currentChatId); 
    if(c) {
        c.sys = document.getElementById('sys-prompt').value; 
        saveChats(); 
        showToast('System prompt updated', 'success');
    } 
    closeSystemModal(); 
}

function toggleAddForm() { 
    document.getElementById('add-form').classList.toggle('hidden'); 
}

// Enhanced Toast System
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icons = {
        success: 'fa-circle-check text-ios-green',
        error: 'fa-circle-xmark text-ios-red',
        info: 'fa-circle-info text-ios-blue',
        warning: 'fa-triangle-exclamation text-ios-orange'
    };
    
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.success} text-lg"></i>
        <span class="text-xs font-medium">${msg}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
