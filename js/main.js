// ========== SUPABASE ==========
const SUPABASE_URL = 'https://mrcrbvkrposcrgpjlakt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sS3_ibkjFqFjgU4gsIElHw_A3o___mY';
if (window.supabaseClient) delete window.supabaseClient;
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// ========== КАРУСЕЛЬ ОТЗЫВОВ ==========
let currentReviewIndex = 0;
let reviewsData = [];

async function loadReviews() {
    try {
        const { data, error } = await window.supabaseClient.from('reviews').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        reviewsData = data && data.length ? data : getDemoReviews();
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
        { name: 'Мария Смирнова', rating: 5, text: 'Отличная школа! Преподаватели внимательные, атмосфера дружелюбная. За 3 месяца подтянула разговорный английский. Рекомендую!', created_at: '2024-02-20' },
        { name: 'Алина Козлова', rating: 5, text: 'Занимаюсь месяц, а уже чувствую прогресс. Очень нравится подход и атмосфера!', created_at: '2024-03-19' },
        { name: 'Павел Новиков', rating: 5, text: 'Наконец‑то начал говорить, а не просто учить правила. Спасибо Дмитрию!', created_at: '2024-03-17' }
    ];
}

// ========== EMAILJS: ОТПРАВКА ПОДТВЕРЖДЕНИЯ КЛИЕНТУ ==========
async function sendApprovalToClient(data) {
    try {
        if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');
        const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        const response = await emailjs.send('service_jxlzzl7', 'template_pk0z2cg', {
            name: data.name,
            phone: data.phone,
            email: data.email,
            format: data.format,
            subscription: data.subscription,
            level: data.level,
            date: date
        });
        console.log('✅ Письмо клиенту отправлено:', response);
        return true;
    } catch (e) {
        console.error('❌ Ошибка отправки письма клиенту:', e);
        return false;
    }
}

// ========== ОТПРАВКА ЗАЯВКИ ==========
const trialForm = document.getElementById('trialForm');
if (trialForm) {
    trialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            who: document.getElementById('who').value,
            format: document.getElementById('format').value,
            subscription: document.getElementById('subscription').value,
            level: document.getElementById('level').value,
            status: 'новая',
            created_at: new Date().toISOString()
        };
        if (!formData.name) { alert('Пожалуйста, введите имя'); return; }
        if (formData.phone.length < 10) { alert('Пожалуйста, введите корректный номер телефона'); return; }
        if (!formData.email) { alert('Пожалуйста, введите email'); return; }
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
            alert('Ошибка при отправке: ' + err.message);
            btn.textContent = original;
            btn.disabled = false;
        }
    });
}

// ========== ОТПРАВКА ОТЗЫВА ==========
window.submitReview = async function() {
    const name = document.getElementById('reviewName')?.value.trim();
    const email = document.getElementById('reviewEmail')?.value.trim();
    const rating = document.getElementById('reviewRating')?.value;
    const text = document.getElementById('reviewText')?.value.trim();
    if (!name) { alert('Пожалуйста, введите ваше имя'); return; }
    if (!rating || rating === '0') { alert('Пожалуйста, поставьте оценку'); return; }
    if (!text) { alert('Пожалуйста, напишите отзыв'); return; }
    const btn = document.querySelector('#reviewModal .btn-primary');
    const original = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Отправка...';
    btn.disabled = true;
    try {
        const { error } = await window.supabaseClient.from('reviews').insert([{
            name, email: email || null, rating: parseInt(rating), text, created_at: new Date().toISOString()
        }]);
        if (error) throw error;
        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        if (modal) modal.hide();
        document.getElementById('reviewForm').reset();
        document.getElementById('reviewRating').value = '0';
        document.querySelectorAll('.star-rating i').forEach(s => { s.classList.remove('bi-star-fill'); s.classList.add('bi-star'); });
        await loadReviews();
        alert('✅ Спасибо за отзыв!');
    } catch (err) {
        console.error(err);
        alert('❌ Ошибка: ' + err.message);
    } finally {
        btn.innerHTML = original;
        btn.disabled = false;
    }
};