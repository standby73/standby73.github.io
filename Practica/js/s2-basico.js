

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
    let material_suelo = new THREE.MeshBasicMaterial({ color: 0xf0ff00 }); // Verde
    let material = new THREE.MeshNormalMaterial();          
    
    for(let i=0; i< 100;i++){
      let cubo = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 1), material);
      cubo.position.y = i*0.1;
      cubo.position.x = 0.3*Math.floor(i/2.0);
      scene.add(cubo);
    }
    let suelo = new THREE.Mesh(new THREE.BoxGeometry(100, 0.01, 100), material_suelo);
    suelo.position.y -=0.1;
    scene.add(suelo)
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