

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

var dedos = [];
var robot, base, brazo, antebrazo, mano;

var gui_controls = {
giro_base: 0,
giro_brazo: 0,
giro_antebrazo_y: 0,
giro_antebrazo_z: 0,
giro_pinza: 0,
separacion_pinza:10,
alambre: false,
animacion: function() {
  console.log("HOLA")
}
};

var gui_controls_anterior = {
giro_base: 0,
giro_brazo: 0,
giro_antebrazo_y: 0,
giro_antebrazo_z: 0,
giro_pinza: 0,
separacion_pinza:10,
};

var controls = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false
}

// Event listeners para controles
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            controls.moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            controls.moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            controls.moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            controls.moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            controls.moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            controls.moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            controls.moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            controls.moveRight = false;
            break;
    }
});

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 2000 );
  camera.position.set( 1, 1.5, 2 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  // interface de usuario
  var gui = new dat.GUI();

  var gui_general = gui.addFolder('Control Robot');
  gui_general.add(gui_controls, 'giro_base', -180, 180).name("Giro Base").onChange(
    (valor) => {
      var ant = gui_controls_anterior.giro_base;
      base.rotation.y += (valor - ant) * Math.PI / 180;
      gui_controls_anterior.giro_base = valor;
    } 
  );
  gui_general.add(gui_controls, 'giro_brazo', -45, 45).name("Giro Brazo").onChange(
    (valor) => {
      var ant = gui_controls_anterior.giro_brazo;
      brazo.rotation.z += (valor - ant) * Math.PI / 180;
      gui_controls_anterior.giro_brazo = valor;
    } 
  );
  gui_general.add(gui_controls, 'giro_antebrazo_y', -180, 180).name("Giro Antebrazo Y").onChange(
    (valor) => {
      var ant = gui_controls_anterior.giro_antebrazo_y;
      antebrazo.rotateY((valor - ant) * Math.PI / 180);
      gui_controls_anterior.giro_antebrazo_y = valor;
    } 
  );
  gui_general.add(gui_controls, 'giro_antebrazo_z', -90, 90).name("Giro Antebrazo Z").onChange(
    (valor) => {
      var ant = gui_controls_anterior.giro_antebrazo_z;
      antebrazo.rotateZ((valor - ant) * Math.PI / 180);
      gui_controls_anterior.giro_antebrazo_z = valor;
    } 
  );
  gui_general.add(gui_controls, 'giro_pinza', -40, 220).name("Giro Pinza").onChange(
    (valor) => {
      var ant = gui_controls_anterior.giro_pinza;
      mano.rotateZ(-(valor - ant) * Math.PI / 180);
      gui_controls_anterior.giro_pinza = valor;
    } 
  );
  gui_general.add(gui_controls, 'separacion_pinza', 0, 15).name("Separacion Pinza").onChange(
    (valor) => {
      var ant = gui_controls_anterior.separacion_pinza;
      let x = [1,-1];
      for(let i=0; i<x.length; i++){
        dedos[i].position.x += x[i]*(valor-ant);
      }
      gui_controls_anterior.separacion_pinza = valor;
    } 
  );
  gui_general.add(gui_controls, 'alambre').name("Alambres").onChange(
  (valor) => {
    scene.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            child.material.wireframe = valor;
        }
    });
  }
);
;
  gui_general.open();

  gui.add(gui_controls, "animacion").name("Anima")

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
    let material = new THREE.MeshNormalMaterial();  

    let suelo = new THREE.Mesh(new THREE.BoxGeometry(1000, 10, 1000), material);
    scene.add(suelo);

    //ANTEBRAZO
    let antbrazo = new THREE.Object3D();

    let disco = new THREE.Mesh(new THREE.CylinderGeometry(22,22,6,50),material);
    antbrazo.add(disco);

    let nervios = new THREE.Object3D();
    for (let x of [1,-1]){
      for (let z of [1, -1]){
        let nervio = new THREE.Mesh(new THREE.BoxGeometry(4,80,4), material)
        nervio.position.x = x*8;
        nervio.position.z = z*8;
        nervios.add(nervio);
      }
    }
    nervios.position.y = 40;
    antbrazo.add(nervios);

    let hand = new THREE.Object3D()
    let punyo = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40,50), material);
    punyo.rotation.z = Math.PI/2.0;
    hand.add(punyo);

    var vertices = new Uint16Array([
      0, 0, 0,   // v0
      0, 20, 0,   // v1
      19, 17,  0,   // v2
      19, 3,  0,   // v3
      0, 0, 4,  // v4
      0, 20, 4,  // v5
      19, 17,  2,  // v6
      19, 3,  2,   // v7
    ]);

    var indices = new Uint16Array([
      // Cara base (z=0)
      0, 1, 2,
      0, 2, 3,

      // Cara superior (z≈2–4)
      4, 6, 5,
      4, 7, 6,

      // Lados
      // Entre v0-v1 y v4-v5
      0, 5, 1,
      0, 4, 5,

      // Entre v1-v2 y v5-v6
      1, 6, 2,
      1, 5, 6,

      // Entre v2-v3 y v6-v7
      2, 7, 3,
      2, 6, 7,

      // Entre v3-v0 y v7-v4
      3, 4, 0,
      3, 7, 4
    ]);

    //Crear los dedos
    let x=[1,-1]
    for (let i=0; i<x.length; i++){
      let dedo = new THREE.Mesh(new THREE.BoxGeometry(4,20,19), material);
      
      var pinza = new THREE.BufferGeometry();
      pinza.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      pinza.setIndex(new THREE.BufferAttribute(indices, 1));

      material = new THREE.MeshNormalMaterial();
      // Calcula las normales de los vértices para iluminación correcta
      pinza.computeVertexNormals(); 


      // Crear el objeto pinza
      var pinza = new THREE.Mesh(pinza, material);
      pinza.scale.z= -x[i];
      pinza.rotation.y = -Math.PI/2.0;
      pinza.position.x -= x[i]*2;
      pinza.position.y-=10;
      pinza.position.z+=9.5;
           
      dedo.add(pinza);

      dedo.position.z=15;
      dedo.position.x=x[i]*12;
      
      hand.add(dedo);
      dedos.push(dedo);
    }
    hand.rotateY(-Math.PI/2);
    mano = new THREE.Object3D();
    mano.add(hand);
    mano.position.y = 80;

    antbrazo.add(mano);    
    //antbrazo.rotation.y = -Math.PI / 2;

    antebrazo = new THREE.Object3D();
    antebrazo.add(antbrazo);
    antebrazo.position.y=120;
    

    //BRAZO
    brazo = new THREE.Object3D();
    let rotula = new THREE.Mesh(new THREE.SphereGeometry(20), material);
    rotula.position.y=120;
    brazo.add(rotula);

    let eje = new THREE.Mesh(new THREE.CylinderGeometry(20,20,18,50), material);
    eje.rotation.x = Math.PI/2.0;
    brazo.add(eje);
    
    let esparrago = new THREE.Mesh(new THREE.BoxGeometry(18,120,12), material)
    esparrago.position.y+=60;
    brazo.add(esparrago);

    brazo.add(antebrazo);
    brazo.rotation.y = Math.PI/2;

    robot = new THREE.Object3D();
    base = new THREE.Mesh(new THREE.CylinderGeometry(50,50,15,50), material);
    base.position.y = 7.5;

    base.add(brazo);
    robot.add(base);

    scene.add(robot);
    scene.add(new THREE.AxesHelper(100));


}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{
  // Cambios para actualizar la camara segun mvto del raton
  cameraControls.update();

  if (controls.moveForward)
    robot.position.z -=0.5;
  if (controls.moveBackward)
    robot.position.z +=0.5;
  if (controls.moveLeft)
    robot.position.x -=0.5;
  if (controls.moveRight)
    robot.position.x +=0.5;
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}