const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  button.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    faqItems.forEach((faq) => {
      faq.classList.remove('active');
    });

    if (!isActive) item.classList.add('active');
  });
});

const formSuccess = document.querySelector('.form-success');
const contactForm = document.getElementById('contactForm');
const serviceSelect = contactForm?.querySelector('[name="Typ služby"]');
const servicePanels = document.querySelectorAll('[data-service-fields]');
const serviceProgress = document.getElementById('serviceProgress');
const moneyInputs = document.querySelectorAll('[data-money-input]');

function formatMoneyValue(value, includeCurrency = true) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const formatted = Number(digits).toLocaleString('sk-SK');
  return includeCurrency ? `${formatted} €` : formatted;
}

moneyInputs.forEach((input) => {
  input.addEventListener('focus', () => {
    input.value = formatMoneyValue(input.value, false);
  });

  input.addEventListener('input', () => {
    input.value = formatMoneyValue(input.value, false);
  });

  input.addEventListener('blur', () => {
    input.value = formatMoneyValue(input.value);
  });
});

function updateServiceFields() {
  const selectedService = serviceSelect ? serviceSelect.value : '';

  servicePanels.forEach((panel) => {
    const isActive = panel.dataset.serviceFields === selectedService;
    panel.hidden = !isActive;

    panel.querySelectorAll('input, select, textarea').forEach((field) => {
      field.disabled = !isActive;
    });
  });

  if (serviceProgress) serviceProgress.hidden = !selectedService;
}

if (serviceSelect) {
  serviceSelect.addEventListener('change', updateServiceFields);
  updateServiceFields();
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    const formData = new FormData(contactForm);
    const name = (formData.get('Meno') || '').toString().trim();
    const consent = contactForm.querySelector('[name="GDPR súhlas"]');
    const honeypot = (formData.get('_honey') || '').toString().trim();

    if (honeypot) {
      event.preventDefault();
      return;
    }

    if (!consent || !consent.checked) {
      event.preventDefault();
      if (formSuccess) formSuccess.textContent = 'Pre odoslanie požiadavky potvrďte oboznámenie sa s informáciami o spracovaní osobných údajov.';
      consent?.focus();
      return;
    }

    if (formSuccess) {
      formSuccess.textContent = name
        ? `Ďakujeme, ${name}. Vaša požiadavka sa odosiela.`
        : 'Vaša požiadavka sa odosiela.';
    }
  });
}

const blogGrid = document.getElementById('blogGrid');
const blogToggleButton = document.getElementById('blogToggleButton');
const articleModal = document.getElementById('articleModal');
const articleBody = document.getElementById('articleBody');
const articleClose = document.getElementById('articleClose');
let blogPosts = [];

async function loadBlogPosts() {
  if (!blogGrid) return;

  try {
    const response = await fetch('blog-posts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Blog data returned ${response.status}`);

    const posts = await response.json();
    if (!Array.isArray(posts)) throw new Error('Blog data is invalid');

    blogPosts = posts;
    renderBlogPosts();
  } catch (error) {
    console.error('[blog] failed to load blog-posts.json', error);
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Dnes';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

let showAllPosts = false;

function renderBlogPosts() {
  if (!blogGrid) return;

  const posts = blogPosts;

  if (posts.length <= 6) {
    showAllPosts = false;
  }

  const visiblePosts = showAllPosts ? posts : posts.slice(0, 6);

  blogGrid.innerHTML = visiblePosts
    .map(
      (post) => `
        <article class="blog-card">
          <div class="blog-card-top">
            <span class="blog-tag">${post.category}</span>
            <h3>${post.title}</h3>
            <div class="blog-meta">${formatDate(post.createdAt)}</div>
            <p>${post.excerpt}</p>
          </div>
          <div class="blog-card-bottom">
            <span class="blog-meta">Prečítate si</span>
            <button type="button" class="read-more" data-post-id="${post.id}">Čítať viac</button>
          </div>
        </article>
      `
    )
    .join('');

  if (blogToggleButton) {
    const hasMorePosts = posts.length > 6;
    blogToggleButton.classList.toggle('hidden', !hasMorePosts);
    blogToggleButton.textContent = showAllPosts ? 'Zobraziť menej' : 'Zobraziť všetky články';
  }
}

function openArticleModal(postId) {
  const post = blogPosts.find((item) => item.id === postId);

  if (!post || !articleModal || !articleBody) return;

  articleBody.innerHTML = `
    <span class="article-category">${post.category}</span>
    <h2>${post.title}</h2>
    <div class="blog-meta">${formatDate(post.createdAt)}</div>
    <div class="article-content-body">
      ${post.content
        .split('\n')
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join('')}
    </div>
  `;

  articleModal.classList.remove('hidden');
}

function closeArticleModal() {
  if (articleModal) articleModal.classList.add('hidden');
}

if (articleClose) {
  articleClose.addEventListener('click', closeArticleModal);
}

if (articleModal) {
  articleModal.addEventListener('click', (event) => {
    if (event.target === articleModal) closeArticleModal();
  });
}

if (blogGrid) {
  blogGrid.addEventListener('click', (event) => {
    const target = event.target.closest('[data-post-id]');
    if (target) openArticleModal(target.dataset.postId);
  });
}

if (blogToggleButton) {
  blogToggleButton.addEventListener('click', () => {
    showAllPosts = !showAllPosts;
    renderBlogPosts();
  });
}

loadBlogPosts();

const loanAmount = document.getElementById('loanAmount');
const loanTerm = document.getElementById('loanTerm');
const interestRate = document.getElementById('interestRate');
const loanAmountValue = document.getElementById('loanAmountValue');
const loanTermValue = document.getElementById('loanTermValue');
const interestRateValue = document.getElementById('interestRateValue');
const monthlyPayment = document.getElementById('monthlyPayment');
const totalPayment = document.getElementById('totalPayment');

const investmentAmount = document.getElementById('investmentAmount');
const investmentYears = document.getElementById('investmentYears');
const investmentReturn = document.getElementById('investmentReturn');
const investmentAmountValue = document.getElementById('investmentAmountValue');
const investmentYearsValue = document.getElementById('investmentYearsValue');
const investmentReturnValue = document.getElementById('investmentReturnValue');
const investmentProfit = document.getElementById('investmentProfit');
const investmentTotal = document.getElementById('investmentTotal');

const insuranceSum = document.getElementById('insuranceSum');
const insuranceTerm = document.getElementById('insuranceTerm');
const insurancePremiumRate = document.getElementById('insurancePremiumRate');
const insuranceSumValue = document.getElementById('insuranceSumValue');
const insuranceTermValue = document.getElementById('insuranceTermValue');
const insurancePremiumRateValue = document.getElementById('insurancePremiumRateValue');
const insuranceMonthlyPremium = document.getElementById('insuranceMonthlyPremium');
const insuranceYearlyCost = document.getElementById('insuranceYearlyCost');

const calculatorTabs = document.querySelectorAll('.calculator-tab');
const calculatorVariants = document.querySelectorAll('.calculator-variant');

const formatCurrency = (value) =>
  new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);

function calculatePayment() {
  if (!loanAmount || !loanTerm || !interestRate) return;

  const principal = Number(loanAmount.value);
  const years = Number(loanTerm.value);
  const annualRate = Number(interestRate.value) / 100;

  const monthlyRate = annualRate / 12;
  const months = years * 12;

  loanAmountValue.textContent = formatCurrency(principal);
  loanTermValue.textContent = `${years} rokov`;
  interestRateValue.textContent = `${Number(interestRate.value).toFixed(1).replace('.', ',')} %`;

  if (monthlyRate === 0) {
    const payment = principal / months;
    monthlyPayment.textContent = formatCurrency(payment);
    totalPayment.textContent = formatCurrency(payment * months);
    return;
  }

  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  monthlyPayment.textContent = formatCurrency(payment);
  totalPayment.textContent = formatCurrency(payment * months);
}

function calculateInvestment() {
  if (!investmentAmount || !investmentYears || !investmentReturn) return;

  const principal = Number(investmentAmount.value);
  const years = Number(investmentYears.value);
  const annualRate = Number(investmentReturn.value) / 100;
  const futureValue = principal * Math.pow(1 + annualRate, years);
  const profit = futureValue - principal;

  investmentAmountValue.textContent = formatCurrency(principal);
  investmentYearsValue.textContent = `${years} rokov`;
  investmentReturnValue.textContent = `${Number(investmentReturn.value).toFixed(1).replace('.', ',')} %`;
  investmentProfit.textContent = formatCurrency(profit);
  investmentTotal.textContent = formatCurrency(futureValue);
}

function calculateInsurance() {
  if (!insuranceSum || !insuranceTerm || !insurancePremiumRate) return;

  const sum = Number(insuranceSum.value);
  const years = Number(insuranceTerm.value);
  const rate = Number(insurancePremiumRate.value) / 100;
  const monthlyPremium = (sum * rate) / 12;
  const yearlyCost = monthlyPremium * 12;

  insuranceSumValue.textContent = formatCurrency(sum);
  insuranceTermValue.textContent = `${years} rokov`;
  insurancePremiumRateValue.textContent = `${Number(insurancePremiumRate.value).toFixed(1).replace('.', ',')} %`;
  insuranceMonthlyPremium.textContent = formatCurrency(monthlyPremium);
  insuranceYearlyCost.textContent = formatCurrency(yearlyCost);
}

function switchCalculator(mode) {
  calculatorTabs.forEach((tab) => {
    const isActive = tab.dataset.calculator === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  calculatorVariants.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === mode);
  });
}

if (calculatorTabs.length) {
  calculatorTabs.forEach((tab) => {
    tab.addEventListener('click', () => switchCalculator(tab.dataset.calculator));
  });
}

if (loanAmount && loanTerm && interestRate) {
  [loanAmount, loanTerm, interestRate].forEach((input) => {
    input.addEventListener('input', calculatePayment);
  });

  calculatePayment();
}

if (investmentAmount && investmentYears && investmentReturn) {
  [investmentAmount, investmentYears, investmentReturn].forEach((input) => {
    input.addEventListener('input', calculateInvestment);
  });

  calculateInvestment();
}

if (insuranceSum && insuranceTerm && insurancePremiumRate) {
  [insuranceSum, insuranceTerm, insurancePremiumRate].forEach((input) => {
    input.addEventListener('input', calculateInsurance);
  });

  calculateInsurance();
}
