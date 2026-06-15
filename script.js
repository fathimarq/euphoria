// ============================================
// EUPHORIA - Main Game Logic (COMPLETE FIXED)
// ============================================

// ----- Global Variables -----
let userData = {
    wins: [],
    streak: 0,
    lastLogDate: null,
    meadowPosts: [],
    username: "A Gardener",
    avatar: "🌱"
};
let friendData = {
    friends: [],           // List of usernames you're friends with
    pendingRequests: [],   // Incoming friend requests
    sentRequests: []       // Outgoing friend requests
};

// Add to global variables
let chatData = {
    conversations: {}  // { friendUsername: [{ from, message, timestamp, read }] }
};

// Level thresholds
const LEVELS = [
    { title: "Seedling", minWins: 0, maxWins: 4, xpNeeded: 5 },
    { title: "Sprout", minWins: 5, maxWins: 9, xpNeeded: 10 },
    { title: "Bloomer", minWins: 10, maxWins: 19, xpNeeded: 15 },
    { title: "Gardener", minWins: 20, maxWins: 34, xpNeeded: 20 },
    { title: "Cultivator", minWins: 35, maxWins: 54, xpNeeded: 25 },
    { title: "Harvest Master", minWins: 55, maxWins: 79, xpNeeded: 30 },
    { title: "Green Thumb", minWins: 80, maxWins: 109, xpNeeded: 35 },
    { title: "Nature Keeper", minWins: 110, maxWins: 149, xpNeeded: 40 },
    { title: "Forest Guardian", minWins: 150, maxWins: 199, xpNeeded: 50 },
    { title: "Euphoria Legend", minWins: 200, maxWins: 9999, xpNeeded: 0 }
];

// Sample meadow posts
const SAMPLE_MEADOW_POSTS = [
    { id: "sample1", text: "I finally finished my project that I was avoiding for weeks!", photo: null, anonymous: false, username: "SunnyGardener", avatar: "🌻", date: new Date(Date.now() - 86400000).toISOString(), likes: 3, likedBy: [] },
    { id: "sample2", text: "Helped a friend who was feeling down. Felt really good.", photo: null, anonymous: true, username: "Anonymous Sprout", avatar: "🌱", date: new Date(Date.now() - 172800000).toISOString(), likes: 5, likedBy: [] },
    { id: "sample3", text: "Woke up early and went for a walk. Saw the sunrise 🌅", photo: null, anonymous: false, username: "MorningLeaf", avatar: "🍃", date: new Date(Date.now() - 259200000).toISOString(), likes: 2, likedBy: [] }
];

function loadData() {
    const currentUser = localStorage.getItem('euphoria_current_user');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const allUsersData = JSON.parse(localStorage.getItem('euphoria_all_users_data') || '{}');
    const allFriendsData = JSON.parse(localStorage.getItem('euphoria_all_friends_data') || '{}');
    const allChatsData = JSON.parse(localStorage.getItem('euphoria_all_chats_data') || '{}');
    
    // Load user data
    if (allUsersData[currentUser]) {
        userData = allUsersData[currentUser];
    } else {
        userData = {
            wins: [],
            streak: 0,
            lastLogDate: null,
            meadowPosts: JSON.parse(JSON.stringify(SAMPLE_MEADOW_POSTS)),
            username: currentUser,
            avatar: "🌱"
        };
        allUsersData[currentUser] = userData;
    }
    
    // Load friends data
    if (allFriendsData[currentUser]) {
        friendData = allFriendsData[currentUser];
    } else {
        friendData = {
            friends: [],
            pendingRequests: [],
            sentRequests: []
        };
        allFriendsData[currentUser] = friendData;
    }
    
    // Load chat data
    if (allChatsData[currentUser]) {
        chatData = allChatsData[currentUser];
    } else {
        chatData = {
            conversations: {}
        };
        allChatsData[currentUser] = chatData;
    }
    
    userData.username = currentUser;
    
    if (!userData.meadowPosts || userData.meadowPosts.length === 0) {
        userData.meadowPosts = JSON.parse(JSON.stringify(SAMPLE_MEADOW_POSTS));
    }
    
    if (!userData.avatar) userData.avatar = "🌱";
    
    saveData();
}

function saveData() {
    const currentUser = localStorage.getItem('euphoria_current_user');
    if (!currentUser) return;
    
    const allUsersData = JSON.parse(localStorage.getItem('euphoria_all_users_data') || '{}');
    const allFriendsData = JSON.parse(localStorage.getItem('euphoria_all_friends_data') || '{}');
    const allChatsData = JSON.parse(localStorage.getItem('euphoria_all_chats_data') || '{}');
    
    allUsersData[currentUser] = userData;
    allFriendsData[currentUser] = friendData;
    allChatsData[currentUser] = chatData;
    
    localStorage.setItem('euphoria_all_users_data', JSON.stringify(allUsersData));
    localStorage.setItem('euphoria_all_friends_data', JSON.stringify(allFriendsData));
    localStorage.setItem('euphoria_all_chats_data', JSON.stringify(allChatsData));
}

// ============================================
// FRIENDS SYSTEM FUNCTIONS
// ============================================

function getAllUsers() {
    const allUsersData = JSON.parse(localStorage.getItem('euphoria_all_users_data') || '{}');
    return Object.keys(allUsersData);
}

function getUserData(username) {
    const allUsersData = JSON.parse(localStorage.getItem('euphoria_all_users_data') || '{}');
    return allUsersData[username];
}

function getUserFriendsData(username) {
    const allFriendsData = JSON.parse(localStorage.getItem('euphoria_all_friends_data') || '{}');
    return allFriendsData[username] || { friends: [], pendingRequests: [], sentRequests: [] };
}

function saveUserFriendsData(username, data) {
    const allFriendsData = JSON.parse(localStorage.getItem('euphoria_all_friends_data') || '{}');
    allFriendsData[username] = data;
    localStorage.setItem('euphoria_all_friends_data', JSON.stringify(allFriendsData));
}

function sendFriendRequest(targetUsername) {
    const currentUser = localStorage.getItem('euphoria_current_user');
    
    if (!targetUsername || targetUsername.trim() === '') {
        showFriendFeedback('❌ Please enter a username!', false);
        return;
    }
    
    targetUsername = targetUsername.trim().toLowerCase();
    
    if (targetUsername === currentUser) {
        showFriendFeedback('❌ You cannot add yourself as a friend!', false);
        return;
    }
    
    const allUsers = getAllUsers();
    if (!allUsers.includes(targetUsername)) {
        showFriendFeedback('❌ User not found!', false);
        return;
    }
    
    if (friendData.friends.includes(targetUsername)) {
        showFriendFeedback('🌸 You are already friends with this user!', false);
        return;
    }
    
    if (friendData.sentRequests.includes(targetUsername)) {
        showFriendFeedback('⏳ Friend request already sent!', false);
        return;
    }
    
    if (friendData.pendingRequests.includes(targetUsername)) {
        showFriendFeedback('📬 This user already sent you a request! Check your pending requests.', false);
        return;
    }
    
    friendData.sentRequests.push(targetUsername);
    saveData();
    
    const targetFriendsData = getUserFriendsData(targetUsername);
    if (!targetFriendsData.pendingRequests.includes(currentUser)) {
        targetFriendsData.pendingRequests.push(currentUser);
        saveUserFriendsData(targetUsername, targetFriendsData);
    }
    
    showFriendFeedback(`✨ Friend request sent to ${targetUsername}! ✨`, true);
    refreshFriendsUI();
}

function acceptFriendRequest(friendUsername) {
    const currentUser = localStorage.getItem('euphoria_current_user');
    
    friendData.pendingRequests = friendData.pendingRequests.filter(f => f !== friendUsername);
    
    if (!friendData.friends.includes(friendUsername)) {
        friendData.friends.push(friendUsername);
    }
    saveData();
    
    const friendFriendsData = getUserFriendsData(friendUsername);
    if (friendFriendsData.sentRequests.includes(currentUser)) {
        friendFriendsData.sentRequests = friendFriendsData.sentRequests.filter(f => f !== currentUser);
    }
    if (!friendFriendsData.friends.includes(currentUser)) {
        friendFriendsData.friends.push(currentUser);
    }
    saveUserFriendsData(friendUsername, friendFriendsData);
    
    showFriendFeedback(`✨ You are now friends with ${friendUsername}! ✨`, true);
    refreshFriendsUI();
}

function declineFriendRequest(friendUsername) {
    const currentUser = localStorage.getItem('euphoria_current_user');
    
    friendData.pendingRequests = friendData.pendingRequests.filter(f => f !== friendUsername);
    saveData();
    
    const friendFriendsData = getUserFriendsData(friendUsername);
    if (friendFriendsData.sentRequests.includes(currentUser)) {
        friendFriendsData.sentRequests = friendFriendsData.sentRequests.filter(f => f !== currentUser);
        saveUserFriendsData(friendUsername, friendFriendsData);
    }
    
    showFriendFeedback(`❌ Declined request from ${friendUsername}`, false);
    refreshFriendsUI();
}

function removeFriend(friendUsername) {
    const currentUser = localStorage.getItem('euphoria_current_user');
    
    friendData.friends = friendData.friends.filter(f => f !== friendUsername);
    saveData();
    
    const friendFriendsData = getUserFriendsData(friendUsername);
    if (friendFriendsData.friends.includes(currentUser)) {
        friendFriendsData.friends = friendFriendsData.friends.filter(f => f !== currentUser);
        saveUserFriendsData(friendUsername, friendFriendsData);
    }
    
    showFriendFeedback(`👋 Removed ${friendUsername} from friends`, true);
    refreshFriendsUI();
}

function showFriendFeedback(message, isSuccess) {
    const feedback = document.getElementById("friendRequestFeedback");
    if (feedback) {
        feedback.textContent = message;
        feedback.style.color = isSuccess ? "#F4C542" : "#E07A5F";
        setTimeout(() => {
            feedback.textContent = "";
        }, 3000);
    }
}

// ============================================
// CHAT SYSTEM FUNCTIONS
// ============================================

function sendMessage(friendUsername, message) {
    const currentUser = localStorage.getItem('euphoria_current_user');
    
    if (!message || message.trim() === '') return false;
    message = message.trim();
    
    if (!chatData.conversations[friendUsername]) {
        chatData.conversations[friendUsername] = [];
    }
    
    chatData.conversations[friendUsername].push({
        from: currentUser,
        message: message,
        timestamp: Date.now(),
        read: true
    });
    saveData();
    
    const friendChatData = getUserChatData(friendUsername);
    if (!friendChatData.conversations[currentUser]) {
        friendChatData.conversations[currentUser] = [];
    }
    
    friendChatData.conversations[currentUser].push({
        from: currentUser,
        message: message,
        timestamp: Date.now(),
        read: false
    });
    saveUserChatData(friendUsername, friendChatData);
    
    return true;
}

function getUserChatData(username) {
    const allChatsData = JSON.parse(localStorage.getItem('euphoria_all_chats_data') || '{}');
    return allChatsData[username] || { conversations: {} };
}

function saveUserChatData(username, data) {
    const allChatsData = JSON.parse(localStorage.getItem('euphoria_all_chats_data') || '{}');
    allChatsData[username] = data;
    localStorage.setItem('euphoria_all_chats_data', JSON.stringify(allChatsData));
}

function markMessagesAsRead(friendUsername) {
    if (chatData.conversations[friendUsername]) {
        let updated = false;
        chatData.conversations[friendUsername].forEach(msg => {
            if (!msg.read && msg.from !== localStorage.getItem('euphoria_current_user')) {
                msg.read = true;
                updated = true;
            }
        });
        if (updated) saveData();
    }
}

function getUnreadCount() {
    let count = 0;
    for (const friend in chatData.conversations) {
        chatData.conversations[friend].forEach(msg => {
            if (!msg.read && msg.from !== localStorage.getItem('euphoria_current_user')) {
                count++;
            }
        });
    }
    return count;
}

function openChatModal(friendUsername, friendAvatar = "🌱") {
    markMessagesAsRead(friendUsername);
    refreshFriendsUI();
    
    const modal = document.createElement("div");
    modal.className = "chat-modal";
    modal.innerHTML = `
        <div class="chat-modal-overlay">
            <div class="chat-modal-container">
                <div class="chat-modal-header">
                    <div class="chat-header-info">
                        <span class="chat-avatar">${friendAvatar}</span>
                        <span class="chat-name">${friendUsername}</span>
                    </div>
                    <button class="chat-close-btn">✖</button>
                </div>
                <div class="chat-messages" id="chatMessages">
                    ${renderChatMessages(friendUsername)}
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chatMessageInput" class="chat-input" placeholder="Type a message..." maxlength="200">
                    <button id="chatSendBtn" class="chat-send-btn">📨 SEND</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const messagesContainer = modal.querySelector(".chat-messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    modal.querySelector(".chat-close-btn").addEventListener("click", () => modal.remove());
    modal.querySelector(".chat-modal-overlay").addEventListener("click", (e) => {
        if (e.target === modal.querySelector(".chat-modal-overlay")) modal.remove();
    });
    
    const messageInput = modal.querySelector("#chatMessageInput");
    const sendBtn = modal.querySelector("#chatSendBtn");
    
    const sendMessageHandler = () => {
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(friendUsername, message);
            messageInput.value = "";
            const messagesDiv = modal.querySelector(".chat-messages");
            messagesDiv.innerHTML = renderChatMessages(friendUsername);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            refreshFriendsUI();
        }
    };
    
    sendBtn.addEventListener("click", sendMessageHandler);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessageHandler();
    });
}

function renderChatMessages(friendUsername) {
    const currentUser = localStorage.getItem('euphoria_current_user');
    const messages = chatData.conversations[friendUsername] || [];
    
    if (messages.length === 0) {
        return '<div class="chat-empty">💬 No messages yet. Say hi! 💬</div>';
    }
    
    return messages.map(msg => {
        const isMe = msg.from === currentUser;
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="chat-message ${isMe ? 'chat-message-me' : 'chat-message-them'}">
                <div class="chat-message-bubble">
                    <div class="chat-message-text">${escapeHtml(msg.message)}</div>
                    <div class="chat-message-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');
}

function refreshFriendsUI() {
    const unreadCount = getUnreadCount();
    const unreadBadge = document.getElementById("unreadBadge");
    if (unreadBadge) {
        if (unreadCount > 0) {
            unreadBadge.textContent = `${unreadCount} new`;
            unreadBadge.style.display = "inline-block";
        } else {
            unreadBadge.style.display = "none";
        }
    }
    
    const pendingContainer = document.getElementById("pendingRequestsList");
    if (pendingContainer) {
        if (friendData.pendingRequests.length === 0) {
            pendingContainer.innerHTML = "<div class='empty-garden'>✨ No pending requests ✨</div>";
        } else {
            pendingContainer.innerHTML = friendData.pendingRequests.map(username => `
                <div class="friend-request-item">
                    <div class="friend-avatar">${getUserData(username)?.avatar || "🌱"}</div>
                    <div class="friend-name">${username}</div>
                    <div class="friend-actions">
                        <button class="pixel-button-small accept-friend" data-friend="${username}">✅ ACCEPT</button>
                        <button class="pixel-button-small decline-friend" data-friend="${username}">❌ DECLINE</button>
                    </div>
                </div>
            `).join("");
            
            document.querySelectorAll('.accept-friend').forEach(btn => {
                btn.addEventListener('click', () => acceptFriendRequest(btn.dataset.friend));
            });
            document.querySelectorAll('.decline-friend').forEach(btn => {
                btn.addEventListener('click', () => declineFriendRequest(btn.dataset.friend));
            });
        }
    }
    
    const friendsContainer = document.getElementById("friendsList");
    if (friendsContainer) {
        if (friendData.friends.length === 0) {
            friendsContainer.innerHTML = "<div class='empty-garden'>🌱 Add some friends to see them here 🌱</div>";
        } else {
            friendsContainer.innerHTML = friendData.friends.map(username => {
                const friendUserData = getUserData(username);
                const hasUnread = chatData.conversations[username]?.some(msg => !msg.read && msg.from !== localStorage.getItem('euphoria_current_user')) || false;
                return `
                    <div class="friend-item">
                        <div class="friend-avatar">${friendUserData?.avatar || "🌱"}</div>
                        <div class="friend-name">${username} ${hasUnread ? '<span class="unread-dot">●</span>' : ''}</div>
                        <div class="friend-stats">
                            🌱 ${friendUserData?.wins?.length || 0} wins
                        </div>
                        <div class="friend-actions">
                            <button class="pixel-button-small chat-friend" data-friend="${username}" data-avatar="${friendUserData?.avatar || "🌱"}">💬 CHAT</button>
                            <button class="pixel-button-small visit-garden" data-friend="${username}">🌿 VISIT</button>
                            <button class="pixel-button-small remove-friend" data-friend="${username}">🗑️ REMOVE</button>
                        </div>
                    </div>
                `;
            }).join("");
            
            document.querySelectorAll('.chat-friend').forEach(btn => {
                btn.addEventListener('click', () => openChatModal(btn.dataset.friend, btn.dataset.avatar));
            });
            document.querySelectorAll('.visit-garden').forEach(btn => {
                btn.addEventListener('click', () => visitFriendGarden(btn.dataset.friend));
            });
            document.querySelectorAll('.remove-friend').forEach(btn => {
                btn.addEventListener('click', () => removeFriend(btn.dataset.friend));
            });
        }
    }
}

function visitFriendGarden(friendUsername) {
    const friendUserData = getUserData(friendUsername);
    if (!friendUserData) {
        showFriendFeedback("❌ Could not load friend's garden", false);
        return;
    }
    
    const modal = document.createElement("div");
    modal.className = "plant-popup-modal";
    modal.innerHTML = `
        <div class="plant-popup-overlay">
            <div class="plant-popup-container" style="max-width: 500px;">
                <button class="plant-popup-close">✖</button>
                <div class="plant-popup-emoji">${friendUserData.avatar || "🌱"}</div>
                <div class="plant-popup-name" style="font-size: 16px;">${friendUsername}'s Garden</div>
                <div class="plant-popup-good" style="max-height: 300px; overflow-y: auto;">
                    <div style="font-family: 'Press Start 2P', monospace; font-size: 10px; margin-bottom: 12px;">🌱 TOTAL WINS: ${friendUserData.wins?.length || 0}</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                        ${friendUserData.wins?.slice(-9).reverse().map(win => `
                            <div style="text-align: center; font-size: 32px;" title="${win.goodThing.substring(0, 30)}">${win.plantCard.plantEmoji}</div>
                        `).join('') || '<div>No plants yet 🌱</div>'}
                    </div>
                    ${friendUserData.wins?.length > 9 ? '<div style="margin-top: 12px; font-size: 11px;">✨ + more in their garden ✨</div>' : ''}
                </div>
                <button class="plant-popup-close-btn">CLOSE</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const closeModal = () => modal.remove();
    modal.querySelectorAll(".plant-popup-close, .plant-popup-close-btn, .plant-popup-overlay").forEach(el => {
        el.addEventListener("click", closeModal);
    });
}

// ============================================
// CORE GAME FUNCTIONS
// ============================================

function setupResetButton() {
    const resetBtn = document.getElementById("resetButton");
    const confirmBox = document.getElementById("deleteConfirmBox");
    if (!resetBtn || !confirmBox) return;
    
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
    
    newResetBtn.addEventListener("click", function(e) {
        e.preventDefault();
        confirmBox.style.display = "block";
    });
    
    const confirmYes = document.getElementById("confirmDeleteYes");
    if (confirmYes) {
        const newConfirmYes = confirmYes.cloneNode(true);
        confirmYes.parentNode.replaceChild(newConfirmYes, confirmYes);
        newConfirmYes.addEventListener("click", function() {
            performHardReset();
            confirmBox.style.display = "none";
        });
    }
    
    const confirmNo = document.getElementById("confirmDeleteNo");
    if (confirmNo) {
        const newConfirmNo = confirmNo.cloneNode(true);
        confirmNo.parentNode.replaceChild(newConfirmNo, confirmNo);
        newConfirmNo.addEventListener("click", function() {
            confirmBox.style.display = "none";
        });
    }
}

function performHardReset() {
    const currentUser = localStorage.getItem('euphoria_current_user');
    if (!currentUser) return;
    
    userData = {
        wins: [],
        streak: 0,
        lastLogDate: null,
        meadowPosts: JSON.parse(JSON.stringify(SAMPLE_MEADOW_POSTS)),
        username: currentUser,
        avatar: "🌱"
    };
    saveData();
    
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("liked_")) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    refreshAllDisplays();
    showFeedback("💀 All data wiped. Start fresh, gardener. 💀", false);
}

function formatDate() {
    return new Date().toISOString().split('T')[0];
}

function checkAndUpdateStreak() {
    const today = formatDate();
    const lastDate = userData.lastLogDate;
    
    if (!lastDate) {
        userData.streak = 1;
    } else {
        const last = new Date(lastDate);
        const current = new Date(today);
        const diffDays = Math.floor((current - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            userData.streak += 1;
        } else if (diffDays > 1) {
            userData.streak = 1;
        }
    }
    userData.lastLogDate = today;
}

function getCurrentLevel() {
    const totalWins = userData.wins.length;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (totalWins >= LEVELS[i].minWins) return LEVELS[i];
    }
    return LEVELS[0];
}

function getXPProgress() {
    const totalWins = userData.wins.length;
    const level = getCurrentLevel();
    const winsInLevel = totalWins - level.minWins;
    const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
    if (!nextLevel) return { currentXP: 0, neededXP: 0, percentage: 100 };
    const neededXP = nextLevel.minWins - level.minWins;
    const percentage = Math.min(100, (winsInLevel / neededXP) * 100);
    return { currentXP: winsInLevel, neededXP: neededXP, percentage: percentage };
}

function addWin(goodThing, photoBase64 = null) {
    if (!goodThing.trim()) {
        showFeedback("🌱 Write something good you did today!", false);
        return false;
    }
    
    const today = formatDate();
    const alreadyLoggedToday = userData.wins.some(win => win.date === today);
    if (alreadyLoggedToday) {
        showFeedback("🌸 You already planted a win today! Come back tomorrow 🌸", false);
        return false;
    }
    
    const totalWinsBefore = userData.wins.length;
    const newWinCount = totalWinsBefore + 1;
    const plantCard = getPlantCardForWin(newWinCount, goodThing, today);
    
    userData.wins.push({
        goodThing: goodThing,
        date: today,
        photo: photoBase64,
        plantCard: plantCard
    });
    
    checkAndUpdateStreak();
    saveData();
    animatePlantGrowth(goodThing, plantCard);
    showFeedback(`✨ PLANTED! You earned a ${plantCard.plantName} card! ✨`, true);
    return true;
}

function animatePlantGrowth(goodThing, plantCard) {
    const miniGarden = document.getElementById("miniGarden");
    if (!miniGarden) return;
    
    const tempPlant = document.createElement("div");
    tempPlant.style.fontSize = "40px";
    tempPlant.style.textAlign = "center";
    tempPlant.style.animation = "gentleBob 0.2s steps(3)";
    tempPlant.innerHTML = "🌱";
    miniGarden.prepend(tempPlant);
    
    setTimeout(() => { tempPlant.innerHTML = "🌿"; }, 300);
    setTimeout(() => { tempPlant.innerHTML = plantCard.plantEmoji; tempPlant.classList.add("rare"); }, 600);
    setTimeout(() => { tempPlant.remove(); refreshAllDisplays(); }, 1200);
}

function showFeedback(message, isSuccess) {
    const feedback = document.getElementById("plantFeedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.color = isSuccess ? "#F4C542" : "#E07A5F";
    setTimeout(() => { feedback.textContent = ""; }, 3000);
}

function toggleLike(postId) {
    const post = userData.meadowPosts.find(p => p.id === postId);
    if (!post) return;
    const likeKey = `liked_${postId}`;
    const alreadyLiked = sessionStorage.getItem(likeKey) === "true";
    if (!alreadyLiked) {
        post.likes = (post.likes || 0) + 1;
        sessionStorage.setItem(likeKey, "true");
    } else {
        post.likes = (post.likes || 1) - 1;
        sessionStorage.removeItem(likeKey);
    }
    saveData();
    refreshMeadow();
}

function refreshAllDisplays() {
    refreshStreakAndStats();
    refreshGarden();
    refreshAlbum();
    refreshHistory();
    refreshMeadow();
    refreshMiniGarden();
    refreshSettingsUI();
    refreshFriendsUI();
}

function refreshStreakAndStats() {
    const streakEl = document.getElementById("streakCount");
    const totalWinsEl = document.getElementById("totalWins");
    const levelTitleEl = document.getElementById("levelTitle");
    const xpFillEl = document.getElementById("xpFill");
    const xpTextEl = document.getElementById("xpText");
    
    if (streakEl) streakEl.innerText = userData.streak;
    if (totalWinsEl) totalWinsEl.innerText = userData.wins.length;
    const level = getCurrentLevel();
    if (levelTitleEl) levelTitleEl.innerText = level.title;
    const xp = getXPProgress();
    if (xpFillEl) xpFillEl.style.width = `${xp.percentage}%`;
    if (xpTextEl) xpTextEl.innerText = `${xp.currentXP} / ${xp.neededXP} XP`;
}

function refreshMiniGarden() {
    const miniGarden = document.getElementById("miniGarden");
    if (!miniGarden) return;
    const recentWins = [...userData.wins].reverse().slice(0, 6);
    if (recentWins.length === 0) {
        miniGarden.innerHTML = "<span class='empty-garden'>✨ Plant your first win ✨</span>";
        return;
    }
    miniGarden.innerHTML = recentWins.map(win => `<div class="garden-plant" style="font-size: 32px; cursor: default;" title="${win.goodThing.substring(0, 30)}">${win.plantCard.plantEmoji}</div>`).join("");
}

function refreshGarden() {
    const gardenGrid = document.getElementById("gardenGrid");
    if (!gardenGrid) return;
    if (userData.wins.length === 0) {
        gardenGrid.innerHTML = "<div class='empty-garden'>🌱 No plants yet. Log your first win! 🌱</div>";
        return;
    }
    const wins = [...userData.wins];
    const plantsHTML = wins.map((win, index) => `<div class="garden-plant ${win.plantCard.rarity === 'Mythic' || win.plantCard.rarity === 'Ultimate' ? 'rare' : ''}" data-win-index="${index}" title="${win.goodThing.substring(0, 40)} - ${win.date}">${win.plantCard.plantEmoji}</div>`).join("");
    gardenGrid.innerHTML = plantsHTML;
    
    document.querySelectorAll('.garden-plant[data-win-index]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(el.dataset.winIndex);
            const win = wins[index];
            showPlantDetailPopup(win);
        });
    });
}

function showPlantDetailPopup(win) {
    const existingModal = document.querySelector(".plant-popup-modal");
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement("div");
    modal.className = "plant-popup-modal";
    modal.innerHTML = `
        <div class="plant-popup-overlay">
            <div class="plant-popup-container">
                <button class="plant-popup-close">✖</button>
                <div class="plant-popup-emoji">${win.plantCard.plantEmoji}</div>
                <div class="plant-popup-name">${win.plantCard.plantName}</div>
                <div class="plant-popup-date">📅 ${win.date}</div>
                <div class="plant-popup-good">"${escapeHtml(win.goodThing)}"</div>
                ${win.photo ? `<img src="${win.photo}" class="plant-popup-photo" alt="memory">` : '<div class="plant-popup-no-photo">📷 No photo added</div>'}
                <div class="plant-popup-quote">✨ "${win.plantCard.quote}"</div>
                <button class="plant-popup-close-btn">CLOSE</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const closeModal = () => modal.remove();
    modal.querySelectorAll(".plant-popup-close, .plant-popup-close-btn, .plant-popup-overlay").forEach(el => {
        el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeModal();
            document.removeEventListener("keydown", this);
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("euphoria_current_user");
            window.location.href = "index.html";
        });
    }
}

function refreshAlbum() {
    const albumGrid = document.getElementById("albumGrid");
    const albumStats = document.getElementById("albumStats");
    if (!albumGrid) return;
    const totalWins = userData.wins.length;
    const unlockedPlants = getUnlockedPlants(totalWins);
    if (albumStats) albumStats.innerText = `${unlockedPlants.length} / ${PLANTS.length} cards collected`;
    const albumHTML = PLANTS.map(plant => {
        const isUnlocked = totalWins >= plant.unlockWins;
        const winWithThisPlant = userData.wins.find(w => w.plantCard.plantId === plant.id);
        const emoji = isUnlocked ? plant.emoji : "❓";
        const name = isUnlocked ? plant.name : "???";
        return `<div class="album-card ${!isUnlocked ? 'locked' : ''}" onclick="${isUnlocked ? `showCardFlip('${plant.id}', '${plant.name}', '${plant.emoji}', '${plant.quote.replace(/'/g, "\\'")}', '${winWithThisPlant ? winWithThisPlant.goodThing.replace(/'/g, "\\'") : ''}')` : ''}"><div class="album-card-plant">${emoji}</div><div class="album-card-name">${name}</div><div class="album-card-rarity">${plant.rarity}</div>${!isUnlocked ? `<div style="font-size: 10px; margin-top: 6px;">🔒 ${plant.unlockWins} wins</div>` : ''}</div>`;
    }).join("");
    albumGrid.innerHTML = albumHTML;
}

function showCardFlip(plantId, plantName, plantEmoji, quote, goodThing) {
    // Remove any existing modal
    const existingModal = document.querySelector(".card-flip-modal");
    if (existingModal) existingModal.remove();
    
    // Create modal
    const modal = document.createElement("div");
    modal.className = "card-flip-modal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 20000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="
            background: #FFFFF0;
            border: 4px solid #6B8C42;
            padding: 24px;
            max-width: 320px;
            width: 85%;
            text-align: center;
            position: relative;
            box-shadow: 8px 8px 0px #2D3E1A;
        ">
            <div style="position: absolute; top: 8px; right: 10px;">
                <button class="card-flip-close" style="
                    background: #E07A5F;
                    border: 2px solid #8B3A2A;
                    color: white;
                    font-family: 'Press Start 2P', monospace;
                    font-size: 10px;
                    cursor: pointer;
                    padding: 2px 8px;
                ">✖</button>
            </div>
            <div style="font-size: 64px; margin-bottom: 12px;">${plantEmoji}</div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 14px; color: #6B8C42; margin-bottom: 8px;">${plantName}</div>
            <div style="font-family: 'Press Start 2P', monospace; font-size: 10px; color: #A5673F; margin-bottom: 16px;">✨ "${quote}"</div>
            ${goodThing ? `<div style="font-size: 14px; margin-top: 12px; padding-top: 12px; border-top: 2px solid #4A5A3A;">🌱 "${goodThing.substring(0, 80)}"</div>` : ''}
            <button class="card-flip-close-bottom" style="
                font-family: 'Press Start 2P', monospace;
                background: #6B8C42;
                border: 2px solid #2D3E1A;
                color: #F8F0DC;
                padding: 8px 16px;
                cursor: pointer;
                font-size: 10px;
                margin-top: 16px;
            ">CLOSE</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close functions
    const closeModal = () => modal.remove();
    
    // Close button (X)
    const closeBtn = modal.querySelector(".card-flip-close");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    
    // Close bottom button
    const closeBottomBtn = modal.querySelector(".card-flip-close-bottom");
    if (closeBottomBtn) closeBottomBtn.addEventListener("click", closeModal);
    
    // Close when clicking outside
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Close with ESC key
    const escHandler = (e) => {
        if (e.key === "Escape") {
            closeModal();
            document.removeEventListener("keydown", escHandler);
        }
    };
    document.addEventListener("keydown", escHandler);
}
function refreshHistory() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;
    if (userData.wins.length === 0) {
        historyList.innerHTML = "<div class='empty-garden'>📜 No roots yet. Start planting!</div>";
        return;
    }
    const historyHTML = [...userData.wins].reverse().map(win => `<div class="history-item"><div class="history-date">${win.date} — ${win.plantCard.plantName} ${win.plantCard.plantEmoji}</div><div class="history-good">🌱 ${escapeHtml(win.goodThing)}</div>${win.photo ? `<img src="${win.photo}" class="history-photo-small" alt="memory">` : ''}</div>`).join("");
    historyList.innerHTML = historyHTML;
}

function refreshMeadow() {
    const meadowFeed = document.getElementById("meadowFeed");
    if (!meadowFeed) return;
    const posts = [...userData.meadowPosts].reverse();
    if (posts.length === 0) {
        meadowFeed.innerHTML = "<div class='empty-garden'>🌸 No posts yet. Be the first to share!</div>";
        return;
    }
    meadowFeed.innerHTML = posts.map(post => {
        const likeKey = `liked_${post.id}`;
        const userLiked = sessionStorage.getItem(likeKey) === "true";
        return `<div class="meadow-post"><div class="meadow-post-header"><div><span class="meadow-post-avatar">${post.avatar || "🌱"}</span><span>${post.anonymous ? "🙈 Anonymous Sprout" : escapeHtml(post.username || "A Gardener")}</span></div><span>${new Date(post.date).toLocaleDateString()}</span></div><div class="meadow-post-text">${escapeHtml(post.text)}</div>${post.photo ? `<img src="${post.photo}" class="meadow-post-image-small" alt="shared moment">` : ''}<div class="meadow-post-footer"><button class="like-button ${userLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">${userLiked ? '❤️' : '🤍'} LIKE</button><span class="like-count">${post.likes || 0} ${(post.likes || 0) === 1 ? 'heart' : 'hearts'}</span></div></div>`;
    }).join("");
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function addMeadowPost(text, photoBase64, isAnonymous) {
    if (!text.trim()) return false;
    userData.meadowPosts.push({
        id: Date.now().toString(),
        text: text,
        photo: photoBase64,
        anonymous: isAnonymous,
        username: isAnonymous ? null : userData.username,
        avatar: isAnonymous ? "🌱" : userData.avatar,
        date: new Date().toISOString(),
        likes: 0,
        likedBy: []
    });
    saveData();
    refreshMeadow();
    return true;
}

function refreshSettingsUI() {
    const usernameDisplay = document.getElementById("usernameDisplay");
    const profilePreviewAvatar = document.getElementById("profilePreviewAvatar");
    const profilePreviewName = document.getElementById("profilePreviewName");
    
    if (usernameDisplay) usernameDisplay.innerText = userData.username;
    if (profilePreviewName) profilePreviewName.innerText = userData.username;
    if (profilePreviewAvatar) profilePreviewAvatar.innerText = userData.avatar;
    
    document.querySelectorAll(".avatar-item").forEach(opt => {
        opt.classList.remove("selected");
        if (opt.dataset.avatar === userData.avatar) {
            opt.classList.add("selected");
        }
    });
}

function setAvatar(avatar) {
    userData.avatar = avatar;
    saveData();
    refreshSettingsUI();
    refreshMeadow();
    const msgEl = document.getElementById("avatarUpdateMessage");
    if (msgEl) {
        msgEl.style.display = "block";
        setTimeout(() => {
            msgEl.style.opacity = "0";
            setTimeout(() => {
                msgEl.style.display = "none";
                msgEl.style.opacity = "1";
            }, 500);
        }, 1500);
    }
}

// ============================================
// DOM CONTENT LOADED
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    setupLogout();
    
    const mantraEl = document.getElementById("dailyMantra");
    if (mantraEl && typeof getDailyMantra === 'function') mantraEl.innerText = getDailyMantra();
    
    const tabs = document.querySelectorAll(".pixel-tab");
    const contents = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            const targetEl = document.getElementById(targetTab);
            if (targetEl) targetEl.classList.add("active");
        });
    });
    
    const submitBtn = document.getElementById("submitWin");
    const goodInput = document.getElementById("goodThingInput");
    const photoUpload = document.getElementById("photoUpload");
    let currentPhoto = null;
    if (photoUpload) {
        photoUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    currentPhoto = ev.target.result;
                    const photoNameSpan = document.getElementById("photoName");
                    if (photoNameSpan) photoNameSpan.innerText = "📷 Photo added";
                };
                reader.readAsDataURL(file);
            }
        });
    }
    if (submitBtn && goodInput) {
        submitBtn.addEventListener("click", () => {
            const goodThing = goodInput.value.trim();
            if (goodThing) {
                addWin(goodThing, currentPhoto);
                goodInput.value = "";
                currentPhoto = null;
                const photoNameSpan = document.getElementById("photoName");
                if (photoNameSpan) photoNameSpan.innerText = "No photo";
                if (photoUpload) photoUpload.value = "";
            }
        });
    }
    
    const sendRequestBtn = document.getElementById("sendFriendRequest");
    const friendUsernameInput = document.getElementById("friendUsername");
    if (sendRequestBtn && friendUsernameInput) {
        sendRequestBtn.addEventListener("click", () => {
            const username = friendUsernameInput.value.trim();
            if (username) {
                sendFriendRequest(username);
                friendUsernameInput.value = "";
            }
        });
        friendUsernameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendRequestBtn.click();
        });
    }
    
    const meadowPost = document.getElementById("meadowPost");
    const meadowPhoto = document.getElementById("meadowPhoto");
    const anonymousCheck = document.getElementById("anonymousToggle");
    const submitMeadow = document.getElementById("submitMeadowPost");
    let meadowCurrentPhoto = null;
    if (meadowPhoto) {
        meadowPhoto.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => { meadowCurrentPhoto = ev.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }
    if (submitMeadow && meadowPost) {
        submitMeadow.addEventListener("click", () => {
            const text = meadowPost.value.trim();
            if (text) {
                addMeadowPost(text, meadowCurrentPhoto, anonymousCheck ? anonymousCheck.checked : false);
                meadowPost.value = "";
                meadowCurrentPhoto = null;
                if (meadowPhoto) meadowPhoto.value = "";
            }
        });
    }
    
    document.querySelectorAll(".avatar-item").forEach(opt => opt.addEventListener("click", () => setAvatar(opt.dataset.avatar)));
    setupResetButton();
    
    window.toggleLike = toggleLike;
    window.showCardFlip = showCardFlip;
    
    refreshAllDisplays();
});