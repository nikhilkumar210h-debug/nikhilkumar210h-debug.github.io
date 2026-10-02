const canvas = document.getElementById("space");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const navMenu = document.querySelector(".nav nav");
const nav = document.getElementById("nav");
const fill = document.getElementById("scrollFill");
const menuButton = document.getElementById("menu");

let W, H, stars = [], mouse = { x: -1000, y: -1000 };

function resize() {
  W = canvas.width = innerWidth * devicePixelRatio;
  H = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  W = innerWidth;
  H = innerHeight;
}

function makeStars() {
  stars = Array.from({ length: Math.min(240, Math.floor(innerWidth / 5)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    z: Math.random(),
    r: Math.random() * 1.5 + .2,
    s: Math.random() * .18 + .02
  }));
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const s of stars) {
    s.y += s.s;
    if (s.y > innerHeight) s.y = -2;

    const dx = s.x - mouse.x;
    const dy = s.y - mouse.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const a = .18 + s.z * .55;

    ctx.beginPath();
    ctx.fillStyle = `rgba(190,205,255,${a})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();

    if (d < 120) {
      ctx.strokeStyle = `rgba(100,105,255,${(1 - d / 120) * .08})`;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
  }

  requestAnimationFrame(draw);
}

addEventListener("resize", () => {
  resize();
  makeStars();
});

addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  if (cursorGlow) {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top = e.clientY + "px";
  }
});

resize();
makeStars();
draw();

addEventListener("scroll", () => {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;

  if (fill) fill.style.width = (y / max * 100) + "%";
  if (nav) nav.classList.toggle("scrolled", y > 30);
});

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => io.observe(el));

if (menuButton && navMenu) {
  menuButton.addEventListener("click", () => { const open = navMenu.classList.toggle("mobile-open"); menuButton.setAttribute("aria-expanded", String(open)); menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu"); });
}

document.querySelectorAll(".nav nav a").forEach(a => {
  a.addEventListener("click", () => {
    if (navMenu) navMenu.classList.remove("mobile-open"); menuButton?.setAttribute("aria-expanded","false");
  });
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.querySelectorAll(".project").forEach(card => {
  card.addEventListener("mousemove", e => {
    if (innerWidth < 800) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;

    card.style.transform = `perspective(900px) rotateX(${y * -2.5}deg) rotateY(${x * 2.5}deg) translateY(-5px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});


/* Cinematic 3D ML scene — model space */
(async function initMLScene(){
  const canvas = document.getElementById("ml-scene");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.55));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const world = new THREE.Group();
    world.rotation.z = -0.08;
    scene.add(world);

    const violet = new THREE.Color(0x806cff);
    const ice = new THREE.Color(0xc9d3ff);
    const cyan = new THREE.Color(0x63e2d5);
    const deep = new THREE.Color(0x34228f);

    const isMobile = window.innerWidth <= 600;
    const particleCount = isMobile ? 980 : 1750;
    const outerCount = isMobile ? 90 : 170;

    function makeModelCloud(count, radiusMin, radiusMax, size, opacity){
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for(let n = 0; n < count; n++){
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radiusMin + Math.pow(Math.random(), .52) * (radiusMax - radiusMin);
        const shell = Math.sin(phi);

        positions[n * 3] = Math.cos(theta) * shell * r;
        positions[n * 3 + 1] = Math.cos(phi) * r * .92;
        positions[n * 3 + 2] = Math.sin(theta) * shell * r;

        const c = Math.random() < .12 ? cyan : (Math.random() < .5 ? violet : ice);
        colors[n * 3] = c.r;
        colors[n * 3 + 1] = c.g;
        colors[n * 3 + 2] = c.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          size,
          vertexColors: true,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true
        })
      );
      world.add(points);
      return points;
    }

    const cloud = makeModelCloud(particleCount, 1.28, 2.02, isMobile ? .048 : .038, .86);
    const haloCloud = makeModelCloud(Math.floor(particleCount * .28), 1.72, 2.28, isMobile ? .028 : .021, .42);

    // A real geometric core sits inside the particle field.
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.08, 2),
      new THREE.MeshBasicMaterial({
        color: deep,
        wireframe: true,
        transparent: true,
        opacity: .25,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    world.add(core);

    const coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(.92, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x4b31c6,
        transparent: true,
        opacity: .075,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    world.add(coreGlow);

    // Orbital rings create readable depth instead of a flat decorative circle.
    const orbitGroup = new THREE.Group();
    world.add(orbitGroup);
    [
      [2.45, 1.03, .9, 0x8577ff, .32],
      [2.75, .82, -.55, 0x63e2d5, .17],
      [3.05, .62, 1.28, 0x6d78ff, .20]
    ].forEach(([rx, ry, rz, color, opacity], index) => {
      const points = [];
      for(let n = 0; n <= 180; n++){
        const a = (n / 180) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(a) * rx, Math.sin(a) * ry, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(
        geometry,
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })
      );
      line.rotation.set(.82 + index * .38, .3 + index * .25, rz);
      orbitGroup.add(line);
    });

    // Neural spokes: a restrained network radiating from the model core.
    const spokePositions = [];
    for(let n = 0; n < 34; n++){
      const theta = (n / 34) * Math.PI * 2 + Math.random() * .12;
      const y = (Math.random() - .5) * 1.7;
      const r = 1.1 + Math.random() * .82;
      spokePositions.push(
        0, 0, 0,
        Math.cos(theta) * r, y, Math.sin(theta) * r
      );
    }
    const spokeGeometry = new THREE.BufferGeometry();
    spokeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(spokePositions, 3));
    const spokes = new THREE.LineSegments(
      spokeGeometry,
      new THREE.LineBasicMaterial({
        color: 0x786aff,
        transparent: true,
        opacity: .12,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    world.add(spokes);

    // Small signal nodes orbit the model and pulse independently.
    const nodeGroup = new THREE.Group();
    world.add(nodeGroup);
    const nodeData = [];
    for(let n = 0; n < 9; n++){
      const angle = (n / 9) * Math.PI * 2;
      const radius = 1.82 + (n % 3) * .16;
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(n % 3 === 0 ? .045 : .028, 10, 10),
        new THREE.MeshBasicMaterial({
          color: n % 3 === 0 ? cyan : violet,
          transparent: true,
          opacity: .75,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })
      );
      node.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.7) * .75,
        Math.sin(angle) * radius
      );
      nodeGroup.add(node);
      nodeData.push({node, angle, radius, speed: .12 + (n % 3) * .035, phase: n * .8});
    }

    const signalPositions = new Float32Array(outerCount * 3);
    for(let n = 0; n < outerCount; n++){
      signalPositions[n * 3] = (Math.random() - .5) * 7.2;
      signalPositions[n * 3 + 1] = (Math.random() - .5) * 5.1;
      signalPositions[n * 3 + 2] = (Math.random() - .5) * 3.8;
    }
    const signalGeometry = new THREE.BufferGeometry();
    signalGeometry.setAttribute("position", new THREE.BufferAttribute(signalPositions, 3));
    const signals = new THREE.Points(
      signalGeometry,
      new THREE.PointsMaterial({
        color: 0x5f59cf,
        size: isMobile ? .026 : .019,
        transparent: true,
        opacity: .24,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(signals);

    const pointer = {x: 0, y: 0, tx: 0, ty: 0};
    addEventListener("pointermove", e => {
      pointer.tx = (e.clientX / innerWidth - .5) * 2;
      pointer.ty = (e.clientY / innerHeight - .5) * 2;
    }, {passive:true});

    function resize(){
      const w = canvas.clientWidth || 700;
      const h = canvas.clientHeight || 650;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener("resize", resize);

    let t = 0;
    function animate(){
      t += .0042;

      pointer.x += (pointer.tx - pointer.x) * .035;
      pointer.y += (pointer.ty - pointer.y) * .035;

      world.rotation.y = t * .28 + pointer.x * .13;
      world.rotation.x = Math.sin(t * .55) * .055 + pointer.y * .045;

      cloud.rotation.y = -t * .16;
      haloCloud.rotation.y = t * .21;
      haloCloud.rotation.x = Math.sin(t * .3) * .05;

      core.rotation.x = t * .17;
      core.rotation.y = -t * .23;
      core.scale.setScalar(1 + Math.sin(t * 1.65) * .028);
      coreGlow.scale.setScalar(1.04 + Math.sin(t * 1.65) * .045);

      orbitGroup.rotation.y = t * .13;
      orbitGroup.rotation.z = Math.sin(t * .42) * .035;
      spokes.rotation.y = -t * .11;

      nodeData.forEach((item, n) => {
        const a = item.angle + t * item.speed;
        item.node.position.x = Math.cos(a) * item.radius;
        item.node.position.z = Math.sin(a) * item.radius;
        item.node.position.y = Math.sin(a * 1.8 + item.phase) * .72;
        const pulse = 1 + Math.sin(t * 2.2 + item.phase) * .22;
        item.node.scale.setScalar(pulse);
      });

      signals.rotation.y = t * .016;
      signals.rotation.x = -t * .009;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  } catch(e) {
    canvas.setAttribute("data-fallback", "true");
  }
})();
