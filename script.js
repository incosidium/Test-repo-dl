// Global Configuration
const MAX_MAIN_LIST = 150; // Levels past rank 150 move to Legacy List
const K = Math.log(1000) / (MAX_MAIN_LIST - 1); // Exponential decay constant

// Database of Demons
const demons = [
    {
        id: "bloodbath-gdps",
        rank: 1,
        name: "Bloodbath GDPS Edition",
        publisher: "User1",
        verifier: "PlayerA",
        thumbnail: "https://files.catbox.moe/example.png",
        verificationUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "The current hardest demon on the server.",
        victors: [
            { name: "PlayerA", proof: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
            { name: "PlayerB", proof: "https://www.tiktok.com/@user/video/1234567890" }
        ]
    },
    {
        id: "cataclysm-reborn",
        rank: 2,
        name: "Cataclysm Reborn",
        publisher: "User2",
        verifier: "PlayerC",
        thumbnail: "https://files.catbox.moe/example2.png",
        verificationUrl: "https://files.catbox.moe/examplevideo.mp4",
        description: "Former top 1 demon.",
        victors: [
            { name: "PlayerA", proof: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        ]
    },
    {
        id: "old-hard-level",
        rank: 151,
        name: "Old Hard Level",
        publisher: "User3",
        verifier: "PlayerB",
        thumbnail: "https://files.catbox.moe/example3.png",
        verificationUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Classic level moved to the Legacy List.",
        victors: [
            { name: "PlayerB", proof: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
        ]
    }
];

// Database of Upcoming/Unverified Demons
const upcomingDemons = [
    { name: "Silent Clubstep GDPS", creator: "User4", progress: "89% Verification" }
];

// Exponential Formula for Calculation
function getPoints(rank) {
    if (rank > MAX_MAIN_LIST) return 0;
    return Math.round(1000 * Math.exp(-K * (rank - 1)));
}

// Handles Embedded Media for YouTube, TikTok, and Catbox Videos
function getMediaEmbed(url) {
    if (!url) return "<p>No video available</p>";

    // YouTube Embed Parsing
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const id = (match && match[2].length === 11) ? match[2] : null;
        if (id) {
            return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>`;
        }
    }

    // Catbox Direct Video Parsing (.mp4, .webm)
    if (url.includes("catbox.moe") && (url.endsWith(".mp4") || url.endsWith(".webm"))) {
        return `<video width="100%" height="400" controls><source src="${url}"></video>`;
    }

    // TikTok Embed Parsing
    if (url.includes("tiktok.com")) {
        const videoId = url.split('/video/')[1]?.split('?')[0];
        if (videoId) {
            return `<iframe width="100%" height="500" src="https://www.tiktok.com/embed/v2/${videoId}" allowfullscreen></iframe>`;
        }
    }

    // Fallback Link
    return `<p><a href="${url}" target="_blank" rel="noopener">Watch Video Link</a></p>`;
}

// Section Switcher
function showSection(id) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Render Demon List
function renderList() {
    const container = document.getElementById('list-container');
    container.innerHTML = demons.sort((a, b) => a.rank - b.rank).map(d => {
        const pts = getPoints(d.rank);
        const isLegacy = d.rank > MAX_MAIN_LIST;
        return `
            <div class="card clickable ${isLegacy ? 'legacy' : ''}" onclick="openLevel('${d.id}')">
                <div class="card-flex">
                    <img src="${d.thumbnail}" class="card-thumb" alt="${d.name}" onerror="this.src='https://via.placeholder.com/140x80?text=No+Image'">
                    <div>
                        <h3 style="margin:0 0 5px 0;">#${d.rank} - ${d.name} ${isLegacy ? '(Legacy)' : ''}</h3>
                        <p style="margin:0; color:#ccc;">Publisher: ${d.publisher} | Points: <strong>${pts}</strong></p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Open Dynamic Single Level Page
function openLevel(levelId) {
    const level = demons.find(d => d.id === levelId);
    if (!level) return;

    const pts = getPoints(level.rank);
    const container = document.getElementById('level-info-container');

    container.innerHTML = `
        <div class="card">
            <h1 style="margin-top:0;">#${level.rank} - ${level.name}</h1>
            <p><strong>Publisher:</strong> ${level.publisher} | <strong>Verifier:</strong> ${level.verifier}</p>
            <p><strong>Points Granted:</strong> ${pts}</p>
            <p>${level.description}</p>

            <h3>Verification Video</h3>
            <div class="media-container">${getMediaEmbed(level.verificationUrl)}</div>

            <h3>Victors (${level.victors.length})</h3>
            <ul>
                ${level.victors.map(v => `
                    <li>
                        <strong>${v.name}</strong> - 
                        <a href="${v.proof}" target="_blank" rel="noopener">Proof</a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    showSection('level-details');
}

// Render Leaderboard
function renderLeaderboard() {
    const scores = {};
    demons.forEach(d => {
        const pts = getPoints(d.rank);
        d.victors.forEach(v => {
            scores[v.name] = (scores[v.name] || 0) + pts;
        });
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    document.getElementById('leaderboard-container').innerHTML = sorted.map(([player, score], idx) => `
        <div class="card">
            <h3 style="margin:0;">#${idx + 1} ${player} — <strong>${score} Points</strong></h3>
        </div>
    `).join('');
}

// Render Upcoming Demons
function renderUpcoming() {
    const container = document.getElementById('upcoming-container');
    container.innerHTML = upcomingDemons.map(u => `
        <div class="card">
            <h3>${u.name}</h3>
            <p>Creator: ${u.creator} | Status: ${u.progress}</p>
        </div>
    `).join('');
}

// Spin Demon Roulette
function spinRoulette() {
    const randomDemon = demons[Math.floor(Math.random() * demons.length)];
    document.getElementById('roulette-result').innerHTML = `
        <div class="card clickable" style="margin-top:15px;" onclick="openLevel('${randomDemon.id}')">
            <h3>Target: #${randomDemon.rank} - ${randomDemon.name}</h3>
            <p>Click here to view level details.</p>
        </div>
    `;
}

// Initial Page Load Initialization
renderList();
renderLeaderboard();
renderUpcoming();
