/**
 * Level state.
 */
function Level() {
	Phaser.State.call(this);
}

/** @type Phaser.State */
var proto = Object.create(Phaser.State);
Level.prototype = proto;

Level.prototype.create = function() {
	this.game.physics.startSystem(Phaser.Physics.ARCADE);
	this.game.physics.arcade.gravity.y = 1000;
	this.bg = this.add.image(0, 0, "bg");
	this.map = this.game.add.tilemap("lab7");
	this.map.addTilesetImage('tile_set');
	this.maplayer = this.map.createLayer("Tile Layer 1");
	this.maplayer.resizeWorld();

	this.map.setCollisionBetween(0, 199, true, this.maplayer);
	// สร้าง group ของศัตรู
	this.enemies = this.add.group();
	this.player = null;
	// load object layer
	for (x in this.map.objects.object) {
		var obj = this.map.objects.object[x];
		if (obj.type == "player") {
			this.player = this.addPlayer(obj.x, obj.y);
			this.game.camera.follow(this.player,
					Phaser.Camera.FOLLOW_PLATFORMER);
		}
	}

	this.input.keyboard.addKeyCapture([ Phaser.Keyboard.LEFT,
			Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.X ]);
	// this.layerfg = this.map.createLayer("fg");
	// this.layerfg.alpha = 0.5;
};

Level.prototype.render = function() {
	if (this.player == null)
		return;
	this.game.debug.body(this.player);
}

Level.prototype.update = function() {
	if (this.player == null)
		return;
	this.game.physics.arcade.collide(this.player, this.maplayer);
	this.game.physics.arcade.collide(this.enemies, this.maplayer);	
	if(this.player.body.onFloor()){ // บนพื้น
	   if(this.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
		 this.player.body.velocity.x = -100;
		 this.player.play("walk");
		 this.player.scale.x = -1;
	   }else if(this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
		 this.player.body.velocity.x = 100;  
		 this.player.play("walk");
		 this.player.scale.x = 1;
	   }
	   if(this.input.keyboard.isDown(Phaser.Keyboard.UP)){
		 this.player.body.velocity.y = -650;
		 this.player.play("jump");
       }
	   this.player.body.drag.setTo(500, 0);
	}else{  // ลอย
	   this.player.body.drag.setTo(0, 0);		
	}
		
	if (this.player.body.velocity.x == 0) {
		this.player.play("idle");
	}
}

function gframes(key, n) {
	var f = [];
	for (var i = 0; i <= n; i++) {
		var kf = key + "_" + (("00" + i).slice(-3));
		f.push(kf);
	}
	return f;
}
function mframe(key, n) {
	f = [];
	for (var i = 1; i < n; i++) {
		f.push(key + " (" + i + ")");
	}
	return f;
}
Level.prototype.addPlayer = function(x, y) {
	var t = this.add.sprite(x, y, "knight");
	t.animations.add("idle", mframe("Idle", 10), 12, true);
	t.animations.add("jump", mframe("Jump", 10), 12, true);
	t.animations.add("run", mframe("Run", 10), 12, true);
	t.animations.add("walk", mframe("Walk", 10), 12, true);
	t.anchor.set(0.5, 1);
	t.play("idle");
	this.game.physics.enable(t);
	t.body.collideWorldBounds = true;
	t.body.drag.setTo(500, 0);
	t.body.setSize(25, 40, 10, 15);
	return t;
};

Level.prototype.addMonkey = function() {
	// add monkey
	this.monkey = this.add.sprite(this.world.centerX, this.world.height - 250,
			"mono");
	this.monkey.anchor.set(0.5, 0.5);

	// listen for a monkey click
	this.monkey.inputEnabled = true;
	this.monkey.events.onInputDown.add(this.hitMonkey, this);
};

Level.prototype.moveMonkey = function() {
	// tween monkey like a yoyo
	var twn = this.add.tween(this.monkey);
	twn.to({
		y : 200
	}, 1000, "Quad.easeInOut", true, 0, Number.MAX_VALUE, true);

	// rotate monkey
	twn = this.add.tween(this.monkey);
	twn.to({
		angle : 360
	}, 2000, "Linear", true, 0, Number.MAX_VALUE);
};

Level.prototype.hitMonkey = function() {
	// stop all monkey's movements
	this.tweens.removeAll();

	// rotate monkey
	var twn = this.add.tween(this.monkey);
	twn.to({
		angle : this.monkey.angle + 360
	}, 1000, "Linear", true);

	// scale monkey
	twn = this.add.tween(this.monkey.scale);
	twn.to({
		x : 0.1,
		y : 0.1
	}, 1000, "Linear", true);

	// when tween completes, quit the game
	twn.onComplete.addOnce(this.quitGame, this);
};

Level.prototype.quitGame = function() {
	this.game.state.start("Menu");
};