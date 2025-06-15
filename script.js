// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const isMobile = window.innerWidth <= 700;
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll Down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (!isMobile && currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll Up (только на десктопе)
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// --- Каталог и заказ (главная) ---
const catalogBtn = document.getElementById('catalog-btn');
const catalogModal = document.getElementById('catalog-modal');
const closeCatalog = document.getElementById('close-catalog');
const orderModal = document.getElementById('order-modal');
const closeOrder = document.getElementById('close-order');
const catalogOrderBtns = document.querySelectorAll('.catalog-order-btn');
const orderProductImg = document.getElementById('order-product-img');
const orderProductTitle = document.getElementById('order-product-title');
const orderOldPrice = document.getElementById('order-old-price');
const orderNewPrice = document.getElementById('order-new-price');
const orderForm = document.getElementById('order-form');
const orderSuccess = document.getElementById('order-success');
const mainOrderBtns = document.querySelectorAll('.main-order-btn');

if (orderModal && closeOrder) {
    closeOrder.addEventListener('click', () => {
        orderModal.classList.remove('show');
    });
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) orderModal.classList.remove('show');
    });
}
if (orderForm && orderSuccess) {
    // Удалён обработчик submit для orderForm, чтобы не мешать отправке на Formspree
}
if (catalogModal && closeCatalog) {
    closeCatalog.addEventListener('click', () => {
        catalogModal.classList.remove('show');
    });
}
if (catalogOrderBtns && orderModal) {
    catalogOrderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.catalog-item');
            if (!item) return;
            orderProductImg.src = item.getAttribute('data-img');
            orderProductTitle.textContent = item.getAttribute('data-title');
            orderOldPrice.textContent = item.getAttribute('data-old');
            orderNewPrice.textContent = item.getAttribute('data-new');
            orderForm.reset();
            orderForm.style.display = '';
            orderSuccess.style.display = 'none';
            orderModal.classList.add('show');
            if (catalogModal) catalogModal.classList.remove('show');
            // Переводим модальное окно заказа при каждом открытии (отложенно)
            setTimeout(() => {
              const lang = getUserLang();
              const dict = translations[lang];
              document.querySelectorAll('[data-i18n="order_agree"]').forEach(agreeLabel => {
                if (agreeLabel && dict && dict.order_agree) agreeLabel.textContent = dict.order_agree;
              });
            }, 0);
        });
    });
}
if (mainOrderBtns && orderModal) {
    mainOrderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            orderProductImg.src = btn.getAttribute('data-img');
            orderProductTitle.textContent = btn.getAttribute('data-title');
            orderOldPrice.textContent = btn.getAttribute('data-old');
            orderNewPrice.textContent = btn.getAttribute('data-new');
            orderForm.reset();
            orderForm.style.display = '';
            orderSuccess.style.display = 'none';
            orderModal.classList.add('show');
            // Переводим модальное окно заказа при каждом открытии (отложенно)
            setTimeout(() => {
              const lang = getUserLang();
              const dict = translations[lang];
              document.querySelectorAll('[data-i18n="order_agree"]').forEach(agreeLabel => {
                if (agreeLabel && dict && dict.order_agree) agreeLabel.textContent = dict.order_agree;
              });
            }, 0);
        });
    });
}

// --- Мультиязычность с выпадающим переключателем ---
const langNames = {
  en: 'English', nl: 'Nederlands', de: 'Deutsch', fr: 'Français', it: 'Italiano', es: 'Español', pt: 'Português', pl: 'Polski', ru: 'Русский', ar: 'العربية', tr: 'Türkçe', ma: 'Darija'
};
const langFlags = {
  en: '🇬🇧', nl: '🇳🇱', de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', es: '🇪🇸', pt: '🇵🇹', pl: '🇵🇱', ru: '🇷🇺', ar: '��🇪', tr: '🇹🇷', ma: '🇩🇯'
};
const supportedLangs = Object.keys(langNames);

// Предзагружаем все языки
const translations = {};

async function loadAllTranslations() {
  console.log('Loading all translations...');
  for (const lang of supportedLangs) {
    try {
      const response = await fetch('./lang/' + lang + '.json');
      console.log('Fetching ./lang/' + lang + '.json', response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      translations[lang] = json;
      console.log(`Loaded ${lang} translations:`, json);
    } catch (error) {
      console.error(`Error loading ${lang} translations:`, error);
    }
  }
  console.log('Final translations object:', translations);
}

function getUserLang() {
  const saved = localStorage.getItem('site_lang');
  if (saved && supportedLangs.includes(saved)) return saved;
  const nav = (navigator.language || navigator.userLanguage || 'en').slice(0,2).toLowerCase();
  if (supportedLangs.includes(nav)) return nav;
  return 'en';
}

function updateLangCurrent(lang) {
  const btn = document.getElementById('lang-current-btn');
  if (btn) {
    btn.innerHTML = `${langFlags[lang] || '🌐'} ${langNames[lang] || lang} ▼`;
  }
}

function setLang(lang) {
  if (!supportedLangs.includes(lang)) {
    console.error('Unsupported language:', lang);
    return;
  }
  const dict = translations[lang];
  if (!dict) {
    console.error(`No translations found for ${lang}`);
    return;
  }
  // Переводим обычные элементы
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (key === 'order_agree') {
        // Пропускаем, чтобы не дублировать перевод (он ниже)
      } else {
        el.innerHTML = dict[key];
      }
    }
  });
  // Переводим плейсхолдеры
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });
  updateLangCurrent(lang);
  localStorage.setItem('site_lang', lang);

  // --- Каталог: фильтры (иконки и тумблеры) ---
  const sidebar = document.querySelector('.sidebar-categories');
  if (sidebar) {
    // Сохраняем текущую активную категорию
    let currentActiveCat = document.querySelector('.cat-item.active')?.getAttribute('data-cat') || 'all';
    sidebar.innerHTML = `
      <li class="cat-item cat-item-all no-wrap" data-cat="all" data-i18n="cat_all"><i class="fas fa-th"></i> <span class="cat-label-text">${dict.cat_all || 'Все товары'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
      <li class="cat-item" data-cat="headphones"><i class="fas fa-headphones"></i> <span class="cat-label-text">${dict.cat_headphones || 'Наушники'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
      <li class="cat-item" data-cat="tv"><i class="fas fa-tv"></i> <span class="cat-label-text">${dict.cat_tv || 'Телевизор'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
      <li class="cat-item" data-cat="robotvacuum"><i class="fas fa-robot"></i> <span class="cat-label-text">${dict.cat_robotvacuum || 'Робот пылесос'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
      <li class="cat-item" data-cat="mouse"><i class="fas fa-computer-mouse"></i> <span class="cat-label-text">${dict.cat_mouse || 'Компьютерная мышка'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
      <li class="cat-item" data-cat="smartwatch"><i class="fas fa-watch"></i> <span class="cat-label-text">${dict.cat_smartwatch || 'Умные часы'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
      <li class="cat-item" data-cat="appliances"><i class="fas fa-blender"></i> <span class="cat-label-text">${dict.cat_appliances || 'Бытовая техника'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
      <li class="cat-item" data-cat="consoles"><i class="fas fa-gamepad"></i> <span class="cat-label-text">${dict.cat_consoles || 'Консоли'}</span> <span class="cat-switch"><span class="switch-slider"></span></span></li>
    `;
    // Навешиваем обработчики заново
    const sidebarCats = document.querySelectorAll('.cat-item');
    sidebarCats.forEach(cat => {
      cat.addEventListener('click', function() {
        sidebarCats.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        window.activeCat = this.getAttribute('data-cat');
        if (typeof renderCatalog === 'function') renderCatalog();
      });
      // Восстанавливаем активную категорию
      if (cat.getAttribute('data-cat') === currentActiveCat) {
        cat.classList.add('active');
        window.activeCat = currentActiveCat;
      }
    });
  }

  // --- Каталог: перевод динамики ---
  if (typeof translateCatalogDynamic === 'function') translateCatalogDynamic();

  // --- Перевод верхнего меню каталога (если есть data-i18n) ---
  document.querySelectorAll('.nav-links a[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.innerHTML = dict[key];
  });

  // --- Перевод модального окна заказа ---
  if (document.getElementById('order-modal')) {
    const modalTitle = document.querySelector('.order-modal-title');
    if (modalTitle && dict.order_title) modalTitle.textContent = dict.order_title;
    const inputs = document.querySelectorAll('#order-form input');
    if (inputs.length >= 4) {
      if (dict.order_fio) inputs[0].placeholder = dict.order_fio;
      if (dict.order_phone) inputs[1].placeholder = dict.order_phone;
      if (dict.order_address) inputs[2].placeholder = dict.order_address;
      if (dict.order_email) inputs[3].placeholder = dict.order_email;
    }
    document.querySelectorAll('[data-i18n="order_agree"]').forEach(agreeLabel => {
      if (agreeLabel && dict.order_agree) agreeLabel.textContent = dict.order_agree;
    });
    const submitBtn = document.getElementById('order-submit-btn');
    if (submitBtn && dict.order_submit) submitBtn.textContent = dict.order_submit;
  }
}

// --- Перевод динамических элементов каталога ---
function translateCatalogDynamic() {
  const lang = getUserLang();
  const dict = translations[lang];
  if (!dict) return;
  // Кнопки заказа
  document.querySelectorAll('.catalog-product-order-btn').forEach(btn => {
    if (dict.order_btn) btn.textContent = dict.order_btn;
  });
  // Сообщение о пустом поиске
  const empty = document.querySelector('.catalog-empty');
  if (empty && dict.catalog_empty) {
    const icon = empty.querySelector('i')?.outerHTML || '';
    empty.innerHTML = icon + dict.catalog_empty;
  }
  // Перевод модального окна заказа (на случай открытия после рендера)
  if (document.getElementById('order-modal')) {
    const modalTitle = document.querySelector('.order-modal-title');
    if (modalTitle && dict.order_title) modalTitle.textContent = dict.order_title;
    const inputs = document.querySelectorAll('#order-form input');
    if (inputs.length >= 4) {
      if (dict.order_fio) inputs[0].placeholder = dict.order_fio;
      if (dict.order_phone) inputs[1].placeholder = dict.order_phone;
      if (dict.order_address) inputs[2].placeholder = dict.order_address;
      if (dict.order_email) inputs[3].placeholder = dict.order_email;
    }
    document.querySelectorAll('[data-i18n="order_agree"]').forEach(agreeLabel => {
      if (agreeLabel && dict.order_agree) agreeLabel.textContent = dict.order_agree;
    });
    const submitBtn = document.getElementById('order-submit-btn');
    if (submitBtn && dict.order_submit) submitBtn.textContent = dict.order_submit;
  }
}

function attachLangSwitcherHandlers() {
  const currentBtn = document.getElementById('lang-current-btn');
  const list = document.getElementById('lang-list');
  if (!currentBtn || !list) return;
  currentBtn.onclick = null;
  document.onclick = null;
  list.querySelectorAll('button').forEach(btn => btn.onclick = null);
  currentBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    list.style.display = (list.style.display === 'block') ? 'none' : 'block';
  };
  list.querySelectorAll('button').forEach(btn => {
    btn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      const newLang = this.getAttribute('data-lang');
      setLang(newLang);
      list.style.display = 'none';
    };
  });
  document.onclick = function() {
    list.style.display = 'none';
  };
}

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    await loadAllTranslations();
    let lang = getUserLang();
    setLang(lang);
    document.body.style.visibility = 'visible';
    // Навешивать обработчики только если есть переключатель
    if (document.getElementById('lang-current-btn') && document.getElementById('lang-list')) {
      attachLangSwitcherHandlers();
    }

    // --- Обработчик кастомного тумблера согласия ---
    const orderSwitch = document.querySelector('.order-switch');
    const orderAgree = document.getElementById('order-agree');
    const orderSubmitBtn = document.getElementById('order-submit-btn');
    if (orderSwitch && orderAgree && orderSubmitBtn) {
      orderSwitch.onclick = function() {
        orderAgree.checked = !orderAgree.checked;
        orderSwitch.classList.toggle('active', orderAgree.checked);
        orderSubmitBtn.disabled = !orderAgree.checked;
      };
      // Сброс при открытии окна
      orderAgree.checked = false;
      orderSwitch.classList.remove('active');
      orderSubmitBtn.disabled = true;
    }

    // --- Каталог товаров (catalog.html) ---
    if (document.getElementById('catalog-list-page')) {
      const catalogProducts = [
        {cat: 'headphones', title: 'Logitech G733 (черные)', old: '', new: '80€', discount: '', img: 'images/g733-black.jpg', inStock: true},
        {cat: 'headphones', title: 'Logitech G PRO X Gaming Headset Black', old: '', new: '40€', discount: '', img: 'images/gpro-x.jpg', inStock: true},
        {cat: 'tv', title: 'Grundig 75 GHU 9000A 75\" 189 Ekran 4K UHD Smart Google TV', old: '', new: '500€', discount: '', img: 'images/grundig-75ghu9000a.jpg', inStock: true},
        {cat: 'robotvacuum', title: 'Xiaomi Robot Vacuum S10', old: '', new: '140€', discount: '', img: 'images/xiaomi-robot-vacuum-s10.jpg', inStock: true},
        {cat: 'mouse', title: 'Logitech G502 HERO High Performance Gaming Mouse', old: '', new: '50€', discount: '', img: 'images/g502-hero.jpg', inStock: true},
        {cat: 'mouse', title: 'Logitech G Pro Wireless Gaming Mouse', old: '', new: '40€', discount: '', img: 'images/gpro-wireless.jpg', inStock: true},
        {cat: 'headphones', title: 'Logitech Zone Vibe 100 White Color', old: '', new: '60€', discount: '', img: 'images/zone-vibe-100-white.jpg', inStock: true},
        {cat: 'headphones', title: 'HUAWEI FreeBuds 3i Black', old: '', new: '50€', discount: '', img: 'images/freebuds-3i-black.jpg', inStock: true},
        {cat: 'headphones', title: 'JABRA Elite 65t', old: '', new: '40€', discount: '', img: 'images/jabra-elite-65t.jpg', inStock: true},
        {cat: 'smartwatch', title: 'Colmi P8 Smartwatch', old: '', new: '25€', discount: '', img: 'images/colmi-p8.jpg', inStock: true},
        {cat: 'headphones', title: 'Беспроводные наушники OPPO Enco X Black', old: '', new: '50€', discount: '', img: 'images/oppo-enco-x-black.jpg', inStock: true},
        {cat: 'appliances', title: 'Грильница TEFAL EASYFRY XXL', old: '', new: '70€', discount: '', img: 'images/tefal-easyfry-xxl.jpg', inStock: true}
      ];

      // --- Динамические баннеры ---
      const banners = document.querySelectorAll('.banner-slide');
      const dots = document.querySelectorAll('.banner-dots .dot');
      let currentBanner = 0;
      function showBanner(idx) {
        banners.forEach((b, i) => {
          b.classList.toggle('active', i === idx);
          b.classList.toggle('hide', i !== idx);
          if (dots[i]) dots[i].classList.toggle('active', i === idx);
        });
      }
      function nextBanner() {
        currentBanner = (currentBanner + 1) % banners.length;
        showBanner(currentBanner);
      }
      if (banners.length > 1) {
        setInterval(nextBanner, 4000);
        dots.forEach((dot, i) => {
          dot.onclick = () => {
            currentBanner = i;
            showBanner(i);
          };
        });
      }
      showBanner(0);

      // --- Сайдбар фильтр ---
      window.activeCat = window.activeCat || 'all';
      const sidebarCats = document.querySelectorAll('.cat-item');
      sidebarCats.forEach(cat => {
        cat.addEventListener('click', function() {
          sidebarCats.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
          window.activeCat = this.getAttribute('data-cat');
          renderCatalog();
        });
      });

      const catalogListPage = document.getElementById('catalog-list-page');
      const searchInput = document.getElementById('catalog-search');
      function renderCatalog() {
        const search = searchInput.value.trim().toLowerCase();
        let filtered;
        if (window.activeCat === 'all') {
          filtered = catalogProducts.filter(prod => prod.title.toLowerCase().includes(search));
        } else {
          filtered = catalogProducts.filter(prod => prod.cat === window.activeCat && prod.title.toLowerCase().includes(search));
        }
        catalogListPage.innerHTML = filtered.length ? filtered.map(prod => `
          <div class="catalog-product-card">
              <span class="catalog-product-discount">${prod.discount}</span>
              <img class="catalog-product-img" src="${prod.img}" alt="${prod.title}" />
              <div class="catalog-product-title">${prod.title}</div>
              <div class="catalog-product-prices">
                  <span class="catalog-product-old-price">${prod.old}</span>
                  <span class="catalog-product-new-price">${prod.new}</span>
              </div>
              ${prod.inStock === false ? '<span class="out-of-stock-badge">Нет в наличии</span>' : ''}
              <button class="catalog-product-order-btn" data-title="${prod.title}" data-old="${prod.old}" data-new="${prod.new}" data-img="${prod.img}" ${prod.inStock === false ? 'disabled style="background:#444;color:#aaa;cursor:not-allowed;"' : ''}>${prod.inStock === false ? 'Нет в наличии' : 'Заказать'}</button>
          </div>
        `).join('') : `<div class='catalog-empty'><i class='fas fa-box-open'></i>Ничего не найдено, попробуйте изменить фильтры!</div>`;
        // Навесить обработчики на кнопки "Заказать"
        document.querySelectorAll('.catalog-product-order-btn').forEach(btn => {
          btn.onclick = function() {
            orderProductImg.src = btn.getAttribute('data-img');
            orderProductTitle.textContent = btn.getAttribute('data-title');
            orderOldPrice.textContent = btn.getAttribute('data-old');
            orderNewPrice.textContent = btn.getAttribute('data-new');
            orderForm.reset();
            orderForm.style.display = '';
            orderSuccess.style.display = 'none';
            orderModal.classList.add('show');
          };
        });
        // Перевести динамику после рендера
        if (typeof translateCatalogDynamic === 'function') translateCatalogDynamic();
      }
      searchInput.addEventListener('input', renderCatalog);
      renderCatalog();
    }

    // --- Кнопка меню для мобильных устройств ---
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle && header) {
        let menuOpened = false;
        menuToggle.addEventListener('click', () => {
            if (!menuOpened) {
                header.classList.remove('scroll-down');
                header.classList.add('scroll-up');
                menuOpened = true;
            } else {
                header.classList.remove('scroll-up');
                menuOpened = false;
            }
        });
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 700 && menuOpened && window.pageYOffset > 0) {
                header.classList.remove('scroll-up');
                menuOpened = false;
            }
        });
    }
  })();
}); 