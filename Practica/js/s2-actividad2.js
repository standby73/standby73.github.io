

// Variables globales que van siempre
var renderer, scene, camera;
var cameraControls;
var angulo = -0.01;

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
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set( 1, 1.5, 2 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene()
{
	// Añade el objeto grafico a la escena
    //let material_suelo = new THREE.MeshBasicMaterial({ color: 0xf0ff00 }); // Verde
    let material = new THREE.MeshNormalMaterial();          
    
    let base = new THREE.Mesh( new THREE.CylinderGeometry(4,4,2,32),
                                new THREE.MeshBasicMaterial({color:0x00ff00, transparent:true, opacity:0.5}));
    scene.add(base);

    let brazo = new THREE.Object3D();
    let esparrago = new THREE.Mesh(new THREE.CylinderGeometry(2,2,1,32),
                                    new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.5}))
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
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}