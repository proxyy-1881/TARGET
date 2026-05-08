class TargetApp {
    constructor() {
        this.userId = null;
        this.publicKey = null;
        this.privateKey = null;
        this.contacts = [];
        this.chats = [];
        this.currentChat = null;
        this.currentTheme = 'dark';

        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.initTabs();
        this.initModals();
        this.initResponsive();
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('target_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('themeSelect').value = savedTheme;
    }

    bindEvents() {
        document.getElementById('generateKeysBtn')?.addEventListener('click', () => this.generateKeys());
        document.getElementById('copyPublicKeyBtn')?.addEventListener('click', () => this.copyPublicKey());
        document.getElementById('addContactBtn')?.addEventListener('click', () => this.showModal('addContactModal'));
        document.getElementById('emptyAddContactBtn')?.addEventListener('click', () => this.showModal('addContactModal'));
        document.getElementById('newChatBtn')?.addEventListener('click', () => this.showNewChatModal());
        document.getElementById('emptyNewChatBtn')?.addEventListener('click', () => this.showNewChatModal());
        document.getElementById('sendMessageBtn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('backToChatsBtn')?.addEventListener('click', () => this.closeChat());
        document.getElementById('clearLogsBtn')?.addEventListener('click', () => this.clearLogs());
        document.getElementById('themeSelect')?.addEventListener('change', (e) => this.setTheme(e.target.value));
        document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggleSidebar());

        const messageInput = document.getElementById('messageInput');
        messageInput?.addEventListener('input', () => this.toggleSendButton());
        messageInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        document.querySelector('.modal-confirm')?.addEventListener('click', () => this.addContact());
    }

    initTabs() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    }

    initModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });
    }

    initResponsive() {
        const sidebar = document.getElementById('sidebar');
        const chatSidebar = document.getElementById('chatSidebar');

        if (window.innerWidth <= 768) {
            document.body.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && sidebar.classList.contains('open-mobile')) {
                    sidebar.classList.remove('open-mobile');
                }
            });
        }
    }

    switchPage(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `${page}Page`);
        });

        if (window.innerWidth <= 768) {
            document.getElementById('sidebar')?.classList.remove('open-mobile');
        }
    }

    generateKeys() {
        this.userId = `user_${Math.random().toString(36).substr(2, 16)}`;
        this.publicKey = Array(64).fill(0).map(() => Math.random().toString(16)[2]).join('');
        this.privateKey = Array(64).fill(0).map(() => Math.random().toString(16)[2]).join('');

        document.getElementById('userIdDisplay').innerHTML = `<span>${this.userId}</span>`;
        document.getElementById('publicKeyDisplay').innerHTML = `<span>${this.publicKey}</span>`;

        const fingerprint = this.publicKey.substr(0, 16) + '...' + this.publicKey.substr(-16);
        document.getElementById('fingerprintDisplay').innerHTML = `<span>${fingerprint}</span>`;

        document.getElementById('copyPublicKeyBtn').style.display = 'inline-flex';
        document.getElementById('profileStatus').textContent = `ID: ${this.userId.substr(0, 8)}...`;
        document.getElementById('profileStatus').classList.add('online');

        this.addSystemMessage('Ваши ключи успешно сгенерированы');
    }

    copyPublicKey() {
        if (this.publicKey) {
            navigator.clipboard.writeText(this.publicKey);
            this.showToast('Публичный ключ скопирован');
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showNewChatModal() {
        const select = document.getElementById('chatContactSelect');
        select.innerHTML = '<option value="">-- Выберите контакт --</option>';

        this.contacts.forEach(contact => {
            select.innerHTML += `<option value="${contact.id}">${contact.name}</option>`;
        });

        this.showModal('newChatModal');
    }

    addContact() {
        const contactId = document.getElementById('newContactId').value.trim();
        if (!contactId) return;

        const contact = {
            id: contactId,
            name: contactId.substr(0, 12) + '...',
            addedAt: new Date().toISOString()
        };

        this.contacts.push(contact);
        this.updateContactsList();
        this.updateChatSelect();

        document.getElementById('newContactId').value = '';
        this.closeModals();
        this.addSystemMessage(`Контакт ${contact.name} добавлен`);
    }

    updateContactsList() {
        const container = document.getElementById('contactsList');

        if (this.contacts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-address-book"></i>
                    <p>Список контактов пуст</p>
                    <button class="btn-primary" id="emptyAddContactBtn">Добавить контакт</button>
                </div>
            `;
            document.getElementById('emptyAddContactBtn')?.addEventListener('click', () => this.showModal('addContactModal'));
            return;
        }

        container.innerHTML = this.contacts.map(contact => `
            <div class="contact-item" data-id="${contact.id}">
                <div class="contact-info">
                    <div class="contact-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="contact-details">
                        <div class="contact-name">${contact.name}</div>
                        <div class="contact-id-small">${contact.id}</div>
                    </div>
                </div>
                <button class="icon-btn chat-with-contact" data-id="${contact.id}">
                    <i class="fas fa-comment"></i>
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.chat-with-contact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contactId = btn.dataset.id;
                const contact = this.contacts.find(c => c.id === contactId);
                if (contact) this.openChat(contact);
            });
        });
    }

    updateChatSelect() {
        const select = document.getElementById('chatContactSelect');
        select.innerHTML = '<option value="">-- Выберите контакт --</option>';
        this.contacts.forEach(contact => {
            select.innerHTML += `<option value="${contact.id}">${contact.name}</option>`;
        });
    }

    openChat(contact) {
        this.currentChat = contact;
        document.getElementById('chatContactName').textContent = contact.name;
        document.getElementById('chatSidebar').classList.add('open');
        document.getElementById('sendMessageBtn').disabled = false;

        this.loadChatHistory(contact.id);
    }

    loadChatHistory(contactId) {
        const messagesArea = document.getElementById('messagesArea');
        const savedMessages = localStorage.getItem(`chat_${contactId}`);

        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            messagesArea.innerHTML = messages.map(msg => `
                <div class="message ${msg.type}">
                    ${msg.text}
                    <div class="message-time">${msg.time}</div>
                </div>
            `).join('');
        } else {
            messagesArea.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-dots"></i>
                    <p>Нет сообщений. Напишите что-нибудь!</p>
                </div>
            `;
        }

        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (!message || !this.currentChat) return;

        const messageObj = {
            text: message,
            type: 'outgoing',
            time: new Date().toLocaleTimeString()
        };

        this.saveMessage(this.currentChat.id, messageObj);
        this.addLogEntry(this.currentChat.id, message);

        input.value = '';
        this.toggleSendButton();

        setTimeout(() => {
            const reply = {
                text: `(автоответ) Сообщение получено: "${message}"`,
                type: 'incoming',
                time: new Date().toLocaleTimeString()
            };
            this.saveMessage(this.currentChat.id, reply);
        }, 1000);
    }

    saveMessage(contactId, message) {
        const key = `chat_${contactId}`;
        const saved = localStorage.getItem(key);
        const messages = saved ? JSON.parse(saved) : [];
        messages.push(message);
        localStorage.setItem(key, JSON.stringify(messages));

        this.loadChatHistory(contactId);

        const chatExists = this.chats.some(c => c.id === contactId);
        if (!chatExists) {
            this.chats.push({
                id: contactId,
                name: this.contacts.find(c => c.id === contactId)?.name || contactId.substr(0, 12),
                lastMessage: message.text,
                lastTime: message.time
            });
            this.updateChatsList();
        }
    }

    updateChatsList() {
        const container = document.getElementById('chatsList');

        if (this.chats.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-dots"></i>
                    <p>Нет активных чатов</p>
                    <button class="btn-primary" id="emptyNewChatBtn">Начать чат</button>
                </div>
            `;
            document.getElementById('emptyNewChatBtn')?.addEventListener('click', () => this.showNewChatModal());
            return;
        }

        container.innerHTML = this.chats.map(chat => `
            <div class="chat-item" data-id="${chat.id}">
                <div class="chat-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="chat-info">
                    <div class="chat-name">${chat.name}</div>
                    <div class="chat-preview">${chat.lastMessage || 'Нет сообщений'}</div>
                </div>
                <div class="chat-time">${chat.lastTime || ''}</div>
            </div>
        `).join('');

        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                const contactId = item.dataset.id;
                const contact = this.contacts.find(c => c.id === contactId) ||
                    { id: contactId, name: contactId.substr(0, 12) };
                this.openChat(contact);
            });
        });
    }

    addLogEntry(contactId, message) {
        const logs = this.getLogs();
        logs.unshift({
            contact: contactId,
            message: message,
            time: new Date().toLocaleString()
        });
        localStorage.setItem('target_logs', JSON.stringify(logs.slice(0, 100)));
        this.updateLogsDisplay();
    }

    getLogs() {
        const saved = localStorage.getItem('target_logs');
        return saved ? JSON.parse(saved) : [];
    }

    updateLogsDisplay() {
        const container = document.getElementById('logsContainer');
        const logs = this.getLogs();

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>История пуста</p>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-item">
                <strong>${log.time}</strong><br>
                Кому: ${log.contact}<br>
                Сообщение: ${log.message}
            </div>
        `).join('');
    }

    clearLogs() {
        if (confirm('Очистить всю историю сообщений?')) {
            localStorage.removeItem('target_logs');
            this.updateLogsDisplay();
            this.addSystemMessage('История очищена');
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('target_theme', theme);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open-mobile');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }

    closeChat() {
        this.currentChat = null;
        document.getElementById('chatSidebar').classList.remove('open');
        document.getElementById('sendMessageBtn').disabled = true;
    }

    toggleSendButton() {
        const input = document.getElementById('messageInput');
        const btn = document.getElementById('sendMessageBtn');
        btn.disabled = !input.value.trim();
    }

    addSystemMessage(text) {
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            const msg = document.createElement('div');
            msg.className = 'message incoming';
            msg.innerHTML = `
                <strong>Система</strong><br>
                ${text}
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesArea.appendChild(msg);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }

    showToast(text) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-primary);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: fadeOut 2s ease forwards;
        `;
        toast.textContent = text;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new TargetApp();

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; visibility: hidden; }
        }
    `;
    document.head.appendChild(style);
});
