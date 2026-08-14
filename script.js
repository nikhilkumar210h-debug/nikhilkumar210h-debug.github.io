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
  menuButton.addEventListener("click", () => navMenu.classList.toggle("mobile-open"));
}

document.querySelectorAll(".nav nav a").forEach(a => {
  a.addEventListener("click", () => {
    if (navMenu) navMenu.classList.remove("mobile-open");
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
