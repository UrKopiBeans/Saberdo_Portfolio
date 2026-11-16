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

// Highlight the current section in the menu, sticky header, back-to-top button
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.navbar a');
const header = document.querySelector('.header');
const backToTopBtn = document.querySelector('.footer-iconTop');

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
    backToTopBtn.style.display = top > 300 ? 'block' : 'none';
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
const typed = new Typed('.multiple-text', {
    strings: ['Graphic Designer', 'Front-End Developer', 'Visual Artist'],
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
sr.reveal('.home-img, .portfolio-box, .contact form', { origin: 'bottom' });
sr.reveal('.about-content, .contact-text', { origin: 'left' });
sr.reveal('.about-tools, .testimonial-box', { origin: 'right' });

// Portfolio hover lift (from the previous portfolio)
document.querySelectorAll('.portfolio-box').forEach(box => {
    box.style.transition = 'transform 0.5s ease';
    box.addEventListener('mouseenter', () => {
        box.style.transform = 'translateY(-10px) scale(1.02)';
    });
    box.addEventListener('mouseleave', () => {
        box.style.transform = 'translateY(0) scale(1)';
    });
});

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
const WEB3FORMS_ACCESS_KEY = 'PASTE-YOUR-ACCESS-KEY-HERE';
const msg = document.getElementById("msg");
const submitBtn = form.querySelector('button[type="submit"]');

function showMsg(text) {
    msg.textContent = text;
    setTimeout(() => { msg.textContent = ""; }, 6000);
}

form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    const firstName = form['First Name'].value.trim();
    const surname = form['Surname'].value.trim();
    const email = form['Email Address'].value.trim();

    const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New portfolio message from ${firstName} ${surname}`,
        from_name: 'Saberdo Portfolio',
        replyto: email, // hitting "Reply" in your inbox answers the visitor directly
        botcheck: form['botcheck'].checked,
        'First Name': firstName,
        'Surname': surname,
        'Email Address': email,
        'Message': form['Your Message'].value.trim()
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
