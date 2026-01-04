// Navigation
const homeBtn = document.getElementById('homeBtn');
const gameBtn = document.getElementById('gameBtn');
const playNowBtn = document.getElementById('playNowBtn');
const homePage = document.getElementById('homePage');
const gamePage = document.getElementById('gamePage');
const startBtn = document.getElementById('startBtn');
const fullscreenGame = document.getElementById('fullscreenGame');
const exitBtn = document.getElementById('exitBtn');
const restartBtn = document.getElementById('restartBtn');
const mobileControls = document.getElementById('mobileControls');

// Check if mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Navigation handlers
homeBtn.addEventListener('click', () => {
    homePage.classList.add('active');
    gamePage.classList.remove('active');
    homeBtn.classList.add('active');
    gameBtn.classList.remove('active');
});

gameBtn.addEventListener('click', () => {
    gamePage.classList.add('active');
    homePage.classList.remove('active');
    gameBtn.classList.add('active');
    homeBtn.classList.remove('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
});

playNowBtn.addEventListener('click', () => {
    gamePage.classList.add('active');
    homePage.classList.remove('active');
    gameBtn.classList.add('active');
    homeBtn.classList.remove('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
});

// Create stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = `${Math.random() * 2.5 + 0.5}px`;
        star.style.height = star.style.width;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 4 + 2}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
    }
}

createStars();

// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = 0;
let animationId;

const touchControls = {
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false
};

// Game Objects
let player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 5,
    dx: 0,
    dy: 0
};

let bullets = [];
let meteors = [];
let fireMeteors = [];
let stars = [];
let lastShootTime = 0;
const shootCooldown = 200;

// Initialize game
function initGame() {
    canvas.width = 800;
    canvas.height = 600;
    
    player.x = canvas.width / 2;
    player.y = canvas.height - 80;
    
    bullets = [];
    meteors = [];
    fireMeteors = [];
    stars = [];
    score = 0;
    gameOver = false;
    
    updateScore();
    
    // Create stars
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

// Start game
startBtn.addEventListener('click', () => {
    fullscreenGame.classList.add('active');
    if (isMobile) {
        mobileControls.classList.add('active');
    }
    initGame();
    gameStarted = true;
    gameLoop();
});

// Exit fullscreen
exitBtn.addEventListener('click', () => {
    fullscreenGame.classList.remove('active');
    mobileControls.classList.remove('active');
    gameStarted = false;
    cancelAnimationFrame(animationId);
});

// Restart game
restartBtn.addEventListener('click', () => {
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
    initGame();
    gameStarted = true;
    gameOver = false;
    gameLoop();
});

// Keyboard controls
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        shootBullet();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mobile controls
if (isMobile) {
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    const shootButton = document.getElementById('shootBtn');
    
    dpadButtons.forEach(btn => {
        const direction = btn.dataset.dir;
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchControls[direction] = true;
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchControls[direction] = false;
        });
        
        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            touchControls[direction] = false;
        });
    });
    
    shootButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.shoot = true;
    });
}

// Shoot bullet
function shootBullet() {
    const now = Date.now();
    if (now - lastShootTime < shootCooldown) return;
    lastShootTime = now;
    
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15
    });
}

// Update score
function updateScore() {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('fullscreenScore').textContent = score;
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height - 10);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(player.x + 5, player.y + player.height - 5, 10, 5);
    ctx.fillRect(player.x + player.width - 15, player.y + player.height - 5, 10, 5);
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = '#fbbf24';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Draw stars
function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw meteors
function drawMeteors() {
    // Regular meteors
    meteors.forEach(meteor => {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(meteor.x - meteor.radius / 3, meteor.y - meteor.radius / 3, meteor.radius / 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Fire meteors
    fireMeteors.forEach(meteor => {
        const gradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, meteor.radius);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, '#ffeb3b');
        gradient.addColorStop(0.5, '#ff9800');
        gradient.addColorStop(0.7, '#ff5722');
        gradient.addColorStop(1, '#d32f2f');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Dark spots
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(meteor.x - meteor.radius * 0.2, meteor.y - meteor.radius * 0.2, meteor.radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(meteor.x + meteor.radius * 0.15, meteor.y + meteor.radius * 0.1, meteor.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Flame trails
        ctx.fillStyle = 'rgba(255, 152, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(meteor.x - meteor.radius * 0.3, meteor.y - meteor.radius * 1.2, meteor.radius * 0.4, meteor.radius * 0.6, Math.PI * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 87, 34, 0.5)';
        ctx.beginPath();
        ctx.ellipse(meteor.x + meteor.radius * 0.3, meteor.y - meteor.radius * 1.1, meteor.radius * 0.35, meteor.radius * 0.5, -Math.PI * 0.3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Update player
function updatePlayer() {
    player.dx = 0;
    player.dy = 0;
    
    // Keyboard controls
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.dx = -player.speed;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) player.dx = player.speed;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) player.dy = -player.speed;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player.dy = player.speed;
    
    player.x += player.dx;
    player.y += player.dy;
    
    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 7;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Update stars
function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Update meteors
function updateMeteors() {
    // Spawn regular meteors
    if (Math.random() < 0.02) {
        meteors.push({
            x: Math.random() * canvas.width,
            y: -20,
            radius: Math.random() * 15 + 15
        });
    }
    
    // Spawn fire meteors
    if (Math.random() < 0.008) {
        fireMeteors.push({
            x: Math.random() * canvas.width,
            y: -30,
            radius: Math.random() * 12 + 18
        });
    }
    
    // Update regular meteors
    for (let i = meteors.length - 1; i >= 0; i--) {
        meteors[i].y += 2;
        
        if (meteors[i].y > canvas.height) {
            meteors.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        const dx = meteors[i].x - (player.x + player.width / 2);
        const dy = meteors[i].y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < meteors[i].radius + 20) {
            gameOver = true;
            showGameOver();
        }
        
        // Check collision with bullets
        for (let j = bullets.length - 1; j >= 0; j--) {
            const dx2 = meteors[i].x - bullets[j].x;
            const dy2 = meteors[i].y - bullets[j].y;
            const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            
            if (distance2 < meteors[i].radius) {
                meteors.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                updateScore();
                break;
            }
        }
    }
    
    // Update fire meteors
    for (let i = fireMeteors.length - 1; i >= 0; i--) {
        fireMeteors[i].y += 3;
        
        if (fireMeteors[i].y > canvas.height) {
            fireMeteors.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        const dx = fireMeteors[i].x - (player.x + player.width / 2);
        const dy = fireMeteors[i].y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < fireMeteors[i].radius + 20) {
            gameOver = true;
            showGameOver();
        }
    }
}

// Show game over
function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ff4e50';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Skor Akhir: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#00d2ff';
    ctx.fillText('Klik Restart untuk main lagi', canvas.width / 2, canvas.height / 2 + 70);
}

// Game loop
function gameLoop() {
    if (!gameStarted || gameOver) return;
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply touch controls
    if (touchControls.left) player.x -= player.speed;
    if (touchControls.right) player.x += player.speed;
    if (touchControls.up) player.y -= player.speed;
    if (touchControls.down) player.y += player.speed;
    if (touchControls.shoot) {
        shootBullet();
        touchControls.shoot = false;
    }
    
    // Boundaries for touch
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    
    updateStars();
    drawStars();
    
    updatePlayer();
    updateBullets();
    updateMeteors();
    
    drawPlayer();
    drawBullets();
    drawMeteors();
    
    animationId = requestAnimationFrame(gameLoop);
}