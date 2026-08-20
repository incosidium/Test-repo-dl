// Navigation System
function showSection(id) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Data
const demons = [
    { rank: 1, name: "Bloodbath GDPS Edition", publisher: "User1", victors: ["PlayerA", "PlayerB"] },
    { rank: 2, name: "Cataclysm Reborn", publisher: "User2", victors: ["PlayerA"] },
    { rank: 151, name: "Old Hard Level", publisher: "User3", victors: ["PlayerB"] } // Legacy example
];

const MAX_MAIN_LIST = 150;
const K = Math.log(1000) / (MAX_MAIN_LIST - 1);

function getPoints(rank) {
    if (rank > MAX_MAIN_LIST) return 0;
    return Math.round(1000 * Math.exp(-K * (rank - 1)));
}

// Render Demon List
function renderList() {
    const container = document.getElementById('list-container');
    container.innerHTML = demons.map(d => {
        const pts = getPoints(d.rank);
        const isLegacy = d.rank > MAX_MAIN_LIST;
        return `
            <div class="card ${isLegacy ? 'legacy' : ''}">
                <h3>#${d.rank} - ${d.name} ${isLegacy ? '(Legacy List)' : ''}</h3>
                <p>Publisher: ${d.publisher} | Points: <strong>${pts}</strong></p>
            </div>
        `;
    }).join('');
}

// Render Leaderboard
function renderLeaderboard() {
    const scores = {};
    demons.forEach(d => {
        const pts = getPoints(d.rank);
        d.victors.forEach(v => {
            scores[v] = (scores[v] || 0) + pts;
        });
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    document.getElementById('leaderboard-container').innerHTML = sorted.map(([player, score], idx) => `
        <div class="card">
            <h4>#${idx + 1} ${player} - ${score} Points</h4>
        </div>
    `).join('');
}

// Roulette System
function spinRoulette() {
    const randomDemon = demons[Math.floor(Math.random() * demons.length)];
    document.getElementById('roulette-result').innerHTML = `
        <div class="card">
            <h3>Target: #${randomDemon.rank} - ${randomDemon.name}</h3>
        </div>
    `;
}

// Initialize
renderList();
renderLeaderboard();
