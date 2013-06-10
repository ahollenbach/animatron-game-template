//=========================================================================
// Global Variables
//=========================================================================
var canvas,b,C,physics,anmSettings;
const PREDICT_SPAN,DEFAULT_POS;
function setGlobals() {
    // Animatron variables
    b = Builder._$;
    C = anm.C;
    PREDICT_SPAN = 1/150;
    anm.M[C.MOD_COLLISIONS].predictSpan = PREDICT_SPAN;
    DEFAULT_POS = [0,0];

    // Physics globals
    physics = {}

    anmSettings = 
    {
        //"debug"  : true,
        "mode" : C.M_DYNAMIC,
        "anim" : {
            "fps": 50,
            "width" : canvas.width,
            "height" : canvas.height
        }
    }
}
//=========================================================================
// Scene Building
//=========================================================================

function initGame() {
    canvas = document.getElementById('game-canvas');
    Util.goFullscreen();
    setGlobals();

    /**Animatron**/
    var scene = buildScene();
    var game = createPlayer(canvas.id, anmSettings).load(scene);
    game.play();

    game.startGame = function() {
        tLastPoint = game.state.time;
    }
    return game;
}

function buildScene() {
    var scene = b('scene');
    return scene;
}

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
    }
}
window.addEventListener("fullscreenchange", function() {
    if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        Util.setCanvasSize("fullscreen");
    } else { 
        Util.setCanvasSize("windowed");
    }
    
});