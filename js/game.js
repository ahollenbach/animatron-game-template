//=========================================================================
// Global Variables
//=========================================================================
var canvas = {
    width:  0,
    height: 0
}

// Animatron variables
var b = Builder._$, C = anm.C;
const PREDICT_SPAN = 1/150;
anm.M[C.MOD_COLLISIONS].predictSpan = PREDICT_SPAN;
const DEFAULT_POS = [0,0];

// Physics globals
var physics = {}

var anmSettings = 
{
    //"debug"  : true,
    "mode" : C.M_DYNAMIC,
    "anim" : {
        "fps": 50,
        "width" : canvas.width,
        "height" : canvas.height
    }
}

//=========================================================================
// Scene Building
//=========================================================================

function initGame() {
    Util.goFullscreen();
    Util.setCanvasSize();

    /**Animatron**/
    var scene = buildScene();
    var game = createPlayer('game-canvas', anmSettings).load(scene);
    game.play();

    game.startGame = function() {
        tLastPoint = game.state.time;
    }
    return game;
}

function buildScene() {
    var player = b('player');

    const COLOR = {
        DARK : "#444",
        LIGHT: "#555"
    }

    var road = b('road');

    var sky = b('sky');
    sky.rect([canvas.width/2,canvas.height/8], [canvas.width, canvas.height/4+3]);
    sky.fill("#669CCC");

    var yOff = canvas.height/4;
    var grassLeft = b('grass-left');
    grassLeft.path([ [ 0, 0 ],[ canvas.width/2-10, 0 ],[ 0, canvas.height-yOff-100 ],[ 0, canvas.height-yOff ] ]);
    grassLeft.fill("#60BF40");
    var bounds = grassLeft.x.path.bounds();
    grassLeft.reg([bounds[0],bounds[1]]);
    grassLeft.move([0,yOff]);

    var grassRight = b('grass-left');
    grassRight.path([ [ 0, 0 ],[ canvas.width/2-10, 0 ],[ canvas.width/2-10, canvas.height-yOff ],[ canvas.width/2-10, canvas.height-yOff-100 ] ]);
    grassRight.fill("#60BF40");
    var bounds = grassRight.x.path.bounds();
    grassRight.reg([bounds[0],bounds[1]]);
    grassRight.move([canvas.width/2+10,canvas.height/4]);

    var scene = b('scene');
    scene.add(road);
    scene.add(grassLeft);
    scene.add(grassRight);
    scene.add(sky); // add after road(so it is on top)
    return scene;
}

//=========================================================================
// Utilities
//=========================================================================

var Util = {
    goFullScreen: function() {
        var docElm = document.documentElement;

        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();          
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
        $("#button").hide();
    }
    
    setCanvasSize: function() {
    canvas.width = document.width;
    canvas.height = document.height-5;

    var c = document.getElementById("game-canvas");
    c.width = document.width;
    c.height = document.height;
}