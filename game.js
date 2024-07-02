var config = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 350 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

var player;
var diamonds;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('bg', 'assets/bg.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('diamond', 'assets/diamond.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('watergirl', 'assets/watergirl.png', { frameWidth: 27, frameHeight: 48 });
  // this.load.image('bluePlatform', 'assets/bluePlatform.png'); //used in next level
  // this.load.image('redPlatform', 'assets/redPlatform.png');
}

function create ()
{



    // Create character watergirl
    this.watergirl = this.physics.add.sprite(100, 450, 'watergirl');

    // Colliders for the character
    

    // this.bluePlatforms = this.physics.add.staticGroup();
    // this.redPlatforms = this.physics.add.staticGroup();

    // this.bluePlatforms.create(400, 568, 'bluePlatform').setScale(2).refreshBody();
    // this.redPlatforms.create(600, 400, 'redPlatform').setScale(2).refreshBody();
    // this.bluePlatforms = this.physics.add.staticGroup(); //used in next level
    // this.redPlatforms = this.physics.add.staticGroup();

    



  //  A simple background for our game
    this.add.image(400, 300, 'bg').setScale(3,1.3);

    // this.bluePlatforms.create(900, 636, 'bluePlatform').setScale(2.5,1).refreshBody();
    // this.redPlatforms.create(600, 636, 'redPlatform').setScale(2.5,0.3).refreshBody();
    //set depth for blue
//     this.bluePlatforms.setDepth(4);
//     //set depth for red
//     this.redPlatforms.setDepth(3);
// // 

  //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 670, 'ground').setScale(6,0.5).refreshBody();
  platforms.create(800, 0, 'ground').setScale(6,0.8).refreshBody();
  // create wall-right
  platforms.create(1505, 320, 'ground').setScale(0.05,14).refreshBody();
  // create wall-left
  platforms.create(10, 320, 'ground').setScale(0.05,14).refreshBody();
  // create ledges
  platforms.create(600, 450, 'ground').setScale(1.5,0.5).refreshBody();//buttom long ledge
  platforms.create(30, 300, 'ground').setScale(0.2,0.3).refreshBody();// small left ledge
  platforms.create(1500, 550, 'ground').setScale(0.2,0.3).refreshBody();// small right ledge
  platforms.create(895, 220, 'ground').setScale(1.43,0.5).refreshBody();//top long ledge

  // The player and its settings
  player = this.physics.add.sprite(50, 450, 'watergirl');

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);//to prevent exit canvas walls

  //  Our player animations, turning, walking left and walking right.
  this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('watergirl', { start: 0, end: 2 }),
      frameRate: 15,
      repeat: -1
  });

  this.anims.create({
      key: 'turn',
      frames: [ { key: 'watergirl', frame: 4 } ],
      frameRate: 20
  });

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('watergirl', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
  });

  //  Input Events: keys(up down left right)
  cursors = this.input.keyboard.createCursorKeys();

  //  Some diamonds to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  diamonds = this.physics.add.group({
      key: 'diamond',
      repeat: 11,
      setXY: { x: 80, y: 0, stepX: 70 }
  });

  diamonds.children.iterate(function (child) {

      //  Give each diamond a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setScale(0.1).refreshBody();

  });

  bombs = this.physics.add.group();

  //  The score
  scoreText = this.add.text(28, 4, 'score: 0', { fontSize: '25px', fill: 'white'});

  //  Collide the player and the diamonds with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(diamonds, platforms);
  this.physics.add.collider(bombs, platforms);
  // this.physics.add.collider(player, this.bluePlatforms);//used in next level
  // this.physics.add.collider(player, this.redPlatforms);
  
  //  Checks to see if the player overlaps with any of the diamonds, if he does call the collectdiamond function
  this.physics.add.overlap(player, diamonds, collectdiamond, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  


}

function update ()
{
  if (gameOver)
  {
      return;
  }

  if (cursors.left.isDown)
  {
      player.setVelocityX(-160);

      player.anims.play('left', true);
  }
  else if (cursors.right.isDown)
  {
      player.setVelocityX(160);

      player.anims.play('right', true);
  }
  else
  {
      player.setVelocityX(0);

      player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down)
  {
      player.setVelocityY(-330);
  }

}

function collectdiamond (player, diamond)
{
  diamond.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText('Score: ' + score);

  if (diamonds.countActive(true) === 0)
  {
      //  A new batch of diamonds to collect
      diamonds.children.iterate(function (child) {

          child.enableBody(true, child.x, 0, true, true);

      });

      var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);// if else

      var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    
      checkScoreAndNextLevel()
    }
}

function hitBomb (player, bomb)
{
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}
function checkScoreAndNextLevel() {
  if (score >= 500) { 
      // Redirect to the next level page
      window.location.href = 'level2.html'; // add level 2 URL 
  }
}
