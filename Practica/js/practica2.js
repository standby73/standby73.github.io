
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

var dedos = [];
var dedos_init = [];   
var sep_init = 10;   
var robot, base, brazo, antebrazo, mano;
var animacionActiva = false;

var gui_controls = {
  giro_base: 0,
  giro_brazo: 0,
  giro_antebrazo_y: 0,
  giro_antebrazo_z: 0,
  giro_pinza: 0,
  separacion_pinza: 10,
  alambre: false,
  animacion: function() {
    if (!animacionActiva) {
      iniciarAnimacion();
    }
  }
};

var gui_controls_anterior = {
  giro_base: 0,
  giro_brazo: 0,
  giro_antebrazo_y: 0,
  giro_antebrazo_z: 0,
  giro_pinza: 0,
  separacion_pinza: 10,
};

var controls = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false
};

//Controles
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

function limite(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// 1-inicializa 
init();
// 2-Crea una escena
loadScene();
// 3-renderiza
render();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0xFFFFFF));
  document.getElementById('container').appendChild(renderer.domElement);

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 2000);
  camera.position.set(1, 1.5, 2);

  cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
  cameraControls.target.set(0, 0, 0);

  var gui = new dat.GUI();

  var gui_general = gui.addFolder('Control Robot');

  gui_general.add(gui_controls, 'giro_base', -180, 180).name("Giro Base").onChange(
    (valor) => {
      valor = limite(valor, -180, 180);
      gui_controls.giro_base = valor;
      actualizarRobot(gui_controls);
    }
  );
  gui_general.add(gui_controls, 'giro_brazo', -45, 45).name("Giro Brazo").onChange(
    (valor) => {
      valor = limite(valor, -45, 45);
      gui_controls.giro_brazo = valor;
      actualizarRobot(gui_controls);
    }
  );
  gui_general.add(gui_controls, 'giro_antebrazo_y', -180, 180).name("Giro Antebrazo Y").onChange(
    (valor) => {
      valor = limite(valor, -180, 180);
      gui_controls.giro_antebrazo_y = valor;
      actualizarRobot(gui_controls);
    }
  );
  gui_general.add(gui_controls, 'giro_antebrazo_z', -90, 90).name("Giro Antebrazo Z").onChange(
    (valor) => {
      valor = limite(valor, -90, 90);
      gui_controls.giro_antebrazo_z = valor;
      actualizarRobot(gui_controls);
    }
  );
  gui_general.add(gui_controls, 'giro_pinza', -40, 220).name("Giro Pinza").onChange(
    (valor) => {
      valor = limite(valor, -40, 220);
      gui_controls.giro_pinza = valor;
      actualizarRobot(gui_controls);
    }
  );
  gui_general.add(gui_controls, 'separacion_pinza', 0, 15).name("Separacion Pinza").onChange(
    (valor) => {
      valor = limite(valor, 0, 15);
      gui_controls.separacion_pinza = valor;
      actualizarRobot(gui_controls);
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
  gui_general.open();

  gui.add(gui_controls, "animacion").name("Anima");

  window.addEventListener('resize', updateAspectRatio);
}

function iniciarAnimacion() {
  animacionActiva = true;

  const posicionInicial = {
    giro_base: gui_controls.giro_base,
    giro_brazo: gui_controls.giro_brazo,
    giro_antebrazo_y: gui_controls.giro_antebrazo_y,
    giro_antebrazo_z: gui_controls.giro_antebrazo_z,
    giro_pinza: gui_controls.giro_pinza,
    separacion_pinza: gui_controls.separacion_pinza
  };

  const inicio = {
    giro_base: gui_controls.giro_base,
    giro_brazo: gui_controls.giro_brazo,
    giro_antebrazo_y: gui_controls.giro_antebrazo_y,
    giro_antebrazo_z: gui_controls.giro_antebrazo_z,
    giro_pinza: gui_controls.giro_pinza,
    separacion_pinza: gui_controls.separacion_pinza
  };

  const tween1 = new TWEEN.Tween(inicio)
    .to({
      giro_base: limite(120, -180, 180),
      giro_brazo: limite(-30, -45, 45),
      giro_antebrazo_y: limite(60, -180, 180),
      separacion_pinza: limite(15, 0, 15)
    }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => actualizarRobot(inicio));

  const tween2 = new TWEEN.Tween(inicio)
    .to({
      giro_brazo: limite(45, -45, 45),
      giro_antebrazo_z: limite(-80, -90, 90),
      giro_pinza: limite(180, -40, 220)
    }, 3000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(() => actualizarRobot(inicio));

  const tween3 = new TWEEN.Tween(inicio)
    .to({
      giro_base: limite(-120, -180, 180),
      giro_antebrazo_y: limite(-120, -180, 180),
      giro_antebrazo_z: limite(90, -90, 90),
      separacion_pinza: limite(5, 0, 15)
    }, 3000)
    .easing(TWEEN.Easing.Back.InOut)
    .onUpdate(() => actualizarRobot(inicio));

  const tween4 = new TWEEN.Tween(inicio)
    .to({
      giro_brazo: limite(-45, -45, 45),
      giro_pinza: limite(-20, -40, 220),
      separacion_pinza: limite(0, 0, 15)
    }, 3000)
    .easing(TWEEN.Easing.Elastic.Out)
    .onUpdate(() => actualizarRobot(inicio));

  const tween5 = new TWEEN.Tween(inicio)
    .to({
      giro_base: posicionInicial.giro_base,
      giro_brazo: posicionInicial.giro_brazo,
      giro_antebrazo_y: posicionInicial.giro_antebrazo_y,
      giro_antebrazo_z: posicionInicial.giro_antebrazo_z,
      giro_pinza: posicionInicial.giro_pinza,
      separacion_pinza: posicionInicial.separacion_pinza
    }, 2500)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .onUpdate(() => actualizarRobot(inicio))
    .onComplete(() => {
      animacionActiva = false;
  });

  tween1.chain(tween2);
  tween2.chain(tween3);
  tween3.chain(tween4);
  tween4.chain(tween5);


  tween1.start();
}

function actualizarRobot(valores) {
  // limite de entrada
  const v = {
    giro_base: limite(valores.giro_base, -180, 180),
    giro_brazo: limite(valores.giro_brazo, -45, 45),
    giro_antebrazo_y: limite(valores.giro_antebrazo_y, -180, 180),
    giro_antebrazo_z: limite(valores.giro_antebrazo_z, -90, 90),
    giro_pinza: limite(valores.giro_pinza, -40, 220),
    separacion_pinza: limite(valores.separacion_pinza, 0, 15)
  };

  base.rotation.y = v.giro_base * Math.PI / 180;
  brazo.rotation.z = v.giro_brazo * Math.PI / 180;

  antebrazo.rotation.y = v.giro_antebrazo_y * Math.PI / 180;
  antebrazo.rotation.z = v.giro_antebrazo_z * Math.PI / 180;

  mano.rotation.z = -v.giro_pinza * Math.PI / 180;

  let x = [1, -1];  
  for (let i = 0; i < dedos.length; i++) {
    dedos[i].position.x = dedos_init[i] + x[i] * (v.separacion_pinza - sep_init);
  }

  gui_controls.giro_base = v.giro_base;
  gui_controls.giro_brazo = v.giro_brazo;
  gui_controls.giro_antebrazo_y = v.giro_antebrazo_y;
  gui_controls.giro_antebrazo_z = v.giro_antebrazo_z;
  gui_controls.giro_pinza = v.giro_pinza;
  gui_controls.separacion_pinza = v.separacion_pinza;

  gui_controls_anterior.giro_base = v.giro_base;
  gui_controls_anterior.giro_brazo = v.giro_brazo;
  gui_controls_anterior.giro_antebrazo_y = v.giro_antebrazo_y;
  gui_controls_anterior.giro_antebrazo_z = v.giro_antebrazo_z;
  gui_controls_anterior.giro_pinza = v.giro_pinza;
  gui_controls_anterior.separacion_pinza = v.separacion_pinza;
}

function loadScene() {
  let material = new THREE.MeshNormalMaterial();

  let suelo = new THREE.Mesh(new THREE.BoxGeometry(1000, 10, 1000), material);
  scene.add(suelo);

  //ANTEBRAZO
  let antbrazo = new THREE.Object3D();

  let disco = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 50), material);
  antbrazo.add(disco);

  let nervios = new THREE.Object3D();
  for (let x of [1, -1]) {
    for (let z of [1, -1]) {
      let nervio = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material)
      nervio.position.x = x * 8;
      nervio.position.z = z * 8;
      nervios.add(nervio);
    }
  }
  nervios.position.y = 40;
  antbrazo.add(nervios);

  let hand = new THREE.Object3D()
  let punyo = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 40, 50), material);
  punyo.rotation.z = Math.PI / 2.0;
  hand.add(punyo);

  var vertices = new Uint16Array([
    0, 0, 0,   // v0
    0, 20, 0,   // v1
    19, 17, 0,   // v2
    19, 3, 0,   // v3
    0, 0, 4,  // v4
    0, 20, 4,  // v5
    19, 17, 2,  // v6
    19, 3, 2,   // v7
  ]);

  var indices = new Uint16Array([
    // Cara base
    0, 1, 2,
    0, 2, 3,

    // Cara superior
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
  let x = [1, -1]
  for (let i = 0; i < x.length; i++) {
    let dedo = new THREE.Mesh(new THREE.BoxGeometry(4, 20, 19), material);

    var pinza = new THREE.BufferGeometry();
    pinza.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    pinza.setIndex(new THREE.BufferAttribute(indices, 1));

    material = new THREE.MeshNormalMaterial();

    pinza.computeVertexNormals();


    // Crear el objeto pinza
    var pinza = new THREE.Mesh(pinza, material);
    pinza.scale.z = -x[i];
    pinza.rotation.y = -Math.PI / 2.0;
    pinza.position.x -= x[i] * 2;
    pinza.position.y -= 10;
    pinza.position.z += 9.5;

    dedo.add(pinza);

    dedo.position.z = 15;
    dedo.position.x = x[i] * 12;

    hand.add(dedo);
    dedos.push(dedo);

    dedos_init.push(dedo.position.x);
  }
  hand.rotateY(-Math.PI / 2);
  mano = new THREE.Object3D();
  mano.add(hand);
  mano.position.y = 80;

  antbrazo.add(mano);

  antebrazo = new THREE.Object3D();
  antebrazo.add(antbrazo);
  antebrazo.position.y = 120;


  brazo = new THREE.Object3D();
  let rotula = new THREE.Mesh(new THREE.SphereGeometry(20), material);
  rotula.position.y = 120;
  brazo.add(rotula);

  let eje = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 18, 50), material);
  eje.rotation.x = Math.PI / 2.0;
  brazo.add(eje);

  let esparrago = new THREE.Mesh(new THREE.BoxGeometry(18, 120, 12), material)
  esparrago.position.y += 60;
  brazo.add(esparrago);

  brazo.add(antebrazo);
  brazo.rotation.y = Math.PI / 2;

  robot = new THREE.Object3D();
  base = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 15, 50), material);
  base.position.y = 7.5;

  base.add(brazo);
  robot.add(base);

  scene.add(robot);
  scene.add(new THREE.AxesHelper(100));

  sep_init = gui_controls.separacion_pinza;
}

function updateAspectRatio() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update() {
  cameraControls.update();

  TWEEN.update();

  if (controls.moveForward)
    robot.position.z -= 0.5;
  if (controls.moveBackward)
    robot.position.z += 0.5;
  if (controls.moveLeft)
    robot.position.x -= 0.5;
  if (controls.moveRight)
    robot.position.x += 0.5;
}

function render() {
  requestAnimationFrame(render);
  update();
  renderer.render(scene, camera);
}
