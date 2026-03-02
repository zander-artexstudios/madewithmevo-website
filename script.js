const form = document.getElementById('waitlist-form');
const msg = document.getElementById('form-msg');
const year = document.getElementById('year');

year.textContent = new Date().getFullYear();

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailInput = form.querySelector('input[name="email"]');
  const email = (emailInput?.value || '').trim();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    msg.textContent = 'Please enter a valid email address.';
    msg.style.color = '#ffb4b4';
    return;
  }

  const existing = JSON.parse(localStorage.getItem('mevo_waitlist') || '[]');
  if (!existing.includes(email.toLowerCase())) {
    existing.push(email.toLowerCase());
    localStorage.setItem('mevo_waitlist', JSON.stringify(existing));
  }

  msg.textContent = 'You’re in. We’ll be in touch soon ✨';
  msg.style.color = '#8df7ba';
  form.reset();
});
