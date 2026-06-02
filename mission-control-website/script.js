// DEVO Mission Control - Dashboard

// Model pricing (per 1M tokens, Anthropic 2026 pricing)
const modelPricing = {
    'haiku': { name: 'Claude Haiku', input: 0.80, output: 4.00, icon: '🔹' },
    'sonnet': { name: 'Claude Sonnet', input: 3.00, output: 15.00, icon: '🔷' },
    'opus': { name: 'Claude Opus', input: 15.00, output: 75.00, icon: '🔶' }
};

// Token usage tracking (accumulated across sessions)
let tokenUsage = {
    'haiku': { input: 125480, output: 287340 },
    'sonnet': { input: 45920, output: 82650 },
    'opus': { input: 8200, output: 15340 }
};

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Initialize token/cost display
    updateTokenCostDisplay();
    
    // Navigation handler
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching:', searchTerm);
        });
    }

    // Pause button
    const pauseBtn = document.querySelector('.pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            alert('Mission paused.');
        });
    }

    // Ping Devo button
    const pingBtn = document.querySelector('.ping-btn');
    if (pingBtn) {
        console.log('Ping button found, attaching listener...');
        pingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Ping button clicked!');
            
            const originalText = pingBtn.textContent;
            
            // Show pinging status
            pingBtn.textContent = '⏳ Pinging...';
            pingBtn.disabled = true;
            
            // Simulate health check
            setTimeout(() => {
                const timestamp = new Date().toLocaleTimeString();
                const responses = [
                    `✅ Devo is alive! [${timestamp}] - Ready for tasks`,
                    `✅ Devo online and operational [${timestamp}]`,
                    `✅ Systems nominal. Devo standing by. [${timestamp}]`,
                    `✅ Devo responding. All systems green. [${timestamp}]`
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                alert(randomResponse);
                
                // Restore button
                pingBtn.textContent = originalText;
                pingBtn.disabled = false;
                
                // Add to activity feed
                addActivityLog('Devo', 'Responded to ping - Status: Alive ✅', '✅');
            }, 800);
        });
    } else {
        console.error('Ping button not found!');
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Refresh token/cost display button
    const refreshTokensBtn = document.getElementById('refresh-tokens');
    if (refreshTokensBtn) {
        refreshTokensBtn.addEventListener('click', () => {
            console.log('Refreshing token display...');
            // Simulate adding new tokens from current session
            tokenUsage['sonnet'].input += 33;
            tokenUsage['sonnet'].output += 460;
            updateTokenCostDisplay();
        });
    }

    console.log('DEVO Mission Control Dashboard Initialized ✅');
});

// Calculate and display token usage and costs
function updateTokenCostDisplay() {
    const grid = document.getElementById('token-cost-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    let totalCost = 0;

    Object.entries(modelPricing).forEach(([key, model]) => {
        const usage = tokenUsage[key];
        
        // Calculate costs
        const inputCost = (usage.input / 1000000) * model.input;
        const outputCost = (usage.output / 1000000) * model.output;
        const totalModelCost = inputCost + outputCost;
        totalCost += totalModelCost;

        // Create card
        const card = document.createElement('div');
        card.className = 'token-card';
        card.innerHTML = `
            <div class="token-card-header">
                <span class="token-model-name">${model.icon} ${model.name}</span>
                <span class="token-model-badge">${key.toUpperCase()}</span>
            </div>
            <div class="token-stats">
                <div class="token-stat-row">
                    <span>Input Tokens:</span>
                    <span class="token-stat-value">${usage.input.toLocaleString()}</span>
                </div>
                <div class="token-stat-row">
                    <span>Output Tokens:</span>
                    <span class="token-stat-value">${usage.output.toLocaleString()}</span>
                </div>
                <div class="token-stat-row">
                    <span>Total Tokens:</span>
                    <span class="token-stat-value">${(usage.input + usage.output).toLocaleString()}</span>
                </div>
            </div>
            <div class="cost-highlight">
                <span class="cost-label">Cost (est.)</span>
                <span class="cost-value">$${totalModelCost.toFixed(4)}</span>
            </div>
        `;
        
        grid.appendChild(card);
    });

    // Add total cost card
    const totalCard = document.createElement('div');
    totalCard.className = 'token-card';
    totalCard.style.borderLeftColor = 'var(--success)';
    totalCard.innerHTML = `
        <div class="token-card-header">
            <span class="token-model-name">💵 Total Accumulated Cost</span>
        </div>
        <div class="token-stats">
            <div class="token-stat-row">
                <span>All Models Combined:</span>
                <span class="token-stat-value" style="color: var(--success); font-size: 16px;">$${totalCost.toFixed(2)}</span>
            </div>
            <div class="token-stat-row">
                <span>Total Tokens Used:</span>
                <span class="token-stat-value">${Object.values(tokenUsage).reduce((sum, u) => sum + u.input + u.output, 0).toLocaleString()}</span>
            </div>
        </div>
    `;
    
    grid.appendChild(totalCard);
}

// Simulate adding new token usage periodically
setInterval(() => {
    // Randomly add tokens from background operations
    const randomTokens = Math.floor(Math.random() * 5000);
    if (Math.random() > 0.7) {
        tokenUsage['haiku'].input += randomTokens;
        tokenUsage['haiku'].output += randomTokens * 2;
    }
    if (Math.random() > 0.8) {
        tokenUsage['sonnet'].input += Math.floor(randomTokens * 0.6);
        tokenUsage['sonnet'].output += Math.floor(randomTokens * 0.8);
    }
    // Update display every minute
    updateTokenCostDisplay();
}, 60000);

// Add activity log entry
function addActivityLog(user, text, icon) {
    const activityFeed = document.querySelector('.activity-feed');
    
    if (!activityFeed) {
        console.error('Activity feed not found!');
        return;
    }
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <span class="activity-icon">${icon}</span>
        <div class="activity-content">
            <p class="activity-user">${user}</p>
            <p class="activity-text">${text}</p>
            <span class="activity-time">just now</span>
        </div>
    `;
    
    activityFeed.insertBefore(activityItem, activityFeed.firstChild);
    
    // Keep only last 15 items
    while (activityFeed.children.length > 15) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}
