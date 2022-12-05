const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(2, 2, 2);
scene.add( new THREE.AmbientLight( 0xffffff, 0.5 ) );

const dirLight = new THREE.DirectionalLight(0xffffff, 1);

dirLight.position.set( 5, 10, 7.5 );
dirLight.castShadow = true;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.top	= 2;
dirLight.shadow.camera.bottom = - 2;

dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add( dirLight );

const planes = [
    new THREE.Plane( new THREE.Vector3(- 1, 0, 0), 1),
    new THREE.Plane( new THREE.Vector3(0, - 1, 0), 1),
    new THREE.Plane( new THREE.Vector3(0, 0, - 1), 0.3)
];

const planeHelpers = planes.map(p => new THREE.PlaneHelper(p, 2, 0xffffff));
    planeHelpers.forEach(ph => {
    ph.visible = true;
    scene.add(ph);
});

function drawSquare(x1, y1, x2, y2) {
	var square = new THREE.Geometry();
	square.vertices.push(new THREE.Vector3(x1,y1,0));
    square.vertices.push(new THREE.Vector3(x1,y2,0));
    square.vertices.push(new THREE.Vector3(x2,y1,0));
    square.vertices.push(new THREE.Vector3(x2,y2,0));
    
    // square.faces.push(new THREE.Face3(0,1,2));
    // square.faces.push(new THREE.Face3(1,2,3));

	return square;
}

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const geometry = drawSquare(3,3,3,3);

geometry.depth = 100;

// geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
// geometry.setIndex(indices);


const object = new THREE.Group();
scene.add(object);


// Set up clip plane rendering
const planeObjects = [];
const planeGeom = new THREE.PlaneGeometry(4, 4);

// for (let i = 0; i < 3; i ++) {
//     const poGroup = new THREE.Group();
//     const plane = planes[ i ];
//     const stencilGroup = createPlaneStencilGroup( geometry, plane, i + 1 );

//     // plane is clipped by the other clipping planes
//     const planeMat = new THREE.MeshStandardMaterial( {
//         color: 0xE91E63,
//         metalness: 0.1,
//         roughness: 0.75,
//         clippingPlanes: planes.filter( p => p !== plane ),
//         stencilWrite: true,
//         stencilRef: 0,
//         stencilFunc: THREE.NotEqualStencilFunc,
//         stencilFail: THREE.ReplaceStencilOp,
//         stencilZFail: THREE.ReplaceStencilOp,
//         stencilZPass: THREE.ReplaceStencilOp,
//     });
//     const po = new THREE.Mesh( planeGeom, planeMat );
//     po.onAfterRender = function ( renderer ) {
//         renderer.clearStencil();
//     };

//     po.renderOrder = i + 1.1;

//     // object.add(stencilGroup);
//     // poGroup.add(po);
//     // planeObjects.push(po);
//     // scene.add(poGroup);
// }

const material = new THREE.MeshStandardMaterial( {
    color: 0xFFC107,
    metalness: 0.1,
    roughness: 0.75,
    clippingPlanes: planes,
    clipShadows: true,
    shadowSide: THREE.DoubleSide,
});

// add the color
const clippedColorFront = new THREE.Mesh(geometry, material);
clippedColorFront.castShadow = true;
clippedColorFront.renderOrder = 6;
object.add(clippedColorFront);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0xa0adaf, shininess: 150 })
);

const localPlane = new THREE.PlaneHelper(planes[0], 2, 0xffffff)

ground.rotation.x = - Math.PI / 2;
ground.position.y = - 1;
ground.receiveShadow = true;
scene.add(ground);

// Renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );

renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x263238);
window.addEventListener('resize', onWindowResize);
document.body.appendChild(renderer.domElement);

renderer.localClippingEnabled = true;

camera.position.z = 5;

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 20;
controls.update();

function createPlaneStencilGroup(geometry, plane, renderOrder) {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshBasicMaterial();

    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [plane];
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0 = new THREE.Mesh(geometry, mat0);
    mesh0.renderOrder = renderOrder;
    group.add( mesh0 );

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(geometry, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
}

// render()

const params = {
    animate: true,
    planeX: {
        constant: 0,
        negated: false,
        displayHelper: false
    },
    planeY: {

        constant: 0,
        negated: false,
        displayHelper: false
    },
    planeZ: {

        constant: 0,
        negated: false,
        displayHelper: false
    }
};

function animate() {

    clock = new THREE.Clock();

    const delta = clock.getDelta();

    requestAnimationFrame( animate );

    if (params.animate) {

        object.rotation.x += delta * 0.5;
        object.rotation.y += delta * 0.2;

    }

    for ( let i = 0; i < planeObjects.length; i ++ ) {
        const plane = planes[ i ];
        const po = planeObjects[ i ];
        // plane.coplanarPoint( po.position );
        po.lookAt(
            po.position.x - plane.normal.x,
            po.position.y - plane.normal.y,
            po.position.z - plane.normal.z,
        );

    }

    renderer.render( scene, camera );
}

function onWindowResize() {
    console.log('onWindowResize')
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

animate()