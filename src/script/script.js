import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import starsTexture from "../img/8k_stars.jpg";
import sunTexture from "../img/sun.jpg";
import mercuryTexture from "../img/8k_mercury.jpg";
import venusTexture from "../img/venus.jpg";
import earthTexture from "../img/earth.jpg";
import marsTexture from "../img/mars.jpg";
import jupiterTexture from "../img/jupiter.jpg";
import saturnTexture from "../img/saturn.jpg";
import saturnRingTexture from "../img/saturn ring.png";
import uranusTexture from "../img/uranus.jpg";
import uranusRingTexture from "../img/uranus ring.png";
import neptuneTexture from "../img/neptune.jpg";
import plutoTexture from "../img/pluto.jpg";

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById("mainCanvas"),
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false;

document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 1.2;
bloomPass.radius = 0;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;

bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(-90, 140, 140);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333, 1.1);
scene.add(ambientLight);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
]);

const textureLoader = new THREE.TextureLoader();

const sunGeo = new THREE.SphereGeometry(16, 100, 100);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunTexture),
});

const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

function createPlanete(size, texture, position, ring, orbitalRingSize = 0.5) {
  const geo = new THREE.SphereGeometry(size, 100, 100);
  const mat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  const orbitGeo = new THREE.RingGeometry(
    position,
    position + orbitalRingSize,
    100
  );
  const orbitMat = new THREE.MeshBasicMaterial({
    colot: 0xffffff,
    side: THREE.DoubleSide,
  });
  const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);

  scene.add(orbitMesh);
  orbitMesh.rotation.x = -0.5 * Math.PI;
  orbitMesh.add(mesh);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      1000
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.x = position;
    orbitMesh.add(ringMesh);
  }

  mesh.position.x = position;
  return { mesh, orbitMesh };
}

const mercury = createPlanete(3.2, mercuryTexture, 28, false);
const venus = createPlanete(5.8, venusTexture, 44, false);
const earth = createPlanete(6, earthTexture, 62, false);

const mars = createPlanete(4, marsTexture, 78, false);
const jupiter = createPlanete(12, jupiterTexture, 100, false);
const saturn = createPlanete(10, saturnTexture, 138, {
  innerRadius: 10,
  outerRadius: 20,
  texture: saturnRingTexture,
});
const uranus = createPlanete(7, uranusTexture, 176, {
  innerRadius: 7,
  outerRadius: 12,
  texture: uranusRingTexture,
});

const neptune = createPlanete(7, neptuneTexture, 200, false);
const pluto = createPlanete(2.8, plutoTexture, 216, false);

const pointLight = new THREE.PointLight(0xffffff, 2500, 300);
scene.add(pointLight);

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function setAllTo0(){
    document.getElementById("small_info_sun").style.display = "none";
    document.getElementById("small_info_mercury").style.display = "none";
    document.getElementById("small_info_venus").style.display = "none";
    document.getElementById("small_info_earth").style.display = "none";
    document.getElementById("small_info_mars").style.display = "none";
    document.getElementById("small_info_saturn").style.display = "none";
    document.getElementById("small_info_uranus").style.display = "none";
    document.getElementById("small_info_neptune").style.display = "none";
    document.getElementById("small_info_pluto").style.display = "none";
}

function onDocumentMouseDown(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects([
    sun,
    mercury.mesh,
    venus.mesh,
    earth.mesh,
    mars.mesh,
    jupiter.mesh,
    saturn.mesh,
    uranus.mesh,
    neptune.mesh,
    pluto.mesh,
  ]);

  if (intersects.length > 0) {
    if (intersects[0].object.material.map.source.data.src.includes("sun")) {
      document.getElementById("more_info_sun").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_sun").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("mercury")) {
      document.getElementById("more_info_mercury").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_mercury").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("venus")) {
      document.getElementById("more_info_venus").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_venus").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("earth")) {
      document.getElementById("more_info_earth").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_earth").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("mars")) {
      document.getElementById("more_info_mars").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_mars").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("jupiter")) {
      document.getElementById("more_info_jupiter").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_jupiter").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("saturn")) {
      document.getElementById("more_info_saturn").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_saturn").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("uranus")) {
      document.getElementById("more_info_uranus").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_uranus").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("neptune")) {
      document.getElementById("more_info_neptune").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_neptune").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("pluto")) {
      document.getElementById("more_info_pluto").style.display = "block";
      setAllTo0()
    } else {
      document.getElementById("more_info_pluto").style.display = "none";
    }
  } else {
    document.getElementById("more_info_sun").style.display = "none";
    document.getElementById("more_info_mercury").style.display = "none";
    document.getElementById("more_info_venus").style.display = "none";
    document.getElementById("more_info_earth").style.display = "none";
    document.getElementById("more_info_mars").style.display = "none";
    document.getElementById("more_info_saturn").style.display = "none";
    document.getElementById("more_info_uranus").style.display = "none";
    document.getElementById("more_info_neptune").style.display = "none";
    document.getElementById("more_info_pluto").style.display = "none";
  }
}

// Using the same logic as above, determine if we are currently mousing over a three.js object,
// and adjust the animation to provide visual feedback accordingly
function onDocumentMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects([
    sun,
    mercury.mesh,
    venus.mesh,
    earth.mesh,
    mars.mesh,
    jupiter.mesh,
    saturn.mesh,
    uranus.mesh,
    neptune.mesh,
    pluto.mesh,
  ]);
  var canvas = document.body.getElementsByTagName("canvas")[0];

  if (intersects.length > 0) {
    if (intersects[0].object.material.map.source.data.src.includes("sun")) {
      document.getElementById("small_info_sun").style.display = "block";
    } else {
      document.getElementById("small_info_sun").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("mercury")) {
      document.getElementById("small_info_mercury").style.display = "block";
    } else {
      document.getElementById("small_info_mercury").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("venus")) {
      document.getElementById("small_info_venus").style.display = "block";
    } else {
      document.getElementById("small_info_venus").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("earth")) {
      document.getElementById("small_info_earth").style.display = "block";
    } else {
      document.getElementById("small_info_earth").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("mars")) {
      document.getElementById("small_info_mars").style.display = "block";
    } else {
      document.getElementById("small_info_mars").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("jupiter")) {
      document.getElementById("small_info_jupiter").style.display = "block";
    } else {
      document.getElementById("small_info_jupiter").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("saturn")) {
      document.getElementById("small_info_saturn").style.display = "block";
    } else {
      document.getElementById("small_info_saturn").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("uranus")) {
      document.getElementById("small_info_uranus").style.display = "block";
    } else {
      document.getElementById("small_info_uranus").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("neptune")) {
      document.getElementById("small_info_neptune").style.display = "block";
    } else {
      document.getElementById("small_info_neptune").style.display = "none";
    }
    if (intersects[0].object.material.map.source.data.src.includes("pluto")) {
      document.getElementById("small_info_pluto").style.display = "block";
    } else {
      document.getElementById("small_info_pluto").style.display = "none";
    }
  } else {
    setAllTo0()
  }
}

document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("mousemove", onDocumentMouseMove, false);
function animate() {
  //Self-rotation
  sun.rotateY(0.004);
  mercury.mesh.rotateY(0.004);
  venus.mesh.rotateY(0.002);
  earth.mesh.rotateY(0.02);
  mars.mesh.rotateY(0.018);
  jupiter.mesh.rotateY(0.04);
  saturn.mesh.rotateY(0.038);
  uranus.mesh.rotateY(0.03);
  neptune.mesh.rotateY(0.032);
  pluto.mesh.rotateY(0.008);

  //Around-sun-rotation
  mercury.orbitMesh.rotateZ(0.02);
  venus.orbitMesh.rotateZ(0.0075);
  earth.orbitMesh.rotateZ(0.005);
  mars.orbitMesh.rotateZ(0.004);
  jupiter.orbitMesh.rotateZ(0.001);
  saturn.orbitMesh.rotateZ(0.00045);
  uranus.orbitMesh.rotateZ(0.0002);
  neptune.orbitMesh.rotateZ(0.00005);
  pluto.orbitMesh.rotateZ(0.000035);
  renderer.render(scene, camera);
  bloomComposer.render();
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
