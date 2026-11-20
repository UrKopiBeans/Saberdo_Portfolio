// Full-screen menu toggle
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

function setMenu(open) {
    menuIcon.classList.toggle('open', open);
    navbar.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
    menuIcon.setAttribute('aria-expanded', open);
    menuIcon.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuIcon.addEventListener('click', () => setMenu(!navbar.classList.contains('active')));
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
});

// Light / dark mode switch (dark is the default; the choice is remembered)
const themeToggle = document.querySelector('#theme-toggle');

function applyTheme(theme) {
    const light = theme === 'light';
    if (light) {
        document.documentElement.dataset.theme = 'light';
    } else {
        delete document.documentElement.dataset.theme;
    }
    themeToggle.innerHTML = light ? "<i class='bx bx-moon'></i>" : "<i class='bx bx-sun'></i>";
    const label = light ? 'Switch to dark mode' : 'Switch to light mode';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
}

applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
});

// Highlight the current section in the menu and keep the header visible
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.navbar a');
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const top = window.scrollY;

    sections.forEach(sec => {
        const offset = sec.offsetTop - 150;
        const id = sec.getAttribute('id');
        if (top >= offset && top < offset + sec.offsetHeight) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
        }
    });

    header.classList.toggle('sticky', top > 50);
});

// Smooth scrolling for anchor links (also closes the menu)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        setMenu(false);
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Typed.js: animates the profession text in the hero
const roles = ['Graphic Designer', 'Front-End Developer', 'Visual Artist'];

// Keep the headline at the height of its longest version, so it (and the photo
// beside it on mobile) doesn't jump while the words are typed and deleted.
const heroTitle = document.querySelector('.home-content h1');

function lockHeroTitleHeight() {
    heroTitle.style.minHeight = '';
    let tallest = 0;
    roles.forEach(role => {
        const clone = heroTitle.cloneNode(true);
        clone.querySelectorAll('.typed-cursor').forEach(c => c.remove());
        clone.querySelector('.multiple-text').textContent = role;
        clone.style.cssText = `position:absolute;visibility:hidden;width:${heroTitle.offsetWidth}px;min-height:0;`;
        heroTitle.parentNode.appendChild(clone);
        tallest = Math.max(tallest, clone.offsetHeight);
        clone.remove();
    });
    heroTitle.style.minHeight = tallest + 'px';
}

lockHeroTitleHeight();
window.addEventListener('resize', lockHeroTitleHeight);
if (document.fonts) document.fonts.ready.then(lockHeroTitleHeight);

const typed = new Typed('.multiple-text', {
    strings: roles,
    typeSpeed: 100,
    backSpeed: 90,
    backDelay: 1000,
    loop: true
});

// Scroll Reveal: soft fade-up animations
// Same settings as the previous portfolio: big 80px slides that replay every time a section scrolls into view
const sr = ScrollReveal({
    reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});

sr.reveal('.home-content, .heading', { origin: 'top' });
sr.reveal('.home-img, .portfolio-container, .contact form', { origin: 'bottom' });
sr.reveal('.about-content, .contact-text', { origin: 'left' });
sr.reveal('.about-tools, .testimonial-box', { origin: 'right' });

// Latest Projects: the row of cards follows the mouse sideways
// (like Matteo Fabbiani's "Work - case studies"). Cards stay level; hovering one lifts it (CSS).
(function () {
    const strip = document.querySelector('.portfolio-container');
    const track = document.querySelector('.work-track');
    const desktop = window.matchMedia('(hover: hover) and (min-width: 861px)');
    const SMOOTHING = 0.08; // lower = slower, smoother follow

    let target = 0;   // 0 = start of the row (your websites), 1 = end of the row
    let current = 0;
    let range = 0;    // how far (px) the row can slide
    let running = false;

    function measure() {
        range = Math.max(0, track.scrollWidth - strip.clientWidth);
    }

    function render() {
        current += (target - current) * SMOOTHING;
        track.style.transform = `translate3d(${-current * range}px, 0, 0)`;

        if (Math.abs(target - current) > 0.0005) {
            requestAnimationFrame(render);
        } else {
            running = false;
        }
    }

    function start() {
        if (!running) {
            running = true;
            requestAnimationFrame(render);
        }
    }

    strip.addEventListener('mousemove', e => {
        if (!desktop.matches) return;
        const rect = strip.getBoundingClientRect();
        // Ignore the outer 10% on each side so the ends are easy to reach
        const ratio = (e.clientX - rect.left) / rect.width;
        target = Math.min(1, Math.max(0, (ratio - 0.1) / 0.8));
        start();
    });

    function reset() {
        measure();
        if (!desktop.matches) {
            track.style.transform = '';
        } else {
            start();
        }
    }

    window.addEventListener('resize', reset);
    window.addEventListener('load', reset);
    reset();
})();

// Mobile / narrow screens: swap a project to its second picture when it scrolls (or is swiped)
// into view, or when it's touched. It swaps back when the card leaves the screen.
(function () {
    const small = window.matchMedia('(hover: none), (max-width: 860px)');
    const cards = document.querySelectorAll('.portfolio-box.has-hover-img');
    if (!cards.length || !('IntersectionObserver' in window)) return;

    const timers = new WeakMap();

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const card = entry.target;
            clearTimeout(timers.get(card));
            if (!small.matches) {
                card.classList.remove('show-alt');
                return;
            }
            if (entry.intersectionRatio >= 0.75) {
                // Short pause so visitors see the first picture before it changes
                timers.set(card, setTimeout(() => card.classList.add('show-alt'), 300));
            } else {
                card.classList.remove('show-alt');
            }
        });
    }, { threshold: [0, 0.75] });

    cards.forEach(card => {
        observer.observe(card);
        card.addEventListener('touchstart', () => {
            if (small.matches) card.classList.add('show-alt');
        }, { passive: true });
    });
})();

// Keep name fields free of digits and other unsupported characters, including pasted text.
const form = document.forms['contact'];
const nameFields = form.querySelectorAll('input[name="Surname"], input[name="First Name"]');
nameFields.forEach(field => {
    field.addEventListener('input', () => {
        field.value = field.value.replace(/[^\p{L}\p{M}' -]/gu, '');
    });
});

// Form submission handling: Web3Forms emails each message straight to your inbox (nothing is stored).
// Get your free access key at https://web3forms.com (enter your email, the key is emailed to you)
// and paste it below.
const WEB3FORMS_ACCESS_KEY = 'eccaac7d-8872-4076-b536-b710a10b67dd';
const msg = document.getElementById("msg");
const submitBtn = form.querySelector('button[type="submit"]');

function showMsg(text) {
    msg.textContent = text;
    setTimeout(() => { msg.textContent = ""; }, 6000);
}

form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    // Tidy names: "JOHN VINCENT" / "john vincent" -> "John Vincent"
    const titleCase = s => s.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());
    const firstName = titleCase(form['First Name'].value.trim());
    const surname = titleCase(form['Surname'].value.trim());
    const fullName = `${firstName} ${surname}`;
    const email = form['Email Address'].value.trim();
    const sentAt = new Date().toLocaleString('en-PH', {
        timeZone: 'Asia/Manila', dateStyle: 'long', timeStyle: 'short'
    });

    // The fields below appear in this order in the email you receive
    const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `📩 New message from ${fullName} — via your portfolio`,
        from_name: "John Vincent's Portfolio",
        replyto: email, // hitting "Reply" in your inbox answers the visitor directly
        botcheck: form['botcheck'].checked,
        'From': fullName,
        'Email': email,
        'Message': form['Your Message'].value.trim(),
        'Sent': `${sentAt} (Philippine time)`,
        'How to reply': `Just hit "Reply" — it goes straight to ${firstName} at ${email}.`
    };

    submitBtn.disabled = true;

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(result => {
            if (!result.success) throw new Error(result.message || 'Unknown error');
            showMsg("Message sent successfully! I'll get back to you soon.");
            form.reset();
        })
        .catch(error => {
            console.error('Error!', error.message);
            showMsg("Sorry, your message couldn't be sent. Please email me directly at jpsaberdo@ccc.edu.ph.");
        })
        .finally(() => { submitBtn.disabled = false; });
});

// Contact form validation
function validateForm() {
    const surname = form["Surname"].value.trim();
    const firstName = form["First Name"].value.trim();
    const email = form["Email Address"].value.trim();
    const message = form["Your Message"].value.trim();

    if (surname === "" || firstName === "" || email === "" || message === "") {
        alert("All fields must be filled out");
        return false;
    }

    const nameRegex = /^[\p{L}\p{M}' -]+$/u;
    if (!nameRegex.test(surname) || !nameRegex.test(firstName)) {
        alert("Please use letters only for your surname and first name");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return false;
    }

    return true;
}
