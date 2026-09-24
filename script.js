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
      if (formSuccess) formSuccess.textContent = 'Pre odoslanie požiadavky potvrďte súhlas so spracovaním osobných údajov.';
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

const ADMIN_PASSWORD = 'FinancnyAdmin2026';
const BLOG_STORAGE_KEY = 'finance_blog_posts_v1';
const ADMIN_SESSION_KEY = 'finance_blog_admin_logged';
const BLOG_API_URL = '/api/posts';

const defaultBlogPosts = [
  {
    id: 'post-1',
    title: 'Ako si vybrať najvýhodnejšiu hypotéku',
    category: 'Hypotéky',
    excerpt: 'Na čo sa pozerať pri porovnávaní ponúk a ako znížiť riziko zbytočných nákladov.',
    content: 'Pri výbere hypotéky nie je dôležitý len úrok. Sledujte celkové náklady, fixáciu, podmienky predčasného splatenia, poistenie a flexibilitu zmluvy. Správne porovnanie ponúk vám môže ušetriť tisíce eur počas celej doby splácania. Vždy si overte, či je úrok skutočne konkurencieschopný po započítaní poplatkov a doplnkových služieb.',
    createdAt: '2026-07-18'
  },
  {
    id: 'post-2',
    title: '3 najčastejšie chyby pri refinancovaní úveru',
    category: 'Refinancovanie',
    excerpt: 'Mnoho ľudí mierne zvažuje refinancovanie bez zhodnotenia skutočných nákladov a výhod.',
    content: 'Refinancovanie je výhodné vtedy, keď zmenou úrokovej sadzby alebo podmienok zmluvy môžete výrazne znížiť mesačnú splátku alebo celkové náklady. Chyba je porovnávať len úrok bez poplatkov, výšky zostatku a rovnomernosti splácania. Pred rozhodnutím je vhodné zhodnotiť aj možnosť predčasného splatenia a podmienky nového úveru.',
    createdAt: '2026-07-25'
  },
  {
    id: 'post-3',
    title: 'Ako správne nastaviť poistenie majetku a osôb',
    category: 'Poistenie',
    excerpt: 'Dobrý poisťovací balíček nie je len o nízkej cene, ale hlavne o správnom pokrytí rizík.',
    content: 'Poistenie by malo pokrývať to, čo je pre vás skutočne dôležité. Pri majetku zohľadnite hodnotu predmetu, riziká, výšku deduktívnosti a výnimky z poistenia. Pri poistení osôb overte, ako sa poistenie mení v prípade zmeny zamestnania, životných okolností alebo potreby financovania.',
    createdAt: '2026-08-04'
  }
];

const blogGrid = document.getElementById('blogGrid');
const blogToggleButton = document.getElementById('blogToggleButton');
const adminOverlay = document.getElementById('adminOverlay');
const adminLoginBlock = document.getElementById('adminLoginBlock');
const adminPanel = document.getElementById('adminPanel');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminClose = document.getElementById('adminClose');
const adminToggle = document.getElementById('adminToggle');
const logoutAdmin = document.getElementById('logoutAdmin');
const blogForm = document.getElementById('blogForm');
const adminPostList = document.getElementById('adminPostList');
const articleModal = document.getElementById('articleModal');
const articleBody = document.getElementById('articleBody');
const articleClose = document.getElementById('articleClose');

const blogFormFields = {
  id: document.getElementById('postId'),
  title: document.getElementById('postTitle'),
  category: document.getElementById('postCategory'),
  excerpt: document.getElementById('postExcerpt'),
  content: document.getElementById('postContent')
};

function getPosts() {
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);

    if (!raw) {
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(defaultBlogPosts));
      return [...defaultBlogPosts];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultBlogPosts];
  } catch (error) {
    return [...defaultBlogPosts];
  }
}

function savePosts(posts) {
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
}

async function syncPostsToServer(posts) {
  try {
    const response = await fetch(BLOG_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(posts)
    });

    if (!response.ok) throw new Error(`Blog API returned ${response.status}`);
    return true;
  } catch (error) {
    console.warn('[blog] server sync unavailable; keeping local copy', error);
    return false;
  }
}

async function loadPostsFromServer() {
  if (!blogGrid) return;

  try {
    const localPosts = getPosts();
    const response = await fetch(BLOG_API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Blog API returned ${response.status}`);

    const serverPosts = await response.json();
    if (!Array.isArray(serverPosts)) throw new Error('Blog API returned an invalid payload');

    const serverPostIds = new Set(serverPosts.map((post) => post.id));
    const unsyncedLocalPosts = localPosts.filter((post) => !serverPostIds.has(post.id));
    const posts = [...unsyncedLocalPosts, ...serverPosts];

    savePosts(posts);
    if (unsyncedLocalPosts.length) await syncPostsToServer(posts);
    renderBlogPosts();

    if (adminPanel && !adminPanel.classList.contains('hidden')) {
      renderAdminPosts();
    }
  } catch (error) {
    try {
      const response = await fetch('blog-posts.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Static blog data returned ${response.status}`);

      const posts = await response.json();
      if (!Array.isArray(posts)) throw new Error('Static blog data is invalid');

      savePosts(posts);
      renderBlogPosts();
      if (adminPanel && !adminPanel.classList.contains('hidden')) {
        renderAdminPosts();
      }
    } catch (staticError) {
      console.warn('[blog] remote posts unavailable; using local copy', staticError);
    }
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

  const posts = getPosts();

  // Debug: log counts to help diagnose disappearing posts
  try {
    console.debug('[blog] total posts:', posts.length, 'showAllPosts:', showAllPosts);
  } catch (e) {
    // ignore in browsers without console
  }

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

function renderAdminPosts() {
  if (!adminPostList) return;

  const posts = getPosts();

  adminPostList.innerHTML = posts
    .map(
      (post) => `
        <div class="admin-post-item">
          <div>
            <strong>${post.title}</strong>
            <span>${post.category} · ${formatDate(post.createdAt)}</span>
          </div>
          <div class="admin-post-actions">
            <button type="button" data-edit-id="${post.id}">Upraviť</button>
            <button type="button" data-delete-id="${post.id}">Vymazať</button>
          </div>
        </div>
      `
    )
    .join('');
}

function openArticleModal(postId) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);

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

function resetBlogForm() {
  blogFormFields.id.value = '';
  blogFormFields.title.value = '';
  blogFormFields.category.value = '';
  blogFormFields.excerpt.value = '';
  blogFormFields.content.value = '';
}

function toggleAdminUI(isAdmin) {
  if (!adminOverlay || !adminLoginBlock || !adminPanel) return;

  adminLoginBlock.classList.toggle('hidden', isAdmin);
  adminPanel.classList.toggle('hidden', !isAdmin);
  adminOverlay.classList.toggle('hidden', false);

  if (isAdmin) {
    renderAdminPosts();
  }
}

function openAdmin() {
  if (!adminOverlay) return;
  adminOverlay.classList.remove('hidden');

  const isLogged = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  toggleAdminUI(isLogged);
}

function closeAdmin() {
  if (!adminOverlay) return;
  adminOverlay.classList.add('hidden');
}

async function savePost(event) {
  event.preventDefault();

  const title = blogFormFields.title.value.trim();
  const category = blogFormFields.category.value.trim();
  const excerpt = blogFormFields.excerpt.value.trim();
  const content = blogFormFields.content.value.trim();

  if (!title || !category || !excerpt || !content) return;

  const posts = getPosts();
  const id = blogFormFields.id.value || `post-${Date.now()}`;

  const updatedPost = {
    id,
    title,
    category,
    excerpt,
    content,
    createdAt: new Date().toISOString().slice(0, 10)
  };

  const existingIndex = posts.findIndex((post) => post.id === id);

  if (existingIndex >= 0) {
    posts[existingIndex] = { ...posts[existingIndex], ...updatedPost };
  } else {
    posts.unshift(updatedPost);
  }

  savePosts(posts);
  await syncPostsToServer(posts);
  renderBlogPosts();
  renderAdminPosts();
  resetBlogForm();

  try {
    console.debug('[blog] saved posts:', getPosts().length);
  } catch (e) {}
}

async function deletePost(postId) {
  const posts = getPosts().filter((post) => post.id !== postId);
  savePosts(posts);
  await syncPostsToServer(posts);
  renderBlogPosts();
  renderAdminPosts();

  try {
    console.debug('[blog] deleted posts, remaining:', getPosts().length);
  } catch (e) {}
}

function editPost(postId) {
  const post = getPosts().find((item) => item.id === postId);

  if (!post) return;

  blogFormFields.id.value = post.id;
  blogFormFields.title.value = post.title;
  blogFormFields.category.value = post.category;
  blogFormFields.excerpt.value = post.excerpt;
  blogFormFields.content.value = post.content;

  openAdmin();
}

if (adminToggle) {
  adminToggle.addEventListener('click', () => {
    const isLogged = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    if (isLogged) {
      toggleAdminUI(true);
      openAdmin();
    } else {
      openAdmin();
    }
  });
}

if (adminClose) {
  adminClose.addEventListener('click', closeAdmin);
}

if (articleClose) {
  articleClose.addEventListener('click', closeArticleModal);
}

if (articleModal) {
  articleModal.addEventListener('click', (event) => {
    if (event.target === articleModal) closeArticleModal();
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const passwordInput = document.getElementById('adminPassword');

    if (passwordInput && passwordInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      toggleAdminUI(true);
      passwordInput.value = '';
      return;
    }

    alert('Nesprávne heslo.');
  });
}

if (logoutAdmin) {
  logoutAdmin.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    closeAdmin();
  });
}

if (blogForm) {
  blogForm.addEventListener('submit', savePost);
}

if (document.getElementById('resetPostForm')) {
  document.getElementById('resetPostForm').addEventListener('click', resetBlogForm);
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

if (adminPostList) {
  adminPostList.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-id]');
    const deleteButton = event.target.closest('[data-delete-id]');

    if (editButton) {
      editPost(editButton.dataset.editId);
    }

    if (deleteButton) {
      deletePost(deleteButton.dataset.deleteId);
    }
  });
}

if (adminOverlay) {
  adminOverlay.addEventListener('click', (event) => {
    if (event.target === adminOverlay) closeAdmin();
  });
}

renderBlogPosts();
loadPostsFromServer();

const COOKIE_STORAGE_KEY = 'finance_cookie_consent_v1';
const cookieBanner = document.getElementById('cookieBanner');
const analyticsCookie = document.getElementById('analyticsCookie');
const marketingCookie = document.getElementById('marketingCookie');
const cookieAcceptAll = document.getElementById('cookieAcceptAll');
const cookieRejectAll = document.getElementById('cookieRejectAll');
const cookieSavePrefs = document.getElementById('cookieSavePrefs');

function getCookieConsent() {
  try {
    const rawValue = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    return null;
  }
}

function hideCookieBanner() {
  if (cookieBanner) cookieBanner.classList.add('hidden');
}

function showCookieBanner() {
  if (cookieBanner) cookieBanner.classList.remove('hidden');
}

function applyCookieControls(settings = { analytics: false, marketing: false }) {
  if (analyticsCookie) analyticsCookie.checked = Boolean(settings.analytics);
  if (marketingCookie) marketingCookie.checked = Boolean(settings.marketing);
}

function saveCookieConsent(settings) {
  const normalized = {
    analytics: Boolean(settings.analytics),
    marketing: Boolean(settings.marketing),
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    // Ignore localStorage issues in restrictive browsers.
  }

  document.body.dataset.cookieConsent = normalized.analytics || normalized.marketing ? 'custom' : 'essential';
  hideCookieBanner();
}

const existingConsent = getCookieConsent();

if (existingConsent) {
  applyCookieControls(existingConsent);
  hideCookieBanner();
} else {
  applyCookieControls();
  showCookieBanner();
}

if (cookieAcceptAll) {
  cookieAcceptAll.addEventListener('click', () => {
    saveCookieConsent({ analytics: true, marketing: true });
  });
}

if (cookieRejectAll) {
  cookieRejectAll.addEventListener('click', () => {
    saveCookieConsent({ analytics: false, marketing: false });
  });
}

if (cookieSavePrefs) {
  cookieSavePrefs.addEventListener('click', () => {
    saveCookieConsent({
      analytics: analyticsCookie ? analyticsCookie.checked : false,
      marketing: marketingCookie ? marketingCookie.checked : false
    });
  });
}

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
