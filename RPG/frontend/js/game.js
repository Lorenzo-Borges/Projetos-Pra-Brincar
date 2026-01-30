/** * RPG JAVASCRIPT - REVISÃO GERAL
 * Foco: Organização, Performance e Limpeza
 */

// --- 1. CONFIGURAÇÕES E CONSTANTES ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 16;
const TILESET_COLUMNS = 25;
const MAX_LOG_LINES = 4;

// --- 2. ESTADO DO JOGO ---
let gameState = 'OVERWORLD'; // 'OVERWORLD' ou 'BATTLE'
let batalhaAtiva = false;
let combatLog = ["Uma batalha começou!", "O que você vai fazer?"];

const battleUI = {
    selectedOption: 0,
    options: ["Atacar", "Magia", "Item", "Fugir"],
    playerHP: 100,
    playerMaxHP: 100,
    playerAtk: 10,
    playerDef: 5,
    enemyName: "",
    enemyHP: 0,
    enemyMaxHP: 0,
    enemyAtk: 0,
    enemyDef: 2
};

// --- 3. CARREGAMENTO DE ASSETS ---
const playerSprite = new Image();
playerSprite.src = 'assets/sprites/personagem.png';

const tilesetImage = new Image();
tilesetImage.src = 'assets/sprites/tilesetparede.png';

const enemySprite = new Image();

// Inicia o loop apenas quando as imagens essenciais carregarem
let imagesLoaded = 0;
[playerSprite, tilesetImage].forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) carregarDadosIniciais();
    };
});

// --- 4. MAPA E COLISÃO ---
const mapaDados = [
    [1, 2, 3, 2, 3, 3, 3, 2, 3, 2, 2, 3, 3, 2, 4, 0, 0, 0, 1, 3, 2, 2, 3, 3, 2, 2, 3, 3, 3, 2, 3, 2, 2, 3, 3, 2, 2, 4, 0, 0, 0, 1, 2, 2, 3, 3, 2, 2, 3, 4],
    [28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 29, 4, 0, 1, 26, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 29, 4, 0, 1, 26, 28, 27, 27, 28, 27, 27, 28, 27],
    [27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 29, 2, 26, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 29, 2, 26, 28, 28, 27, 27, 28, 27, 27, 27, 28],
    [27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27],
    [27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27],
    [28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27],
    [27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28],
    [100, 127, 128, 400, 401, 402, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 129],
    [150, 151, 152, 425, 426, 427, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 153, 152, 151, 151, 152, 151, 155],
    [175, 177, 176, 425, 426, 427, 177, 176, 177, 176, 177, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 177, 180],
    [175, 176, 177, 425, 426, 427, 176, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 177, 176, 176, 180],
    [175, 177, 177, 425, 426, 427, 177, 177, 176, 177, 176, 177, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 180],
    [175, 177, 176, 425, 426, 427, 177, 176, 177, 176, 177, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 177, 180],
    [175, 176, 177, 425, 426, 427, 176, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 177, 176, 176, 180],
    [175, 177, 177, 425, 426, 427, 177, 177, 176, 177, 176, 177, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 180],
    [226, 227, 228, 450, 451, 452, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 227, 228, 229, 226, 229],
    [223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222, 221, 221, 222],
    [221, 222, 223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 222, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222],
    [222, 223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 222, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222, 221],
    [223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222, 221, 221, 222],
    [221, 222, 223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 222, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222],
    [223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222, 221, 221, 222],
    [221, 222, 223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 222, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222],
    [222, 223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 222, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222, 221],
    [223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222, 221, 221, 222],
    [221, 222, 223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 222, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222],
    [221, 222, 223, 221, 222, 223, 222, 222, 221, 223, 221, 222, 223, 223, 222, 221, 221, 223, 222, 222, 223, 222, 221, 222, 221, 223, 222, 223, 221, 223, 221, 222, 221, 222, 222, 221, 223, 223, 223, 221, 221, 222, 223, 223, 221, 222, 223, 221, 223, 222],
    [1, 2, 3, 2, 3, 3, 3, 2, 3, 2, 2, 3, 3, 2, 4, 0, 0, 0, 1, 3, 2, 2, 3, 3, 2, 2, 3, 3, 3, 2, 3, 2, 2, 3, 3, 2, 2, 4, 0, 0, 0, 1, 2, 2, 3, 3, 2, 2, 3, 4],
    [28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 29, 4, 0, 1, 26, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 29, 4, 0, 1, 26, 28, 27, 27, 28, 27, 27, 28, 27],
    [27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 29, 2, 26, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 29, 2, 26, 28, 28, 27, 27, 28, 27, 27, 27, 28],
    [27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27],
    [27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27],
    [28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27, 27, 28, 27],
    [27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28, 28, 27, 27, 27, 28, 27, 28, 27, 27, 27, 28, 28, 27, 27, 28, 27, 27, 27, 28],
    [100, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 127, 128, 127, 129],
    [150, 151, 152, 153, 154, 154, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 151, 151, 152, 151, 152, 153, 154, 154, 152, 153, 152, 151, 151, 152, 151, 155],
    [175, 177, 176, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 177, 180],
    [175, 176, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 177, 176, 176, 180],
    [175, 177, 177, 176, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 177, 176, 176, 177, 177, 177, 177, 177, 176, 177, 176, 177, 177, 177, 176, 177, 176, 177, 176, 177, 177, 176, 177, 177, 177, 176, 176, 177, 177, 177, 176, 177, 177, 176, 177, 180]
];

const BLOQUEIOS = [0, 1, 2, 3, 4, 100, 228, 229, 226, 227, 150, 151, 152, 175, 176, 177];
const TILES_PERIGOSOS = [27, 28];

function isWalkable(targetX, targetY) {
    // Checa a colisão baseada na Hitbox do pé do player
    const checkX = targetX + player.hitboxOffsetX + (player.hitboxWidth / 2);
    const checkY = targetY + player.hitboxOffsetY + player.hitboxHeight;
    
    const col = Math.floor(checkX / TILE_SIZE);
    const row = Math.floor(checkY / TILE_SIZE);

    if (row < 0 || row >= mapaDados.length || col < 0 || col >= mapaDados[0].length) return false;
    return !BLOQUEIOS.includes(mapaDados[row][col]);
}

// --- 5. ENTIDADES ---
const player = {
    x: 0, y: 0,
    width: 64, height: 64,
    hitboxOffsetX: 14, hitboxOffsetY: 32,
    hitboxWidth: 32, hitboxHeight: 10,
    frameX: 0, frameY: 4, maxFrame: 5,
    fps: 0, speed: 2, walking: false,
    distanciaAndada: 0
};

async function carregarDadosIniciais() {
    try {
        const res = await fetch('http://localhost:5000/api/carregar-jogador');
        const dados = await res.json();

        // Aqui a mágica acontece: passamos o que veio do Banco para o Objeto do jogo
        player.x = dados.pos_x;
        player.y = dados.pos_y;
        battleUI.playerHP = dados.hp_atual;
        battleUI.playerMaxHP = dados.hp_max;
        
        console.log("Personagem carregado na posição:", player.x, player.y);
        
        // Só depois de carregar tudo, iniciamos o loop do jogo
        gameLoop(); 
    } catch (e) {
        console.error("Erro ao carregar dados. Iniciando com valores padrão.", e);
        gameLoop(); // Inicia mesmo com erro para o jogo não travar
    }
}

// --- 6. LÓGICA DE MOVIMENTO (UPDATE) ---
const keys = {};
window.onkeydown = (e) => { 
    keys[e.key] = true;
    if (gameState === 'BATTLE') handleBattleInput(e.key);
};
window.onkeyup = (e) => keys[e.key] = false;

function update() {
    if (gameState !== 'OVERWORLD' || batalhaAtiva) return;

    player.walking = false;
    let moveX = 0;
    let moveY = 0;

    if (keys['ArrowDown'] || keys['s']) { moveY = player.speed; player.frameY = 4; }
    else if (keys['ArrowUp'] || keys['w']) { moveY = -player.speed; player.frameY = 5; }
    else if (keys['ArrowRight'] || keys['d']) { moveX = player.speed; player.frameY = 6; }
    else if (keys['ArrowLeft'] || keys['a']) { moveX = -player.speed; player.frameY = 7; }

    if (moveX !== 0 || moveY !== 0) {
        if (isWalkable(player.x + moveX, player.y + moveY)) {
            player.x += moveX;
            player.y += moveY;
            player.walking = true;
            checkEncounter();
        }
    }

    // Animação do frame
    if (player.walking) {
        player.fps++;
        if (player.fps > 10) {
            player.frameX = (player.frameX < player.maxFrame) ? player.frameX + 1 : 0;
            player.fps = 0;
        }
    } else {
        player.frameX = 0;
    }
}

function checkEncounter() {
    const col = Math.floor((player.x + player.hitboxOffsetX) / TILE_SIZE);
    const row = Math.floor((player.y + player.hitboxOffsetY) / TILE_SIZE);
    const tileAtual = mapaDados[row][col];

    if (TILES_PERIGOSOS.includes(tileAtual)) {
        player.distanciaAndada += player.speed;
        if (player.distanciaAndada > 200) { // Sorteio de batalha a cada 200px
            if (Math.random() < 0.05) iniciarBatalha(); 
        }
    }
}

// --- 7. SISTEMA DE BATALHA ---
async function iniciarBatalha() {
    batalhaAtiva = true;
    addLog("Um monstro apareceu!");
    
    try {
        const resposta = await fetch('http://localhost:5000/api/monstro-aleatorio');
        const dados = await resposta.json();

        enemySprite.src = dados.sprite_path;
        enemySprite.onload = () => {
            battleUI.enemyName = dados.nome;
            battleUI.enemyHP = dados.hp_max;
            battleUI.enemyMaxHP = dados.hp_max;
            battleUI.enemyAtk = dados.ataque;
            gameState = 'BATTLE';
        };
    } catch (e) {
        console.error("Servidor Offline");
        batalhaAtiva = false;
    }
}

function handleBattleInput(key) {
    if (key === 'ArrowUp' || key === 'w') {
        battleUI.selectedOption = (battleUI.selectedOption - 1 + battleUI.options.length) % battleUI.options.length;
    } else if (key === 'ArrowDown' || key === 's') {
        battleUI.selectedOption = (battleUI.selectedOption + 1) % battleUI.options.length;
    } else if (key === 'Enter') {
        executarTurno();
    }
}

function executarTurno() {
    const acao = battleUI.options[battleUI.selectedOption];
    if (acao === "Atacar") {
        const dano = Math.floor(Math.random() * 5) + (battleUI.playerAtk - battleUI.enemyDef);
        battleUI.enemyHP -= dano;
        addLog(`Você causou ${dano} de dano!`);
        
        if (battleUI.enemyHP <= 0) {
            battleUI.enemyHP = 0;
            addLog("Vitória!");
            setTimeout(voltarParaOMapa, 1500);
        } else {
            setTimeout(turnoInimigo, 1000);
        }
    } else if (acao === "Fugir") {
        addLog("Você fugiu!");
        setTimeout(voltarParaOMapa, 1000);
    }
}

function turnoInimigo() {
    const dano = Math.floor(Math.random() * 5) + (battleUI.enemyAtk - battleUI.playerDef);
    battleUI.playerHP -= dano;
    addLog(`${battleUI.enemyName} causou ${dano} de dano!`);

    if (battleUI.playerHP <= 0) {
        alert("Você morreu!");
        location.reload();
    }
}

function voltarParaOMapa() {
    gameState = 'OVERWORLD';
    batalhaAtiva = false;
    player.distanciaAndada = 0;
    combatLog = ["O que você vai fazer?"];
}

function addLog(msg) {
    combatLog.push(msg);
    if (combatLog.length > MAX_LOG_LINES) combatLog.shift();
}

function vitoria() {
    addLog("Inimigo derrotado!");
    salvarProgresso(); // <--- Adicione isso aqui!
    setTimeout(voltarParaOMapa, 1500);
}

// --- 8. RENDERIZAÇÃO (DRAW) ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'OVERWORLD') {
        renderMapa();
        renderPlayer();
    } else {
        renderBatalha();
    }
}

function renderMapa() {
    for (let row = 0; row < mapaDados.length; row++) {
        for (let col = 0; col < mapaDados[row].length; col++) {
            let tileID = mapaDados[row][col];
            let sx = (tileID % TILESET_COLUMNS) * TILE_SIZE;
            let sy = Math.floor(tileID / TILESET_COLUMNS) * TILE_SIZE;
            ctx.drawImage(tilesetImage, sx, sy, TILE_SIZE, TILE_SIZE, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function renderPlayer() {
    ctx.drawImage(playerSprite, player.frameX * player.width, player.frameY * player.height, player.width, player.height, player.x, player.y, player.width, player.height);
}

function renderBatalha() {
    // Fundo
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 800, 600);

    // Sprites
    ctx.drawImage(playerSprite, 0, 4 * 64, 64, 64, 150, 250, 128, 128); // Jogador
    if (enemySprite.complete) ctx.drawImage(enemySprite, 550, 250, 128, 128); // Inimigo

    // Interface
    drawHealthBar(100, 200, battleUI.playerHP, battleUI.playerMaxHP, "Herói");
    drawHealthBar(500, 200, battleUI.enemyHP, battleUI.enemyMaxHP, battleUI.enemyName);
    
    // Menu e Log
    drawMenu();
    drawLog();
}

function drawHealthBar(x, y, cur, max, label) {
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, 200, 15);
    ctx.fillStyle = cur / max > 0.3 ? "#2ecc71" : "#e74c3c";
    ctx.fillRect(x, y, (cur / max) * 200, 15);
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(`${label}: ${cur}/${max}`, x, y - 5);
}

function drawMenu() {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(50, 460, 300, 120);
    ctx.strokeStyle = "white";
    ctx.strokeRect(50, 460, 300, 120);

    battleUI.options.forEach((opt, i) => {
        ctx.fillStyle = (i === battleUI.selectedOption) ? "yellow" : "white";
        ctx.fillText(opt, 80, 500 + (i * 25));
    });
}

function drawLog() {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(400, 460, 350, 120);
    ctx.fillStyle = "white";
    combatLog.forEach((line, i) => ctx.fillText(line, 420, 490 + (i * 22)));
}

async function salvarProgresso() {
    const dadosParaSalvar = {
        hp_atual: battleUI.playerHP,
        pos_x: Math.floor(player.x),
        pos_y: Math.floor(player.y),
        exp: 0 // Por enquanto 0, até criarmos o sistema de XP
    };

    await fetch('http://localhost:5000/api/salvar-jogador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaSalvar)
    });
    console.log("Progresso salvo no MySQL!");
}

// --- 9. LOOP PRINCIPAL ---
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}