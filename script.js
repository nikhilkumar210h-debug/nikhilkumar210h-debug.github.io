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


/* Lightweight Three.js ML scene — progressive enhancement */
(async function initMLScene(){
  const canvas = document.getElementById("ml-scene");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    renderer.setClearColor(0x000000, 0);
    const root = new THREE.Group();
    scene.add(root);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 3),
      new THREE.MeshBasicMaterial({color:0x8175ff, wireframe:true, transparent:true, opacity:.34})
    );
    root.add(core);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 32, 32),
      new THREE.MeshBasicMaterial({color:0x20145f, transparent:true, opacity:.32})
    );
    root.add(glow);

    const count = 280;
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1), r=1.55+Math.random()*.75;
      pos[i*3]=Math.sin(b)*Math.cos(a)*r;
      pos[i*3+1]=Math.cos(b)*r;
      pos[i*3+2]=Math.sin(b)*Math.sin(a)*r;
      phase[i]=Math.random()*Math.PI*2;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
    const particles = new THREE.Points(pg,new THREE.PointsMaterial({color:0xb6c5ff,size:.035,transparent:true,opacity:.78,sizeAttenuation:true}));
    root.add(particles);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.95,2)),
      new THREE.LineBasicMaterial({color:0x5fe0d2,transparent:true,opacity:.17})
    );
    root.add(edges);

    const ringMat = new THREE.MeshBasicMaterial({color:0x786bff,transparent:true,opacity:.35});
    [2.45,2.8].forEach((r,i)=>{
      const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.008,6,160),ringMat);
      ring.rotation.set(i?0.9:1.15,i?.55:-.35,.2);
      root.add(ring);
    });

    const nodes=[];
    for(let i=0;i<9;i++){
      const n=new THREE.Mesh(new THREE.SphereGeometry(.055,12,12),new THREE.MeshBasicMaterial({color:i%3===0?0x69e7d8:0x8e7dff}));
      const a=i/9*Math.PI*2, r=2.2+(i%2)*.35;
      n.position.set(Math.cos(a)*r, Math.sin(a*1.7)*.7, Math.sin(a)*r*.72);
      root.add(n); nodes.push(n);
    }

    // Neural links turn the orb into a living model graph instead of a static shape.
    const linkPositions = [];
    nodes.forEach((n) => {
      linkPositions.push(0,0,0,n.position.x,n.position.y,n.position.z);
    });
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute("position",new THREE.Float32BufferAttribute(linkPositions,3));
    const links = new THREE.LineSegments(
      linkGeo,
      new THREE.LineBasicMaterial({color:0x7166ff,transparent:true,opacity:.12})
    );
    root.add(links);

    const outerField = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({color:0x7770ff,size:.018,transparent:true,opacity:.38})
    );
    const fieldCount = 150;
    const fieldPos = new Float32Array(fieldCount * 3);
    for(let i=0;i<fieldCount;i++){
      fieldPos[i*3]=(Math.random()-.5)*7;
      fieldPos[i*3+1]=(Math.random()-.5)*4.8;
      fieldPos[i*3+2]=(Math.random()-.5)*3.2;
    }
    outerField.geometry.setAttribute("position",new THREE.BufferAttribute(fieldPos,3));
    scene.add(outerField);

    const pointer={x:0,y:0};
    addEventListener("pointermove",(e)=>{
      pointer.x=(e.clientX/innerWidth-.5)*2;
      pointer.y=(e.clientY/innerHeight-.5)*2;
    },{passive:true});

    function resize(){
      const w=canvas.clientWidth||600,h=canvas.clientHeight||600;
      renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    }
    resize(); addEventListener("resize",resize);
    let t=0;
    function animate(){
      t+=.005;
      root.rotation.y=t*.48 + pointer.x*.11;
      root.rotation.x=Math.sin(t*.7)*.08 + pointer.y*.05;
      core.rotation.x=t*.32; core.rotation.z=t*.18;
      particles.rotation.y=-t*.22; edges.rotation.y=t*.18; links.rotation.y=-t*.12;
      outerField.rotation.y=t*.035; outerField.rotation.x=-t*.018;
      nodes.forEach((n,i)=>n.position.y += Math.sin(t*2+i)*.0008);
      renderer.render(scene,camera);
      requestAnimationFrame(animate);
    }
    animate();
  } catch(e) {
    canvas.setAttribute("data-fallback","true");
  }
})();
