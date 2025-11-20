// Toggle menu for mobile: Handles hamburger menu icon and navbar visibility
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Scroll sections active link
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        }
    });

    // Sticky navbar
    let header = document.querySelector('.header');
    header.classList.toggle('sticky', window.scrollY > 100);

    // Remove toggle icon and navbar when click navbar link (scroll)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

// Typed.js for multiple text animation: Animates the title text with multiple strings
const typed = new Typed('.multiple-text', {
    strings: ['Graphic Designer', 'Visual Artist'],
    typeSpeed: 100,
    backSpeed: 90,
    backDelay: 1000,
    loop: true
});

// Scroll Reveal Animation
ScrollReveal({
    reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.about-img, .about-content', { origin: 'left' });
ScrollReveal().reveal('.services-box', { origin: 'right' });

// Form submission handling: Sends form data to Google Sheets and shows success message
const scriptURL = 'https://script.google.com/macros/s/AKfycbzFPVGxI-75Ilkm2z_EMuI9ubPlp8-7dQmMzzdPiIunLPPzj3bcY1ohMdT_DfZ3zPwhTA/exec';
const form = document.forms['submit-to-google-sheet'];
const msg = document.getElementById("msg");

form.addEventListener('submit', e => {
    e.preventDefault();
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            msg.innerHTML = "Message sent successfully";
            setTimeout(function() {
                msg.innerHTML = "";
            }, 5000);
            form.reset();
        })
        .catch(error => console.error('Error!', error.message));
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Portfolio hover effect enhancement
const portfolioBoxes = document.querySelectorAll('.portfolio-box');

portfolioBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
        box.style.transform = 'translateY(-10px) scale(1.02)';
    });

    box.addEventListener('mouseleave', () => {
        box.style.transform = 'translateY(0) scale(1)';
    });
});

// Service box hover effect
const serviceBoxes = document.querySelectorAll('.services-box');

serviceBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
        box.style.transform = 'translateY(-10px)';
    });

    box.addEventListener('mouseleave', () => {
        box.style.transform = 'translateY(0)';
    });
});

// Back to top button functionality
const backToTopBtn = document.querySelector('.footer-iconTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'flex';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

// Preloader (if needed)
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }
});

// Lazy loading for images
const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Dark mode toggle (optional feature)
const themeToggle = document.querySelector('.theme-toggle');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Contact form validation
function validateForm() {
    const name = document.forms["submit-to-google-sheet"]["Name"].value;
    const email = document.forms["submit-to-google-sheet"]["Email Address"].value;
    const message = document.forms["submit-to-google-sheet"]["Your Message"].value;

    if (name == "" || email == "" || message == "") {
        alert("All fields must be filled out");
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return false;
    }

    return true;
}

// Add form validation to submit event
form.addEventListener('submit', (e) => {
    if (!validateForm()) {
        e.preventDefault();
    }
});
