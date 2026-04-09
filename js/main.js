// ========== SUPABASE ==========
const SUPABASE_URL = 'https://mrcrbvkrposcrgpjlakt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sS3_ibkjFqFjgU4gsIElHw_A3o___mY';
if (window.supabaseClient) delete window.supabaseClient;
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function showCenterMessage(message, isError = false, duration = 2000) {
    const msgDiv = document.getElementById('centerMessage');
    if (!msgDiv) return;
    msgDiv.textContent = message;
    msgDiv.classList.remove('error', 'show');
    if (isError) msgDiv.classList.add('error');
    msgDiv.style.display = 'block';
    setTimeout(() => msgDiv.classList.add('show'), 10);
    setTimeout(() => {
        msgDiv.classList.remove('show');
        setTimeout(() => msgDiv.style.display = 'none', 300);
    }, duration);
}

function setInvalid(element, message) {
    element.classList.add('is-invalid');
    let feedback = element.nextElementSibling;
    while (feedback && !feedback.classList.contains('invalid-feedback')) {
        feedback = feedback.nextElementSibling;
    }
    if (feedback) feedback.textContent = message;
}
function setValid(element) {
    element.classList.remove('is-invalid');
}

function validateName(name) {
    return name.trim().length > 0;
}
function validateEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}
function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'));
}
function validateReviewText(text) {
    return text.length >= 15 && text.length <= 150;
}
function validateRating(rating) {
    return rating && rating !== '0' && rating >= 1 && rating <= 5;
}

// ========== АНИМАЦИИ ПРИ СКРОЛЛЕ ==========
const fadeElements = document.querySelectorAll('.fade-in');
function checkFade() {
    fadeElements.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 150) el.classList.add('visible');
    });
}
window.addEventListener('scroll', checkFade);
window.addEventListener('load', checkFade);

// ========== ЗВЁЗДНЫЙ РЕЙТИНГ В МОДАЛЬНОМ ОКНЕ ==========
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star-rating i');
    const ratingInput = document.getElementById('reviewRating');
    if (stars.length && ratingInput) {
        stars.forEach(star => {
            star.addEventListener('mouseover', () => highlightStars(star.dataset.rating));
            star.addEventListener('mouseout', () => highlightStars(ratingInput.value));
            star.addEventListener('click', () => {
                ratingInput.value = star.dataset.rating;
                highlightStars(ratingInput.value);
                document.querySelector('.star-rating')?.classList.remove('is-invalid');
                document.getElementById('ratingFeedback')?.classList.remove('show');
            });
        });
    }
    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = star.dataset.rating;
            if (starRating <= rating) {
                star.classList.remove('bi-star');
                star.classList.add('bi-star-fill');
            } else {
                star.classList.remove('bi-star-fill');
                star.classList.add('bi-star');
            }
        });
    }
    loadReviews();
});

// ========== КАРУСЕЛЬ ОТЗЫВОВ (только 4-5 звёзд) ==========
let currentReviewIndex = 0;
let reviewsData = [];

async function loadReviews() {
    try {
        const { data, error } = await window.supabaseClient
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) throw error;
        const filtered = data?.filter(r => r.rating >= 4) || [];
        reviewsData = filtered.length ? filtered : getDemoReviews();
        renderReviews();
        updateButtons();
    } catch (e) {
        console.error(e);
        reviewsData = getDemoReviews();
        renderReviews();
        updateButtons();
    }
}

function renderReviews() {
    const track = document.getElementById('reviewsTrack');
    if (!track) return;
    track.innerHTML = reviewsData.map(r => {
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const date = new Date(r.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        return `<div class="review-card">
            <div class="stars">${stars}</div>
            <div class="review-text">"${r.text}"</div>
            <div class="review-author">— ${r.name}</div>
            <div class="review-date">${date}</div>
        </div>`;
    }).join('');
    currentReviewIndex = 0;
    updateTrackPosition();
}

function updateTrackPosition() {
    const track = document.getElementById('reviewsTrack');
    if (!track || !track.children.length) return;
    const cardWidth = track.children[0].offsetWidth;
    const gap = 20;
    track.style.transform = `translateX(-${(cardWidth + gap) * currentReviewIndex}px)`;
}

function updateButtons() {
    const prev = document.getElementById('reviewsPrevBtn');
    const next = document.getElementById('reviewsNextBtn');
    if (!prev || !next || !reviewsData.length) return;
    const visible = window.innerWidth < 768 ? 1 : 3;
    const max = Math.max(0, reviewsData.length - visible);
    prev.disabled = currentReviewIndex === 0;
    next.disabled = currentReviewIndex >= max;
}

document.addEventListener('DOMContentLoaded', () => {
    const prev = document.getElementById('reviewsPrevBtn');
    const next = document.getElementById('reviewsNextBtn');
    if (prev) prev.addEventListener('click', () => { if (currentReviewIndex > 0) { currentReviewIndex--; updateTrackPosition(); updateButtons(); } });
    if (next) next.addEventListener('click', () => { const visible = window.innerWidth < 768 ? 1 : 3; if (currentReviewIndex < reviewsData.length - visible) { currentReviewIndex++; updateTrackPosition(); updateButtons(); } });
    window.addEventListener('resize', () => { updateTrackPosition(); updateButtons(); });
});

function getDemoReviews() {
    return [
        { name: 'Елена Петрова', rating: 5, text: 'Занимаюсь у Анны полгода. С нуля дошла до уверенного А2! Очень довольна подходом и атмосферой на занятиях.', created_at: '2024-02-15' },
        { name: 'Дмитрий Соколов', rating: 5, text: 'Сын ходит в группу к Екатерине, бежит на занятия с удовольствием. Английский в школе подтянули, появилась уверенность.', created_at: '2024-02-10' },
        { name: 'Михаил Иванов', rating: 5, text: 'Брал 10 индивидуальных занятий перед командировкой — результат превзошел ожидания. Спасибо Дмитрию!', created_at: '2024-02-05' },
        { name: 'Мария Смирнова', rating: 5, text: 'Отличная школа! Преподаватели внимательные, атмосфера дружелюбная. За 3 месяца подтянула разговорный английский. Рекомендую!', created_at: '2024-02-20' }
    ];
}

// ========== EMAILJS ==========
async function sendApprovalToClient(data) {
    try {
        if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');
        const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        await emailjs.send('service_jxlzzl7', 'template_pk0z2cg', {
            name: data.name,
            phone: data.phone,
            email: data.email,
            format: data.format,
            subscription: data.subscription,
            level: data.level,
            date: date
        });
        return true;
    } catch (e) {
        console.error('EmailJS error:', e);
        return false;
    }
}

// ========== ОТПРАВКА ЗАЯВКИ ==========
const trialForm = document.getElementById('trialForm');
if (trialForm) {
    trialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');

        if (!validateName(nameInput.value)) {
            setInvalid(nameInput, 'Введите имя');
            isValid = false;
        } else setValid(nameInput);

        if (!validatePhone(phoneInput.value)) {
            setInvalid(phoneInput, 'Введите корректный российский номер (11 цифр)');
            isValid = false;
        } else setValid(phoneInput);

        if (!validateEmail(emailInput.value)) {
            setInvalid(emailInput, 'Введите корректный email');
            isValid = false;
        } else setValid(emailInput);

        if (!isValid) return;

        const formData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            who: document.getElementById('who').value,
            format: document.getElementById('format').value,
            subscription: document.getElementById('subscription').value,
            level: document.getElementById('level').value,
            status: 'новая',
            created_at: new Date().toISOString()
        };

        const btn = e.target.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Отправка...';
        btn.disabled = true;

        try {
            const { error } = await window.supabaseClient.from('applications').insert([formData]).select();
            if (error) throw error;
            await sendApprovalToClient(formData);
            trialForm.classList.add('d-none');
            const success = document.getElementById('formSuccess');
            if (success) {
                success.classList.remove('d-none');
                success.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Спасибо, ${formData.name}! Ваша заявка принята. Письмо с подтверждением отправлено на ${formData.email}`;
            }
        } catch (err) {
            console.error(err);
            showCenterMessage('❌ Ошибка при отправке заявки', true, 2000);
            btn.textContent = original;
            btn.disabled = false;
        }
    });
}

// ========== ОТПРАВКА ОТЗЫВА ==========
const submitReviewBtn = document.getElementById('submitReviewBtn');
if (submitReviewBtn) {
    submitReviewBtn.addEventListener('click', async () => {
        let isValid = true;

        const nameInput = document.getElementById('reviewName');
        const emailInput = document.getElementById('reviewEmail');
        const ratingInput = document.getElementById('reviewRating');
        const textInput = document.getElementById('reviewText');
        const starRatingDiv = document.querySelector('.star-rating');
        const ratingFeedback = document.getElementById('ratingFeedback');

        if (!validateName(nameInput.value)) {
            setInvalid(nameInput, 'Введите имя');
            isValid = false;
        } else setValid(nameInput);

        if (!validateEmail(emailInput.value)) {
            setInvalid(emailInput, 'Введите корректный email');
            isValid = false;
        } else setValid(emailInput);

        if (!validateRating(ratingInput.value)) {
            starRatingDiv.classList.add('is-invalid');
            if (ratingFeedback) ratingFeedback.style.display = 'block';
            isValid = false;
        } else {
            starRatingDiv.classList.remove('is-invalid');
            if (ratingFeedback) ratingFeedback.style.display = 'none';
        }

        if (!validateReviewText(textInput.value)) {
            setInvalid(textInput, 'Отзыв должен быть от 15 до 150 символов');
            isValid = false;
        } else setValid(textInput);

        if (!isValid) return;

        const btn = submitReviewBtn;
        const original = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Отправка...';
        btn.disabled = true;

        try {
            const { error } = await window.supabaseClient.from('reviews').insert([{
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                rating: parseInt(ratingInput.value),
                text: textInput.value.trim(),
                created_at: new Date().toISOString()
            }]);
            if (error) throw error;

            const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
            if (modal) modal.hide();

            // Очистка формы
            document.getElementById('reviewForm').reset();
            ratingInput.value = '0';
            document.querySelectorAll('.star-rating i').forEach(s => { s.classList.remove('bi-star-fill'); s.classList.add('bi-star'); });
            nameInput.classList.remove('is-invalid');
            emailInput.classList.remove('is-invalid');
            textInput.classList.remove('is-invalid');
            starRatingDiv.classList.remove('is-invalid');
            if (ratingFeedback) ratingFeedback.style.display = 'none';

            await loadReviews();
            showCenterMessage('Спасибо за отзыв!', false, 2000);
        } catch (err) {
            console.error(err);
            showCenterMessage('❌ Ошибка при отправке отзыва', true, 2000);
        } finally {
            btn.innerHTML = original;
            btn.disabled = false;
        }
    });
}
