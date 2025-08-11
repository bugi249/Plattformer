// Phaser Spiel-Konfiguration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Spielvariablen
let player;
let ground;
let obstacles;
let coins;
let scoreText;
let cursors; // Für die Tastatureingabe
let score = 0;
let gameOver = false;

const game = new Phaser.Game(config);

function preload() {
    // Lädt die Bilder aus deinem 'assets'-Ordner
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('obstacle', 'assets/obstacle.png');
    this.load.image('coin', 'assets/coin.png');
    
    // Lädt das Spritesheet für die Spieler-Animation
    // Wichtig: frameWidth und frameHeight müssen zur Größe eines Einzelbildes in deiner Datei passen
    this.load.spritesheet('player', 'assets/player_sheet.png', {
        frameWidth: 32, // Beispielbreite
        frameHeight: 48  // Beispielhöhe
    });
}

function create() {
    // Welt größer machen als der Bildschirm (1600px breit)
    this.physics.world.setBounds(0, 0, 1600, 600);
    
    // Hintergrund einfügen
    this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(2);

    // Eine lange Plattform als Boden bauen
    ground = this.physics.add.staticGroup();
    for (let i = 0; i < 5; i++) {
        ground.create(200 + (i * 400), 580, 'ground').setScale(2).refreshBody();
    }

    // Spieler erstellen
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    // Kamera so einstellen, dass sie dem Spieler folgt
    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, 1600, 600);

    // Spieler-Animationen definieren
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20
    });

    // Gruppen für Hindernisse und Münzen erstellen
    obstacles = this.physics.add.group();
    coins = this.physics.add.group();

    // Hindernisse und Münzen manuell in der Welt platzieren
    obstacles.create(500, 530, 'obstacle').setImmovable(true).body.setAllowGravity(false);
    obstacles.create(800, 530, 'obstacle').setImmovable(true).body.setAllowGravity(false);
    obstacles.create(850, 530, 'obstacle').setImmovable(true).body.setAllowGravity(false);
    
    coins.create(300, 450, 'coin').body.setAllowGravity(false);
    coins.create(350, 450, 'coin').body.setAllowGravity(false);
    coins.create(1100, 450, 'coin').body.setAllowGravity(false);
    
    // Kollisionen definieren
    this.physics.add.collider(player, ground);
    this.physics.add.overlap(player, obstacles, hitObstacle, null, this);
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Tastatur-Eingaben (Pfeiltasten) aktivieren
    cursors = this.input.keyboard.createCursorKeys();

    // Punktestand-Anzeige
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#FFF', 
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4
    }).setScrollFactor(0); // Klebt an der Kamera
}

function update() {
    if (gameOver) return;

    // Steuerung für Links und Rechts
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
        player.setFlipX(true);
        player.anims.play('run', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
        player.setFlipX(false);
        player.anims.play('run', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    // Steuerung für den Sprung
    if ((cursors.up.isDown || cursors.space.isDown) && player.body.touching.down) {
        player.setVelocityY(-600);
    }
}

function hitObstacle(player, obstacle) {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;
    this.time.delayedCall(2000, () => {
        gameOver = false;
        score = 0;
        this.scene.restart();
    });
}

function collectCoin(player, coin) {
    coin.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
}
