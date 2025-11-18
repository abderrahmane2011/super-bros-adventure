// ================================
// SUPER BROS ADVENTURE - GAME.JS
// PARTIE 1 : Moteur, joueur et input
// ================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const SCALE = 2; // facteur de zoom pixel art
const TILE_SIZE = 16;

canvas.width = 512;
canvas.height = 288;

// ================================
// INPUT
// ================================
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
};

document.addEventListener("keydown", e => {
    switch(e.code){
        case "ArrowLeft":
        case "KeyA":
            keys.left = true;
            break;
        case "ArrowRight":
        case "KeyD":
            keys.right = true;
            break;
        case "ArrowUp":
        case "KeyW":
        case "Space":
            keys.up = true;
            break;
        case "ArrowDown":
        case "KeyS":
            keys.down = true;
            break;
    }
});

document.addEventListener("keyup", e => {
    switch(e.code){
        case "ArrowLeft":
        case "KeyA":
            keys.left = false;
            break;
        case "ArrowRight":
        case "KeyD":
            keys.right = false;
            break;
        case "ArrowUp":
        case "KeyW":
        case "Space":
            keys.up = false;
            break;
        case "ArrowDown":
        case "KeyS":
            keys.down = false;
            break;
    }
});

// ================================
// PLAYER
// ================================
class Player {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.vx = 0;
        this.vy = 0;
        this.speed = 1.2;
        this.jumpStrength = -4.8;
        this.gravity = 0.2;
        this.onGround = false;
        this.color = "red";
        this.frame = 0;
        this.animTimer = 0;
    }

    update(map){
        // mouvement horizontal
        if(keys.left){
            this.vx = -this.speed;
        } else if(keys.right){
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }

        // saut
        if(keys.up && this.onGround){
            this.vy = this.jumpStrength;
            this.onGround = false;
        }

        // gravité
        this.vy += this.gravity;

        // collisions
        this.x += this.vx;
        this.collideX(map);

        this.y += this.vy;
        this.onGround = false;
        this.collideY(map);

        // animation simple
        if(this.vx !== 0){
            this.animTimer += 0.2;
            if(this.animTimer > 2) this.animTimer = 0;
            this.frame = Math.floor(this.animTimer);
        } else {
            this.frame = 0;
        }
    }

    collideX(map){
        for(let y=0; y<map.length; y++){
            for(let x=0; x<map[y].length; x++){
                if(map[y][x] === 1){ // 1 = bloc solide
                    let tileX = x * TILE_SIZE;
                    let tileY = y * TILE_SIZE;
                    if(this.x < tileX + TILE_SIZE &&
                       this.x + this.width > tileX &&
                       this.y < tileY + TILE_SIZE &&
                       this.y + this.height > tileY){
                        if(this.vx > 0) this.x = tileX - this.width;
                        if(this.vx < 0) this.x = tileX + TILE_SIZE;
                        this.vx = 0;
                    }
                }
            }
        }
    }

    collideY(map){
        for(let y=0; y<map.length; y++){
            for(let x=0; x<map[y].length; x++){
                if(map[y][x] === 1){ // bloc solide
                    let tileX = x * TILE_SIZE;
                    let tileY = y * TILE_SIZE;
                    if(this.x < tileX + TILE_SIZE &&
                       this.x + this.width > tileX &&
                       this.y < tileY + TILE_SIZE &&
                       this.y + this.height > tileY){
                        if(this.vy > 0){
                            this.y = tileY - this.height;
                            this.vy = 0;
                            this.onGround = true;
                        }
                        if(this.vy < 0){
                            this.y = tileY + TILE_SIZE;
                            this.vy = 0;
                        }
                    }
                }
            }
        }
    }

    draw(ctx){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

let player = new Player(50, 50);

// ================================
// GAME LOOP
// ================================
let currentMap = []; // sera rempli dans la partie 3 (7 mondes)
function gameLoop(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // draw map
    for(let y=0; y<currentMap.length; y++){
        for(let x=0; x<currentMap[y].length; x++){
            if(currentMap[y][x] === 1){
                ctx.fillStyle = "#654321";
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    player.update(currentMap);
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();
// ================================
// PARTIE 2 : POWER-UPS ET ENNEMIS
// ================================

// ================================
// POWER-UPS
// ================================
class PowerUp {
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.type = type; // "mushroom", "star", etc.
        this.collected = false;
        this.color = type === "mushroom" ? "orange" : "yellow";
    }

    draw(ctx){
        if(!this.collected){
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update(player){
        if(!this.collected &&
           player.x < this.x + this.width &&
           player.x + player.width > this.x &&
           player.y < this.y + this.height &&
           player.y + player.height > this.y){
            this.collected = true;
            this.applyEffect(player);
        }
    }

    applyEffect(player){
        if(this.type === "mushroom"){
            player.height = 24; // devient plus grand
        } else if(this.type === "star"){
            player.invincible = true;
            setTimeout(()=>player.invincible=false, 5000); // invincible 5s
        }
    }
}

// Exemple de power-ups pour le monde 1
let powerUps = [
    new PowerUp(200, 200, "mushroom"),
    new PowerUp(400, 150, "star")
];

// ================================
// ENNEMIS
// ================================
class Enemy {
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.type = type; // "goomba", "turtle", etc.
        this.vx = type === "goomba" ? 0.5 : 0.3;
        this.alive = true;
        this.color = type === "goomba" ? "brown" : "green";
    }

    update(map){
        if(!this.alive) return;

        this.x += this.vx;
        // simple rebond sur les murs
        for(let y=0; y<map.length; y++){
            for(let x=0; x<map[y].length; x++){
                if(map[y][x] === 1){
                    let tileX = x * TILE_SIZE;
                    let tileY = y * TILE_SIZE;
                    if(this.x < tileX + TILE_SIZE &&
                       this.x + this.width > tileX &&
                       this.y < tileY + TILE_SIZE &&
                       this.y + this.height > tileY){
                        this.vx *= -1;
                    }
                }
            }
        }
    }

    draw(ctx){
        if(!this.alive) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    collidePlayer(player){
        if(!this.alive) return;
        if(player.x < this.x + this.width &&
           player.x + player.width > this.x &&
           player.y < this.y + this.height &&
           player.y + player.height > this.y){
            if(player.vy > 0){ // saute sur l'ennemi
                this.alive = false;
                player.vy = player.jumpStrength/2; // petit rebond
            } else if(!player.invincible){
                // reset joueur si touché
                player.x = 50;
                player.y = 50;
                player.vx = 0;
                player.vy = 0;
            }
        }
    }
}

// Exemple d'ennemis pour le monde 1
let enemies = [
    new Enemy(300, 240, "goomba"),
    new Enemy(500, 240, "turtle")
];

// ================================
// UPDATE ET DRAW DES POWER-UPS & ENNEMIS
// ================================
function updateObjects(){
    powerUps.forEach(p => p.update(player));
    enemies.forEach(e => {
        e.update(currentMap);
        e.collidePlayer(player);
    });
}

function drawObjects(){
    powerUps.forEach(p => p.draw(ctx));
    enemies.forEach(e => e.draw(ctx));
}

// ================================
// MODIFIER LA GAME LOOP
// ================================
function gameLoop(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // draw map
    for(let y=0; y<currentMap.length; y++){
        for(let x=0; x<currentMap[y].length; x++){
            if(currentMap[y][x] === 1){
                ctx.fillStyle = "#654321";
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    player.update(currentMap);
    player.draw(ctx);

    updateObjects();
    drawObjects();

    requestAnimationFrame(gameLoop);
}
// ================================
// PARTIE 3 : MONDES, BOSS, MINI-BOSS ET SECRETS
// ================================

// ================================
// DEFINITION DES MONDES
// ================================
// 0 = vide, 1 = bloc solide, 2 = sol spécial, 3 = bloc secret
const worlds = [
    // Monde 1
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,1,1,1,1],
        [1,0,0,0,0,3,0,1,0,0,0,3,0,1,0,0,0,3,0,1,0,0,0,3,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    // Monde 2 (exemple simplifié)
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1],
        [1,0,0,3,0,0,0,3,0,1,0,0,3,0,0,0,3,0,1,0,0,3,0,0,0,3,0,0,0,3,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
    // Tu peux compléter jusqu’au Monde 7
];

let currentWorldIndex = 0;
currentMap = worlds[currentWorldIndex];

// ================================
// MINI-BOSS
// ================================
class MiniBoss {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.vx = 0.5;
        this.vy = 0;
        this.color = "purple";
        this.alive = true;
        this.hp = 3;
    }

    update(map){
        if(!this.alive) return;

        this.x += this.vx;
        for(let y=0; y<map.length; y++){
            for(let x=0; x<map[y].length; x++){
                if(map[y][x] === 1){
                    let tileX = x*TILE_SIZE;
                    let tileY = y*TILE_SIZE;
                    if(this.x < tileX + TILE_SIZE &&
                       this.x + this.width > tileX &&
                       this.y < tileY + TILE_SIZE &&
                       this.y + this.height > tileY){
                        this.vx *= -1;
                    }
                }
            }
        }

        // Collision avec le joueur
        if(player.x < this.x + this.width &&
           player.x + player.width > this.x &&
           player.y < this.y + this.height &&
           player.y + player.height > this.y){
            if(player.vy > 0){
                this.hp--;
                player.vy = player.jumpStrength/2;
                if(this.hp <= 0) this.alive = false;
            } else if(!player.invincible){
                player.x = 50;
                player.y = 50;
                player.vx = 0;
                player.vy = 0;
            }
        }
    }

    draw(ctx){
        if(!this.alive) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

let miniBosses = [
    new MiniBoss(400, 150)
];

// ================================
// BOSS FINAL
// ================================
class Boss {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 48;
        this.hp = 10;
        this.alive = true;
        this.color = "black";
        this.vx = 1;
    }

    update(map){
        if(!this.alive) return;
        this.x += this.vx;
        if(this.x < 0 || this.x + this.width > canvas.width){
            this.vx *= -1;
        }

        // Collision joueur
        if(player.x < this.x + this.width &&
           player.x + player.width > this.x &&
           player.y < this.y + this.height &&
           player.y + player.height > this.y){
            if(player.vy > 0){
                this.hp--;
                player.vy = player.jumpStrength/2;
                if(this.hp <= 0) this.alive = false;
            } else if(!player.invincible){
                player.x = 50;
                player.y = 50;
                player.vx = 0;
                player.vy = 0;
            }
        }
    }

    draw(ctx){
        if(!this.alive) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

let finalBoss = new Boss(300, 100);

// ================================
// SECRETS
// ================================
function checkSecrets(){
    for(let y=0; y<currentMap.length; y++){
        for(let x=0; x<currentMap[y].length; x++){
            if(currentMap[y][x] === 3){
                // Si le joueur touche un bloc secret
                if(player.x < x*TILE_SIZE + TILE_SIZE &&
                   player.x + player.width > x*TILE_SIZE &&
                   player.y < y*TILE_SIZE + TILE_SIZE &&
                   player.y + player.height > y*TILE_SIZE){
                    currentMap[y][x] = 0; // fait disparaître le bloc
                    powerUps.push(new PowerUp(x*TILE_SIZE, y*TILE_SIZE - 12, "mushroom"));
                }
            }
        }
    }
}

// ================================
// MODIFIER LA GAME LOOP
// ================================
function gameLoop(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // draw map
    for(let y=0; y<currentMap.length; y++){
        for(let x=0; x<currentMap[y].length; x++){
            if(currentMap[y][x] === 1){
                ctx.fillStyle = "#654321";
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if(currentMap[y][x] === 3){
                ctx.fillStyle = "#00FFFF"; // blocs secrets
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    player.update(currentMap);
    player.draw(ctx);

    updateObjects();
    drawObjects();

    // Mini-bosses
    miniBosses.forEach(b => { b.update(currentMap); b.draw(ctx); });

    // Boss final
    finalBoss.update(currentMap);
    finalBoss.draw(ctx);

    // Secrets
    checkSecrets();

    requestAnimationFrame(gameLoop);
}
// ================================
// PARTIE 4 : CONTROLES, MONDES ET SCORE
// ================================

// ================================
// VARIABLES DE CONTROLE
// ================================
const keys = {
    left: false,
    right: false,
    up: false
};

document.addEventListener("keydown", (e)=>{
    if(e.code === "ArrowLeft") keys.left = true;
    if(e.code === "ArrowRight") keys.right = true;
    if(e.code === "ArrowUp") keys.up = true;
});

document.addEventListener("keyup", (e)=>{
    if(e.code === "ArrowLeft") keys.left = false;
    if(e.code === "ArrowRight") keys.right = false;
    if(e.code === "ArrowUp") keys.up = false;
});

// ================================
// MODIFIER LE JEU POUR LES CONTROLES
// ================================
player.update = function(map){
    // Horizontal
    if(keys.left) this.vx = -this.speed;
    else if(keys.right) this.vx = this.speed;
    else this.vx = 0;

    // Vertical
    this.vy += this.gravity;

    if(keys.up && this.onGround){
        this.vy = -this.jumpStrength;
        this.onGround = false;
    }

    // Collision avec le sol
    this.onGround = false;
    for(let y=0; y<map.length; y++){
        for(let x=0; x<map[y].length; x++){
            if(map[y][x] === 1){
                let tileX = x*TILE_SIZE;
                let tileY = y*TILE_SIZE;
                if(this.x + this.width > tileX &&
                   this.x < tileX + TILE_SIZE &&
                   this.y + this.height > tileY &&
                   this.y < tileY + TILE_SIZE){
                    // Collision en bas
                    if(this.vy > 0 && this.y + this.height <= tileY + this.vy){
                        this.y = tileY - this.height;
                        this.vy = 0;
                        this.onGround = true;
                    }
                    // Collision en haut
                    if(this.vy < 0 && this.y >= tileY + TILE_SIZE + this.vy){
                        this.y = tileY + TILE_SIZE;
                        this.vy = 0;
                    }
                }
            }
        }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Changer de monde si le joueur atteint la fin
    if(this.x > canvas.width - this.width){
        currentWorldIndex++;
        if(currentWorldIndex >= worlds.length){
            currentWorldIndex = 0; // Retour au monde 1
        }
        currentMap = worlds[currentWorldIndex];
        this.x = 50;
        this.y = 50;
    }

    // Limites du canvas
    if(this.x < 0) this.x = 0;
    if(this.y > canvas.height) { this.x = 50; this.y = 50; this.vx = 0; this.vy = 0; }
};

// ================================
// SCORE SIMPLE
// ================================
let score = 0;

function drawScore(){
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 10, 20);
}

// ================================
// MODIFIER GAME LOOP
// ================================
function gameLoop(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // draw map
    for(let y=0; y<currentMap.length; y++){
        for(let x=0; x<currentMap[y].length; x++){
            if(currentMap[y][x] === 1){
                ctx.fillStyle = "#654321";
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if(currentMap[y][x] === 3){
                ctx.fillStyle = "#00FFFF";
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    player.update(currentMap);
    player.draw(ctx);

    updateObjects();
    drawObjects();

    miniBosses.forEach(b => { b.update(currentMap); b.draw(ctx); });
    finalBoss.update(currentMap);
    finalBoss.draw(ctx);

    checkSecrets();

    drawScore();

    requestAnimationFrame(gameLoop);
}

// ================================
// INITIALISATION DU JEU
// ================================
const TILE_SIZE = 32;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

// Joueur
const player = {
    x: 50,
    y: 50,
    width: 16,
    height: 16,
    vx: 0,
    vy: 0,
    speed: 2,
    gravity: 0.5,
    jumpStrength: 10,
    onGround: false,
    invincible: false,
    draw: function(ctx){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Commencer le jeu
gameLoop();
