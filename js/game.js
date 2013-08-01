//=========================================================================
// Global Variables
//=========================================================================
var canvas,b,C,physics,anmSettings,input,player,scene;
var PREDICT_SPAN,DEFAULT_POS,SCALE,KEY;
function setGlobals() {
    // Animatron variables
    b = Builder._$;
    C = anm.C;
    PREDICT_SPAN = 1/150;
    anm.M[C.MOD_COLLISIONS].predictSpan = PREDICT_SPAN;
    DEFAULT_POS = [0,0];

    SCALE = 0.05;
    // Physics globals
    physics = {
        vMax : 10
    }

    input = {
        up   : false,
        down : false,
        fire : false
    }

    KEY = {
      LEFT:  37,
      UP:    38,
      RIGHT: 39,
      DOWN:  40,
      A:     65,
      D:     68,
      S:     83,
      W:     87,
      SPACE: 32,
    };

    anmSettings = 
    {
        //"debug"  : true,
        "mode" : C.M_DYNAMIC,
        "anim" : {
            "fps": 60,
            "width" : canvas.width,
            "height" : canvas.height,
            "bgcolor": { color: "#0F0F0F" },
        }
    }
}

//=============================================================================
// Modifiers
//=============================================================================
var playerMovementMod = function(t) {
    var data = this.$.data();
    if      (input.up)   this.y = data.y -= physics.vMax;
    else if (input.down) this.y = data.y += physics.vMax;
    else                 this.y = data.y;
    this.y = data.y = Util.clamp(-canvas.height/2+player.height/2, this.y, canvas.height/2-player.height/2);
}

var shooterMod = function(t) {
    var data = this.$.data();
    if(input.fire && (!data.lastFired || t - data.lastFired > 0.5)) {
        addBullet(t,this.$);
        data.lastFired = t;
    }
}

var transparencyMod = function(t) {
    this.alpha = 0.1;
}

var backgroundMod = function(t) {
    /*
    var color = Math.floor(t*256*256%16777215);
    console.log(color.toString(16))
    b(this.$).fill('#' + color.toString(16))
    */
    b(this.$).fill('#000000')
}

//=========================================================================
// Scene Building
//=========================================================================

function initGame() {
    canvas = document.getElementById('game-canvas');
    Util.goFullscreen();
    setGlobals();

    /**Animatron**/
    scene = buildScene();
    var game = createPlayer(canvas.id, anmSettings).load(scene);
    game.play();

    game.startGame = function() {
        tLastPoint = game.state.time;
    }
    return game;
}

function buildScene() {
    var scene = b('scene');
    player = new Player();
    var p = b('player').band([0,40000])
                       .rect([player.x,player.y],[player.width,player.height])
                       .fill("#EEEEEE")
                       .modify(playerMovementMod)
                       .modify(shooterMod)
                       .data({ y : 0 });
    player.setElement(p.v)
    scene.add(b('background').rect([canvas.width/2,canvas.height/2],[canvas.width,canvas.height]).modify(backgroundMod))
    scene.add(p);

    scene.on(anm.C.X_KDOWN, function(evt) {
        switch(evt.key) {
            case KEY.UP:    case KEY.W: input.up   = true; break;
            case KEY.DOWN:  case KEY.S: input.down = true; break;
            case KEY.SPACE:             input.fire = true; break;
        }
    }).on(anm.C.X_KUP, function(evt) {
        switch(evt.key) {
            case KEY.UP:    case KEY.W: input.up   = false; break;
            case KEY.DOWN:  case KEY.S: input.down = false; break;
            case KEY.SPACE:             input.fire = false; break;
        }
    })

    var bgElements = createBackground();
    bgElements.forEach(function(e) {
        scene.add(e);
    })
    return scene;
}

function createBackground() {
    var max = canvas.height;
    var x   = canvas.width*1.1;
    var r   = canvas.width*0.08;
    var tMin= 2;
    var tMax= 4;
    var numBubbles = 150;

    var elements = [];
    var colors = ["#FFAA00","#FFD700","#FFE140","#FFE973"]
    for(var i=0;i<numBubbles;i++) {
        var t = Math.random()*(tMax-tMin)+tMin;
        var tOff = Math.random()*tMax;
        var elem = b().band([tOff, t + tOff])
                      .circle([x,Math.random()*max],Math.random()*r)
                      .fill(colors[i%4])
                      .modify(transparencyMod)
                      .trans([0,t], [[0,0], [-x*1.2, 0]])
                      .loop()

        elements.push(elem);
    }

    return elements;
}

function addBullet(t,p) {
    var bullet = b().rect([player.x, p.data().y + player.y],[player.width/5,player.height/5])
                    //.move([[0,0], [canvas.width, 0]])
                    .trans([t, t+2], [[0,0], [canvas.width, 0]]/*, C.E_SIN*/).once() //TODO: find a mode that works
    scene.add(bullet)
}


//=============================================================================
// Player
//=============================================================================
var Player = (function() {

    var c = function() {
        // Private variables
        var w = canvas.width, h = canvas.height;

        // Private functions

        // Public variables
        this.width  = w * SCALE;
        this.height = h * SCALE;
        this.offset = w * SCALE/5;        // Space between wall and player

        this.x = this.offset + this.width/2;
        this.y = h/2;
        this.startY = this.y;             // Initial Y (for frame of reference)

        this.minY = this.height/2;
        this.maxY = h - this.height/2;

        // Public functions
        this.setElement = function(element) {
            this.element = element;
        }
    };

    c.prototype = {
        convertY : function(yPos) {
            return yPos - this.startY;
        },
        updatePosition : function(mouseY) {
            this.y = Util.clamp(this.minY, this.convertY(mouseY), this.maxY);

            this.element.data({
                y : this.y
            });
        }
    };

    return c;
})();

//=========================================================================
// Utilities
//=========================================================================
var Util = {
    goFullscreen: function() {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        }
        else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();          
        }
        else if (canvas.webkitRequestFullScreen) {
            canvas.webkitRequestFullScreen();
        } else {
            return;
        }
        Util.setCanvasSize("fullscreen");
    },
    
    setCanvasSize: function(type) {
        var w,h;
        switch(type) {
            case "fullscreen": w = screen.width;      h = screen.height;      break;
            case "windowed"  : w = window.innerWidth; h = window.innerHeight; break;
        }
        canvas.width = w;
        canvas.height = h;
    },

    toComponentVectors : function(speed,angle) {
        return {
            vx: speed*Math.cos(angle),
            vy: speed*Math.sin(angle)
        }
    },
    clamp : function(min, x, max) {
        return Math.max(min, Math.min(x, max));
    }
}
window.addEventListener("fullscreenchange", function() {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        Util.setCanvasSize("fullscreen");
    } else { 
        Util.setCanvasSize("windowed");
    }
    
});


/*
Queue.js - Minified queue representation
Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:
http://creativecommons.org/publicdomain/zero/1.0/legalcode
*/
function Queue(){
var _1=[],_2=0;
this.getLength=function(){ return (_1.length-_2); };
this.isEmpty=function()  { return (_1.length==0); };
this.peek=function()     { return (_1.length>0?_1[_2]:undefined); };
this.enqueue=function(_3){ _1.push(_3); };
this.dequeue=function(){
if(_1.length==0) return undefined;
var _4=_1[_2];
if(++_2*2>=_1.length){ _1=_1.slice(_2);_2=0; }
return _4;
};
};