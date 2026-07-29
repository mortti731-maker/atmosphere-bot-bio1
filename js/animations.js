// Анимации для био-страницы
document.addEventListener('DOMContentLoaded', function() {
    const bioCard = document.querySelector('.bio-card');
    const avatar = document.querySelector('.avatar');
    const bioText = document.querySelector('.bio-text');

    // Анимация появления карточки
    setTimeout(() => {
        bioCard.style.opacity = '1';
        bioCard.style.transform = 'translateY(0)';
    }, 100);

    // Анимация появления аватара
    if (avatar) {
        setTimeout(() => {
            avatar.style.opacity = '1';
            avatar.style.transform = 'scale(1)';
        }, 300);
    }

    // Анимация появления текста
    setTimeout(() => {
        bioText.style.opacity = '1';
        bioText.style.transform = 'translateY(0)';
    }, 500);

    // Добавляем эффект пульсации при наведении
    bioCard.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.3)';
    });

    bioCard.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 25px 45px rgba(0, 0, 0, 0.2)';
    });

    // Добавляем анимацию свечения для аватара
    if (avatar) {
        let shineAngle = 0;

        setInterval(() => {
            shineAngle = (shineAngle + 1) % 360;
            avatar.style.filter = `drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))`;
            avatar.style.transform = `scale(1) rotate(${shineAngle * 0.1}deg)`;
        }, 50);
    }

    // Добавляем частицы вокруг карточки
    createParticles();

    // Анимация фона
    animateBackground();
});

function createParticles() {
    const container = document.querySelector('.bio-container');
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.opacity = '0.7';
        particle.style.zIndex = '0';
        particle.style.pointerEvents = 'none';

        // Random position around the card
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.style.left = `calc(50% + ${x}px)`;
        particle.style.top = `calc(50% + ${y}px)`;

        container.appendChild(particle);

        // Animate particle
        animateParticle(particle, angle, distance);
    }
}

function animateParticle(particle, angle, distance) {
    const speed = 0.5 + Math.random() * 1.5;
    const amplitude = 20 + Math.random() * 30;
    let time = 0;

    function update() {
        time += 0.05;

        // Circular motion with some randomness
        const newX = Math.cos(angle + time * speed) * (distance + Math.sin(time * 0.7) * amplitude);
        const newY = Math.sin(angle + time * speed) * (distance + Math.cos(time * 0.5) * amplitude);

        particle.style.left = `calc(50% + ${newX}px)`;
        particle.style.top = `calc(50% + ${newY}px)`;
        particle.style.opacity = 0.5 + Math.sin(time * 2) * 0.3;

        requestAnimationFrame(update);
    }

    update();
}

function animateBackground() {
    const body = document.body;
    let hue = 0;

    setInterval(() => {
        hue = (hue + 1) % 360;
        body.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
    }, 100);
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    .bio-card {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .avatar {
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .bio-text {
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s;
    }
`;
document.head.appendChild(style);