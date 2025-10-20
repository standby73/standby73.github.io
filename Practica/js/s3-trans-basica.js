

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
  camera.position.set( 5, 10, 20 );

  cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
  cameraControls.target.set( 0, 0, 0 );

  window.addEventListener('resize', updateAspectRatio );
}


function loadScene() {
    caja1 = new THREE.Mesh(new THREE.BoxGeometry(5,10,0.1), new THREE.MeshNormalMaterial());
    scene.add(caja1);
    scene.add( new THREE.AxesHelper(15 ) );

}


function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

var time = 0;
var last_move = 0;
var rad = 0;
function update()
{
    time += 0.01;
    // Cambios para actualizar la camara segun mvto del raton
    cameraControls.update();

    // Crear la matriz de rotación
    if (rad < -(70.0 * Math.PI / 180.0))
      last_move = 70;

    if (rad > 0)
      last_move = 0;

    if (last_move == 70)
      rad +=0.01;
    else 
      rad -= 0.01;

    let T0 = new THREE.Matrix4();
    T0.makeTranslation(2.5,5.0,0.0);
    let Ry = new THREE.Matrix4();
    Ry.makeRotationY(rad);  
    let T1 = new THREE.Matrix4();
    T1.makeTranslation(-2.5,-5.0,0.0);

    T1.multiply(Ry);
    T1.multiply(T0);
    //let Rx = new THREE.Matrix4();
    //Rx.makeRotationX(0);  

    // Combinar todas las transformaciones
    //let M = new THREE.Matrix4();
    //M.multiply(Rx); 
    //M.multiply(Rz); 
    // M = Rx x Rz

    // Aplicar la transformación  al objeto
    caja1.matrix.identity();  // Limpiar la matriz actual
    caja1.applyMatrix4(T1);    // Aplicar la matriz de transformación combinada
    caja1.matrixAutoUpdate = false;  // Desactivar la actualización automática de la matriz

  
}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}