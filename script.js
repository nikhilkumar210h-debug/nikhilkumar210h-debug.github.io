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


/* Cinematic particle-based ML scene — progressive enhancement */
(async function initMLScene(){
  const canvas = document.getElementById("ml-scene");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha:true,
      antialias:true,
      powerPreference:"high-performance"
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
    renderer.setClearColor(0x000000, 0);

    const root = new THREE.Group();
    root.rotation.z = -0.08;
    scene.add(root);

    // Dense particle sphere: this is the main visual language of the reference,
    // reinterpreted as a machine-learning "model space".
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorA = new THREE.Color(0x7d6cff);
    const colorB = new THREE.Color(0xb9c7ff);
    const colorC = new THREE.Color(0x61e2d5);

    for(let i=0;i<count;i++){
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2*v - 1);
      const shell = Math.pow(Math.random(), .42);
      const wobble = (Math.random()-.5) * .22;
      const r = 1.48 + shell * .72 + wobble;

      positions[i*3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i*3+1] = Math.cos(phi) * r * .94;
      positions[i*3+2] = Math.sin(phi) * Math.sin(theta) * r;

      const c = Math.random() < .14 ? colorC : (Math.random() < .52 ? colorA : colorB);
      colors[i*3] = c.r;
      colors[i*3+1] = c.g;
      colors[i*3+2] = c.b;
    }

    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute("position", new THREE.BufferAttribute(positions,3));
    cloudGeo.setAttribute("color", new THREE.BufferAttribute(colors,3));

    const cloud = new THREE.Points(
      cloudGeo,
      new THREE.PointsMaterial({
        size:.035,
        vertexColors:true,
        transparent:true,
        opacity:.86,
        depthWrite:false,
        blending:THREE.AdditiveBlending,
        sizeAttenuation:true
      })
    );
    root.add(cloud);

    // Inner model signal.
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 28, 28),
      new THREE.MeshBasicMaterial({
        color:0x34218e,
        transparent:true,
        opacity:.14,
        depthWrite:false,
        blending:THREE.AdditiveBlending
      })
    );
    root.add(inner);

    // Three very thin orbital traces create motion/depth without turning the
    // hero into a UI widget.
    const orbitGroup = new THREE.Group();
    root.add(orbitGroup);
    const orbitMats = [
      new THREE.LineBasicMaterial({color:0x8b7cff,transparent:true,opacity:.28}),
      new THREE.LineBasicMaterial({color:0x61e2d5,transparent:true,opacity:.16}),
      new THREE.LineBasicMaterial({color:0x6c78ff,transparent:true,opacity:.20})
    ];

    [
      [2.45,1.15,.35],
      [2.72,.82,-.7],
      [2.95,.55,1.1]
    ].forEach(([rx,ry,rz],i)=>{
      const pts=[];
      for(let j=0;j<=180;j++){
        const a=(j/180)*Math.PI*2;
        pts.push(new THREE.Vector3(Math.cos(a)*rx,Math.sin(a)*ry,0));
      }
      const geo=new THREE.BufferGeometry().setFromPoints(pts);
      const line=new THREE.LineLoop(geo,orbitMats[i]);
      line.rotation.set(.9+i*.45,.35+i*.3,rz);
      orbitGroup.add(line);
    });

    // A few distant signal points prevent the object from feeling like a flat
    // isolated circle.
    const signalCount=170;
    const signalPos=new Float32Array(signalCount*3);
    for(let i=0;i<signalCount;i++){
      signalPos[i*3]=(Math.random()-.5)*7.4;
      signalPos[i*3+1]=(Math.random()-.5)*5.4;
      signalPos[i*3+2]=(Math.random()-.5)*3.6;
    }
    const signalGeo=new THREE.BufferGeometry();
    signalGeo.setAttribute("position",new THREE.BufferAttribute(signalPos,3));
    const signals=new THREE.Points(
      signalGeo,
      new THREE.PointsMaterial({
        color:0x6258dc,size:.018,transparent:true,opacity:.28,
        depthWrite:false,blending:THREE.AdditiveBlending
      })
    );
    scene.add(signals);

    const pointer={x:0,y:0};
    addEventListener("pointermove",e=>{
      pointer.x=(e.clientX/innerWidth-.5)*2;
      pointer.y=(e.clientY/innerHeight-.5)*2;
    },{passive:true});

    function resize(){
      const w=canvas.clientWidth||700;
      const h=canvas.clientHeight||650;
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener("resize",resize);

    let t=0;
    function animate(){
      t+=.0045;
      root.rotation.y=t*.34 + pointer.x*.12;
      root.rotation.x=Math.sin(t*.6)*.06 + pointer.y*.045;
      cloud.rotation.y=-t*.18;
      cloud.rotation.z=Math.sin(t*.35)*.03;
      inner.scale.setScalar(1 + Math.sin(t*1.7)*.025);
      orbitGroup.rotation.y=t*.12;
      orbitGroup.rotation.x=Math.sin(t*.5)*.035;
      signals.rotation.y=t*.018;
      signals.rotation.x=-t*.01;
      renderer.render(scene,camera);
      requestAnimationFrame(animate);
    }
    animate();
  } catch(e) {
    canvas.setAttribute("data-fallback","true");
  }
})();
