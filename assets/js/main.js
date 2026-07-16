const container = document.querySelector(".moving-bg");

const imgSrc = "/FURCHAT_LOGO.png";

const rowHeight = 200; // vertical spacing between rows
const speed = 1;

const rows = Math.ceil(window.innerHeight / rowHeight) + 1;

let rowData = [];

for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.className = "row";

    row.style.top = `${i * rowHeight}px`;

    // alternating directions
    const direction = i % 2 === 0 ? 1 : -1;

    // create enough images to cover screen
    for (let x = 0; x < 20; x++) {
        const img = document.createElement("img");
        img.src = imgSrc;
        row.appendChild(img);
    }

    // duplicate the row for seamless looping
    for (let x = 0; x < 20; x++) {
        const img = document.createElement("img");
        img.src = imgSrc;
        row.appendChild(img);
    }

    container.appendChild(row);

    rowData.push({
        element: row,
        x: 0,
        direction: direction
    });
}


function animate() {
    rowData.forEach(row => {
        row.x += speed * row.direction;

        // width of one full set of images
        const halfWidth = row.element.scrollWidth / 2;

        if (row.direction === 1 && row.x >= 0) {
            row.x = -halfWidth;
        }

        if (row.direction === -1 && row.x <= -halfWidth) {
            row.x = 0;
        }

        row.element.style.transform =
            `translateX(${row.x}px)`;
    });

    requestAnimationFrame(animate);
}

animate();

// Firefox Warning:
  // Check if the browser is Firefox
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  if (isFirefox) {
    document.getElementById('firefoxMessage').style.display = 'block';
  }

// Topbar
const nav = document.querySelector(".topnav");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

nav.addEventListener("mousemove", (e) => {
    const rect = nav.getBoundingClientRect();

    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
});

nav.addEventListener("mouseleave", () => {
    targetX = -200;
    targetY = -200;
});


function animateGlow() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    nav.style.setProperty("--x", `${currentX}px`);
    nav.style.setProperty("--y", `${currentY}px`);

    requestAnimationFrame(animateGlow);
}

animateGlow();

// Home LOGO button:
function home() {
    const url = "/"; // Change to your target URL

    try {
        const isValidUrl =
            typeof url === "string" &&
            (/^https?:\/\//.test(url.trim()) || /^\/|^\.\.?\//.test(url.trim()));

        if (isValidUrl) {
            window.location.href = url;
        } else {
            console.error("Invalid URL:", url);
            alert("ERROR! Invalid URL. This error is on the developer side. Please contact the developer.");
        }
    } catch (err) {
        console.error("Navigation error:", err);
        alert("ERROR! Navigation failed. Reload and try again. If this problem persists, please contact the developer.");
    }
}