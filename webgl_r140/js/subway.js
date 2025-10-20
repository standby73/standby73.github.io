import { ChunkManager } from "./chunk.js";
import { Player } from "./player.js";
import { HUDManager } from "./gamehud.js";
import { EnvironmentManager } from "./environment.js";

var playGame = false;
var restart = false;

// Variables globales que van siempre
var renderer, scene, camera;
const clock = new THREE.Clock();
var cameraControls;
var camaraFollow = false;
var mixer = null;

var chunkManager = null;
var environmentManager = null;
var player = null;

let state = "run";
var controls = {
  Jump: false,
  Roll: false,
  moveLeft: false,
  moveRight: false
}
var leftPressed = false;
var rightPressed = false;

let actions = {};
let animationNames = [];
let currentAnimationIndex = 3;

let hud = null;

// Event listeners para controles
document.addEventListener('keydown', (event) => {
    if(!restart){
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                controls.Jump = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                controls.Roll = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if(!controls.moveLeft) {
                    leftPressed = true;
                }
                controls.moveLeft = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (!controls.moveRight) {
                    rightPressed = true;
                }
                controls.moveRight = true;
                break;
        }
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            controls.Jump = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            controls.Roll = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            controls.moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            controls.moveRight = false;
            break;
        case "KeyC":
            camaraFollow=!camaraFollow;
            break;
        case "Space":
            if(!playGame && !restart){
                playGame = true;
                hud.startGame();
                changeAnimation(0);                
            }
            break;
    }
});

let world;
const groundMaterial = new CANNON.Material("groundMaterial");
const playerMaterial = new CANNON.Material("playerMaterial");
const obstacleMaterial = new CANNON.Material("obstacleMaterial");

init();
render();

function init()
{

    if (scene) {
        while(scene.children.length > 0) { 
            scene.remove(scene.children[0]); 
        }
    }
    
    // Limpiar mundo físico anterior
    if (world) {
        while(world.bodies.length > 0) {
            world.removeBody(world.bodies[0]);
        }
    }
    
    // Limpiar renderer anterior
    if (renderer) {
        const container = document.getElementById('container');
        if (container && renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
        }
        renderer.dispose();
    }

    if (environmentManager) {
        environmentManager.clear();
        environmentManager = null;
    }

    if (hud) hud.destroyAll();
    hud = new HUDManager();
    hud.showStart();

    state = "run";
    mixer = null;
    actions = {};
    animationNames = [];
    currentAnimationIndex = 3;

    playGame = false;
    restart=false;
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( new THREE.Color(0xFFFFFF) );
    renderer.shadowMap.enabled = true;

    document.getElementById('container').appendChild( renderer.domElement );

    scene = new THREE.Scene();

    // Mundo fisico
    world = new CANNON.World();
    world.gravity.set(0, -9.8, 0);  


    environmentManager = new EnvironmentManager(scene, world, renderer, groundMaterial);
    environmentManager.loadModels(() => {
        environmentManager.init(3, 6, 100); // se ejecuta solo después de cargar
    });


    player = new Player(0.5, 1.8, 0.5, scene, world, playerMaterial);
    player.init();

    player.mesh.body.addEventListener('collide', (event) => {
            onCollision(event);
    });

    let playerGroundContact = new CANNON.ContactMaterial(
        playerMaterial,
        groundMaterial,
        {
            friction: 0,
            restitution: 0
        }
    );
    world.addContactMaterial(playerGroundContact);

    loadModelAndAnimations();

    let playerObstacleContact = new CANNON.ContactMaterial(
        playerMaterial,
        obstacleMaterial,
        {
            friction: 0,
            restitution: 0
        }
    );
    world.addContactMaterial(playerObstacleContact);

    chunkManager = new ChunkManager(scene, world, player, 100, 3, 10, obstacleMaterial);
    chunkManager.init();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 2000 );
    camera.position.set( 0, 6, 10);
    camera.lookAt(0, 1, 0)

    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.target.set( 0, 0, 0 );
    cameraControls.enabled = false;
    
    //Ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    //Direccional (Como el sol)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

    directionalLight.position.set(5, 20, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 130;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.right = 40;
    directionalLight.shadow.camera.left = -20;

    scene.add(directionalLight);

    window.addEventListener('resize', updateAspectRatio );
}

function onCollision(event){ 
    let otherBody = event.body;
    if (otherBody.obstacle && playGame) {
        hud.showGameOver(() => {
            restart = true;
            playGame = false;
            init();
        });
        playGame = false;
        restart = true;
    }
}

function loadModelAndAnimations() {
    const loader = new THREE.FBXLoader();

    // Cargar modelo base
    loader.load('models/subway/Ty.fbx', function (object) {
        //SKIN DEL PLAYER
        player.setModel(object);
        
        mixer = new THREE.AnimationMixer(object);
        // Cargar y aplicar animaciones
        const animations = ["models/subway/Running.fbx", 
                            'models/subway/Jumping.fbx', 
                            'models/subway/Stand To Roll.fbx',
                            "models/subway/Wave Hip Hop Dance.fbx"];
        animations.forEach(function (animFile, index) {
            loader.load(animFile, function (animData) {
                const name = animFile.split('/').pop().split('.').slice(0, -1).join('.');

                let clip = animData.animations[0];
                if (name === 'Stand To Roll' || name === 'Jumping') {
                    const fixedTracks = clip.tracks.map(track => {
                        if (track.name === 'mixamorigHips.position') {
                            const newTrack = track.clone();
                            const values = newTrack.values;

                            if (name==='Jumping'){
                                for (let i = 1; i < values.length; i += 3) {
                                    values[i] = 0; // eje Z
                                }
                            }
                            if (name==='Stand To Roll'){
                                for (let i = 2; i < values.length; i += 3) {
                                    values[i] = 0; // eje Z
                                }
                            }

                            newTrack.values = values;
                            return newTrack;
                        } else {
                            return track;
                        }
                    });

                    const fixedClip = clip.clone();
                    fixedClip.tracks = fixedTracks;
                    clip = fixedClip;
                }

                const action = mixer.clipAction(clip);

                if (name === 'Running') {
                    action.timeScale = 1.3;
                } else if (name === 'Stand To Roll') {
                    action.timeScale = 1.6;
                } else if (name === 'Jumping') {
                    action.timeScale = 0.9;
                }

                actions[name] = action;            
                animationNames[index] = name;      

                if (index === 3) {              
                    action.play();
                }
            });
        });

    }, undefined, function (error) {
        console.error(error);
    });
}

function changeAnimation(index) {

    if (currentAnimationIndex == index)
        return;
    // Reproducir la nueva animación
    actions[animationNames[index]].play();
    // Detener la animación anterior
    actions[animationNames[currentAnimationIndex]].stop();
    currentAnimationIndex = index;
}

function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}


function update()
{
    const delta = clock.getDelta(); 
    if (player == null)
    return; 
    if (mixer != null) mixer.update(delta);
    if (chunkManager != null && playGame) {
        chunkManager.update(delta);
        if (hud != null) hud.update(delta, chunkManager.speed);
    }
    if (environmentManager != null && playGame) {
        environmentManager.update(delta, chunkManager.speed, player.z);
        
        let z = environmentManager.getLastEnvironmentZ();
        if (z > player.z - 150) {
            environmentManager.createEnvironment(z, 6, 100);
        }
    }    
        
    player.update();
    if(player.mesh.fbx && currentAnimationIndex===3){
        player.mesh.fbx.position.y -= player.height/2;
        player.mesh.fbx.rotation.y = Math.PI;
    }

    if(player.mesh.fbx && currentAnimationIndex===2){
        player.mesh.fbx.position.y += player.height/4 ;
    }

    if(player.mesh.fbx && currentAnimationIndex===1){
        player.mesh.fbx.position.y += player.height/2;
    }

    if (!camaraFollow) {
        if (player.mesh && player.mesh.body) {
            cameraControls.enabled=false;
            camera.position.set(0,6,10);
            
            camera.lookAt(0,1,0);
        }
    } else {
        cameraControls.enabled=true;
        cameraControls.update();
    }

    if(playGame){
        if (leftPressed) {
            player.moveLeft();
            leftPressed = false;
            if (state === 'roll') {
                state = 'run';
                player.standUp();
                changeAnimation(0);
            }
        }
        
        if (rightPressed) {
            player.moveRight();
            rightPressed = false;
            if (state === 'roll') {
                state = 'run';
                player.standUp();
                changeAnimation(0);
            }
        }

            switch(state) {
            case 'run':
                if (controls.Jump && player.isGround()) {
                    state = 'jump';
                    player.mesh.body.velocity.y = 6;
                    changeAnimation(1);
                } else if (controls.Roll && player.isGround()) {
                    state = 'roll';
                    player.roll();
                    changeAnimation(2);
                }
                break;
                
            case 'jump':
                if (controls.Roll) {
                    state = 'roll';
                    player.mesh.body.velocity.y = -8;
                    player.roll();
                    changeAnimation(2);
                } else if (player.isGround() && player.mesh.body.velocity.y <= 0.1) {
                    state = 'run';
                    changeAnimation(0);
                }
                break;
                
            case 'roll':
                if (controls.Jump) {
                    state = 'jump';
                    player.standUp();
                    player.mesh.body.velocity.y = 6;
                    changeAnimation(1);
                } else {
                    let roll = actions[animationNames[2]];
                    if (roll && roll.time >= roll.getClip().duration - 0.1) {
                        state = 'run';
                        player.standUp();
                        changeAnimation(0);
                    }
                }
                break;
        }
    }

    world.step(1 / 60, delta, 3);
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}