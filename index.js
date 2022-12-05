const container = document.getElementById('container');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
const object = new THREE.Object3D();

scene.add(cube);
scene.add(object);

object.matrixAutoUpdate = true;
object.updateMatrix();

camera.position.z = 5;

let controls = new THREE.OrbitControls(camera, container);

controls.enableDamping = true;
controls.maxDistance = 9;
controls.target.set( 0, 0.5, 0 );
controls.update();

function render(time) {
    time *= 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

requestAnimationFrame(render)