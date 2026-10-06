import Papa from 'papaparse';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import './style.css';

const skuInput = document.querySelector('#sku-input');
const result = document.querySelector('#product-result');
const emptyState = document.querySelector('#empty-state');
const notFound = document.querySelector('#not-found');
const loadError = document.querySelector('#load-error');
const productCount = document.querySelector('#product-count');
const csvUpload = document.querySelector('#csv-upload');
const languageToggle = document.querySelector('#language-toggle');
const menuToggle = document.querySelector('#menu-toggle');
const floatingMenu = document.querySelector('#floating-menu');
const aboutDialog = document.querySelector('#about-dialog');
const setupDialog = document.querySelector('#setup-dialog');
const setupUpload = document.querySelector('#setup-upload');
const setupStatus = document.querySelector('#setup-status');
const setupLanguageToggle = document.querySelector('#setup-language-toggle');
const barcodePanel = document.querySelector('.barcode-panel');
const qrPanel = document.querySelector('.qr-panel');
const inventoryDatabaseName = 'talabat-code-station';
const inventoryStoreName = 'inventory';
let products = [];
let language = localStorage.getItem('talabat-language') || 'ar';

const translations = {
  ar: {
    documentTitle: 'محطة طلبات للأكواد | Talabat Code Station',
    brandLabel: 'Talabat الرئيسية',
    catalogLabel: 'كتالوج المنتجات',
    loadingProducts: 'جارٍ تحميل الأصناف...',
    languageButtonLabel: 'التبديل إلى الإنجليزية',
    menuButtonLabel: 'فتح القائمة',
    menuLabel: 'القائمة الرئيسية',
    aboutMenu: 'من نحن',
    scanFileMenu: 'رفع بيانات المخزون',
    contactMenu: 'تواصل معنا',
    menuNote: 'بياناتك محفوظة على هذا الجهاز فقط ولا تُرسل إلى خادم.',
    setupBrand: 'TALABAT CODE STATION',
    setupStep: 'إعداد سريع · خطوة 1 من 1',
    setupTitle: 'أهلاً بك في محطة طلبات للأكواد',
    setupLead: 'حوّل بيانات المخزون إلى بحث سريع وأكواد جاهزة للمسح.',
    setupRequirement: 'للبدء، ارفع ملف بيانات المخزون بصيغة CSV.',
    setupChooseFile: 'اختيار ملف CSV',
    setupDropHint: 'أو اسحب الملف وأفلته هنا',
    setupPrivacy: 'ملفك يُقرأ ويُحفظ على هذا الجهاز فقط، ولا يُرسل إلى خادم. يمكنك استبداله لاحقًا من القائمة.',
    setupFormat: 'يدعم ملفات CSV التي تحتوي على SKU واسم المنتج، والباركود اختياري.',
    setupReading: 'جارٍ قراءة ملف المخزون وحفظه على هذا الجهاز...',
    setupLoaded: 'تم تحميل {count} صنفًا بنجاح. بياناتك محفوظة على هذا الجهاز.',
    storageError: 'تعذر حفظ الملف في هذا المتصفح. تحقق من مساحة التخزين ثم حاول مرة أخرى.',
    csvFileError: 'اختر ملفًا بصيغة CSV للمتابعة.',
    aboutTitle: 'من نحن',
    aboutIntro: 'تم إنشاء الموقع بواسطة محمد هلال في فرع المقطم 1.',
    aboutPurpose: 'بدأت فكرته لتسهيل البحث عن منتجات الباريستا وEveryday ومسح أكوادها، عشان نقلل وقت تجهيز الطلبات ونخليها أسرع.',
    branchLabel: 'الفرع حسب بيانات المخزن',
    branchName: 'المقطم 1',
    legalNotice: 'لو عندك ملاحظة قانونية أو طلب إزالة محتوى، راسلني على البريد وسأراجعه وأزيل المحتوى المعني عند اللزوم.',
    closeDialogLabel: 'إغلاق',
    eyebrow: 'بحث سريع عن المنتج',
    headlineFirst: 'كل كود،',
    headlineSecond: 'في مكانه.',
    introDescription: 'اكتب SKU أو امسحه بقارئ الأكواد، وهتظهر بيانات المنتج وأكواد المسح فورًا.',
    skuLabel: 'رقم الصنف',
    skuPlaceholder: 'مثال: 300719',
    clearLabel: 'مسح البحث',
    searchHint: 'ابدأ الكتابة أو استخدم قارئ الأكواد. البحث يتم تلقائيًا.',
    emptyTitle: 'جاهز للبحث',
    emptyCopy: 'النتيجة هتظهر هنا بمجرد إدخال رقم الصنف.',
    productLabel: 'المنتج',
    foundBadge: 'تم العثور عليه',
    codeTypeLabel: 'نوع الكود',
    barcodeTab: 'الباركود',
    qrTab: 'QR Code',
    barcodeFallback: 'الباركود غير موجود في الملف؛ الكود هنا مبني على SKU.',
    qrAlt: 'QR Code للمنتج',
    qrHint: 'امسح الكود لقراءة القيمة المعروضة',
    detailsSummary: 'عرض بيانات الملف كاملة',
    scanReady: 'الكود جاهز للمسح',
    printButton: 'طباعة الكود',
    notFoundTitle: 'الصنف مش موجود',
    notFoundCopy: 'راجع رقم SKU أو حمّل ملف الأصناف الصحيح.',
    footerProductLookup: 'بحث المنتجات',
    footerCodeStation: 'محطة الأكواد',
    footerTagline: 'ببساطة للاستخدام اليومي',
    footerCopyright: 'جميع الحقوق محفوظة لصالح محمد هلال',
    productUnit: 'صنف',
    csvParseError: 'تعذر قراءة ملف CSV. تأكد من وجود أعمدة SKU واسم المنتج والباركود.',
    emptyCsvError: 'لم يتم العثور على أصناف. تأكد من وجود أعمدة SKU واسم المنتج.',
    loadError: 'تعذر تحميل بيانات المخزون المحفوظة.',
    serverHelp: 'ارفع ملف بيانات المخزون بصيغة CSV للبدء.',
    generateError: 'تعذر إنشاء الأكواد:',
    trueValue: 'نعم',
    falseValue: 'لا',
    fields: {
      sku_id: 'SKU', product_name: 'اسم المنتج', stock_on_hand: 'المخزون المتاح',
      reserved_stock: 'المخزون المحجوز', transit_incoming: 'وارد بالطريق',
      transit_outgoing: 'صادر بالطريق', sales_buffer: 'احتياطي المبيعات',
      barcodes: 'الباركود الأصلي', warehouse_name: 'المخزن',
      platform_vendor_id: 'معرّف المورد', parent_category: 'القسم الرئيسي',
      category: 'القسم', subcategory: 'القسم الفرعي', is_available: 'متاح للبيع',
      is_active: 'نشط', can_expire: 'له تاريخ صلاحية', blocked_qty: 'الكمية المحجوبة',
      blocked_pending_qty: 'كمية محجوبة معلقة', putaway_reserved_qty: 'كمية محجوزة للتخزين',
      is_deleted: 'محذوف',
    },
  },
  en: {
    documentTitle: 'Talabat Code Station | Product Codes',
    brandLabel: 'Talabat home',
    catalogLabel: 'Product catalog',
    loadingProducts: 'Loading products...',
    languageButtonLabel: 'Switch to Arabic',
    menuButtonLabel: 'Open menu',
    menuLabel: 'Main menu',
    aboutMenu: 'About us',
    scanFileMenu: 'Upload inventory data',
    contactMenu: 'Contact us',
    menuNote: 'Your data stays on this device and is never sent to a server.',
    setupBrand: 'TALABAT CODE STATION',
    setupStep: 'QUICK SETUP · STEP 1 OF 1',
    setupTitle: 'Welcome to Talabat Code Station',
    setupLead: 'Turn your inventory data into instant product lookups and scan-ready codes.',
    setupRequirement: 'To get started, upload your inventory file in CSV format.',
    setupChooseFile: 'Choose CSV file',
    setupDropHint: 'or drag and drop your file here',
    setupPrivacy: 'Your file is read and saved on this device only. It is never sent to a server. Replace it anytime from the menu.',
    setupFormat: 'CSV files with SKU and product name are supported. Barcode is optional.',
    setupReading: 'Reading your inventory and saving it on this device...',
    setupLoaded: 'Successfully loaded {count} products. Your data is saved on this device.',
    storageError: 'Could not save the file in this browser. Check available storage and try again.',
    csvFileError: 'Choose a CSV file to continue.',
    aboutTitle: 'About us',
    aboutIntro: 'This site was created by Mohamed Helal at the Mokattam 1 branch.',
    aboutPurpose: 'It started as a way to quickly find and scan Barista and Everyday product codes, reducing the time it takes to prepare orders.',
    branchLabel: 'Branch from warehouse data',
    branchName: 'Mokattam 1',
    legalNotice: 'For a legal concern or a content removal request, email me. I will review it and remove the relevant content when appropriate.',
    closeDialogLabel: 'Close',
    eyebrow: 'QUICK PRODUCT LOOKUP',
    headlineFirst: 'Every code,',
    headlineSecond: 'in its place.',
    introDescription: 'Enter an SKU or scan it to instantly see product details and scannable codes.',
    skuLabel: 'Product SKU',
    skuPlaceholder: 'Example: 300719',
    clearLabel: 'Clear search',
    searchHint: 'Start typing or use a scanner. Search runs automatically.',
    emptyTitle: 'Ready to search',
    emptyCopy: 'Product details will appear here as soon as you enter an SKU.',
    productLabel: 'PRODUCT',
    foundBadge: 'Product found',
    codeTypeLabel: 'Code type',
    barcodeTab: 'Barcode',
    qrTab: 'QR Code',
    barcodeFallback: 'No barcode in the file; this code uses the SKU.',
    qrAlt: 'Product QR code',
    qrHint: 'Scan to read the displayed value',
    detailsSummary: 'View all source data',
    scanReady: 'Code is ready to scan',
    printButton: 'Print code',
    notFoundTitle: 'Product not found',
    notFoundCopy: 'Check the SKU or upload the correct product file.',
    footerProductLookup: 'PRODUCT LOOKUP',
    footerCodeStation: 'CODE STATION',
    footerTagline: 'MADE FOR DAILY USE',
    footerCopyright: 'All rights reserved to Mohamed Helal',
    productUnit: 'products',
    csvParseError: 'Could not read the CSV. Check that it has SKU, product name, and barcode columns.',
    emptyCsvError: 'No products found. Check that the file has SKU and product name columns.',
    loadError: 'Could not load the saved inventory data.',
    serverHelp: 'Upload your inventory file in CSV format to get started.',
    generateError: 'Could not generate codes:',
    trueValue: 'Yes',
    falseValue: 'No',
    fields: {
      sku_id: 'SKU', product_name: 'Product name', stock_on_hand: 'Stock on hand',
      reserved_stock: 'Reserved stock', transit_incoming: 'Incoming transit',
      transit_outgoing: 'Outgoing transit', sales_buffer: 'Sales buffer',
      barcodes: 'Original barcode', warehouse_name: 'Warehouse',
      platform_vendor_id: 'Vendor ID', parent_category: 'Parent category',
      category: 'Category', subcategory: 'Subcategory', is_available: 'Available',
      is_active: 'Active', can_expire: 'Can expire', blocked_qty: 'Blocked quantity',
      blocked_pending_qty: 'Pending blocked quantity', putaway_reserved_qty: 'Putaway reserved quantity',
      is_deleted: 'Deleted',
    },
  },
};

function message(key) {
  return translations[language][key];
}

function updateProductCount() {
  productCount.textContent = `${products.length.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} ${message('productUnit')}`;
}

function applyLanguage() {
  const copy = translations[language];
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = copy[element.dataset.i18n];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = copy[element.dataset.i18nPlaceholder];
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    element.title = copy[element.dataset.i18nTitle];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    element.setAttribute('aria-label', copy[element.dataset.i18nAriaLabel]);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    element.alt = copy[element.dataset.i18nAlt];
  });
  languageToggle.textContent = language === 'ar' ? 'EN' : 'عربي';
  setupLanguageToggle.textContent = language === 'ar' ? 'EN' : 'عربي';
  if (products.length) updateProductCount();
  const activeProduct = products.find((product) => product.sku.toLowerCase() === skuInput.value.trim().toLowerCase());
  if (activeProduct && !result.hidden) renderProductDetails(activeProduct.source);
}

function setCodeType(type) {
  const showBarcode = type === 'barcode';
  barcodePanel.hidden = !showBarcode;
  qrPanel.hidden = showBarcode;
  document.querySelectorAll('[data-code-type]').forEach((button) => {
    const selected = button.dataset.codeType === type;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function showState(state) {
  emptyState.hidden = state !== 'empty';
  result.hidden = state !== 'result';
  notFound.hidden = state !== 'not-found';
  loadError.hidden = state !== 'error';
}

function normalizeProductRows(rows) {
  return rows
    .map((row) => {
      const sku = String(row.sku_id ?? row.SKU ?? row.sku ?? '').trim();
      const barcode = String(row.barcodes ?? row.Barcode ?? row.barcode ?? '').trim();
      return {
        sku,
        name: String(row.product_name ?? row['Item Name'] ?? row.name ?? row.Name ?? '').trim(),
        barcode,
        scanCode: barcode || sku,
        source: row,
      };
    })
    .filter((product) => product.sku && product.name);
}

function parseCsv(text) {
  const parsed = Papa.parse(text.replace(/^\uFEFF/, ''), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  });
  if (parsed.errors.length && !parsed.data.length) {
    throw new Error(message('csvParseError'));
  }
  const loadedProducts = normalizeProductRows(parsed.data);
  if (!loadedProducts.length) {
    throw new Error(message('emptyCsvError'));
  }
  return loadedProducts;
}

function openInventoryDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(inventoryDatabaseName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(inventoryStoreName, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(message('storageError')));
  });
}

async function saveInventory(text, fileName) {
  const database = await openInventoryDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(inventoryStoreName, 'readwrite');
    transaction.objectStore(inventoryStoreName).put({
      id: 'active',
      text,
      fileName,
      savedAt: new Date().toISOString(),
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error ?? new Error(message('storageError')));
    transaction.onabort = () => reject(transaction.error ?? new Error(message('storageError')));
  }).finally(() => database.close());
}

async function readSavedInventory() {
  const database = await openInventoryDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(inventoryStoreName, 'readonly');
      const request = transaction.objectStore(inventoryStoreName).get('active');
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error ?? new Error(message('loadError')));
      transaction.onerror = () => reject(transaction.error ?? new Error(message('loadError')));
    });
  } finally {
    database.close();
  }
}

async function loadCsvFile(file) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error(message('csvFileError'));
  }
  setupStatus.textContent = message('setupReading');
  const text = await file.text();
  const loadedProducts = parseCsv(text);
  await saveInventory(text, file.name);
  products = loadedProducts;
  updateProductCount();
  showState('empty');
  skuInput.value = '';
  if (setupDialog.open) setupDialog.close();
  setupStatus.textContent = message('setupLoaded').replace('{count}', loadedProducts.length.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'));
}

async function initializeInventory() {
  try {
    const savedInventory = await readSavedInventory();
    if (!savedInventory) {
      setupDialog.showModal();
      return;
    }
    products = parseCsv(savedInventory.text);
    updateProductCount();
    showState('empty');
  } catch (error) {
    setupStatus.textContent = `${error.message} ${message('serverHelp')}`;
    if (!setupDialog.open) setupDialog.showModal();
  }
}

async function displayProduct(product) {
  document.querySelector('#result-sku').textContent = `SKU ${product.sku}`;
  document.querySelector('#result-name').textContent = product.name;
  document.querySelector('#barcode-value').textContent = product.scanCode;
  document.querySelector('#barcode-note').hidden = Boolean(product.barcode);
  renderProductDetails(product.source);

  JsBarcode('#barcode', product.scanCode, {
    format: 'CODE128',
    width: 2,
    height: 76,
    margin: 4,
    displayValue: false,
    lineColor: '#15382d',
    background: '#ffffff',
  });
  document.querySelector('#qr-code').src = await QRCode.toDataURL(product.scanCode, {
    width: 188,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#15382d', light: '#ffffff' },
  });
  showState('result');
}

function renderProductDetails(source) {
  const container = document.querySelector('#product-details');
  container.replaceChildren();
  for (const [key, value] of Object.entries(source)) {
    const item = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = translations[language].fields[key] ?? key.replaceAll('_', ' ');
    const normalizedValue = String(value ?? '').toLowerCase();
    description.textContent = normalizedValue === 'true'
      ? message('trueValue')
      : normalizedValue === 'false'
        ? message('falseValue')
        : value || '—';
    item.append(term, description);
    container.append(item);
  }
}

function lookupProduct(value) {
  const sku = value.trim();
  if (!sku) {
    showState('empty');
    return;
  }
  const product = products.find((item) => item.sku.toLowerCase() === sku.toLowerCase());
  if (!product) {
    showState(products.length ? 'not-found' : 'error');
    return;
  }
  displayProduct(product).catch((error) => {
    loadError.textContent = `${message('generateError')} ${error.message}`;
    showState('error');
  });
}

document.querySelector('#search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  lookupProduct(skuInput.value);
});
skuInput.addEventListener('input', () => lookupProduct(skuInput.value));
document.querySelector('#clear-button').addEventListener('click', () => {
  skuInput.value = '';
  showState('empty');
  skuInput.focus();
});
document.querySelector('#print-button').addEventListener('click', () => window.print());
menuToggle.addEventListener('click', () => {
  const isOpen = !floatingMenu.hidden;
  floatingMenu.hidden = isOpen;
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
});
document.querySelector('#about-open').addEventListener('click', () => {
  floatingMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  aboutDialog.showModal();
});
document.querySelector('#about-close').addEventListener('click', () => aboutDialog.close());
document.querySelector('#upload-open').addEventListener('click', () => {
  floatingMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  csvUpload.click();
});
function chooseCsvFile() {
  csvUpload.click();
}
setupUpload.addEventListener('click', chooseCsvFile);
const setupDropzone = setupDialog;
setupDropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  setupDialog.classList.add('is-dragging');
});
setupDropzone.addEventListener('dragleave', (event) => {
  if (!setupDialog.contains(event.relatedTarget)) setupDialog.classList.remove('is-dragging');
});
setupDropzone.addEventListener('drop', async (event) => {
  event.preventDefault();
  setupDialog.classList.remove('is-dragging');
  const [file] = event.dataTransfer.files;
  if (!file) return;
  try {
    await loadCsvFile(file);
  } catch (error) {
    setupStatus.textContent = error.message;
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.menu-wrap') && !floatingMenu.hidden) {
    floatingMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !floatingMenu.hidden) {
    floatingMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});
function toggleLanguage() {
  language = language === 'ar' ? 'en' : 'ar';
  localStorage.setItem('talabat-language', language);
  applyLanguage();
}
languageToggle.addEventListener('click', toggleLanguage);
setupLanguageToggle.addEventListener('click', toggleLanguage);
document.querySelectorAll('[data-code-type]').forEach((button) => {
  button.addEventListener('click', () => setCodeType(button.dataset.codeType));
});
csvUpload.addEventListener('change', async () => {
  const [file] = csvUpload.files;
  if (!file) return;
  try {
    await loadCsvFile(file);
  } catch (error) {
    if (setupDialog.open) {
      setupStatus.textContent = error.message;
    } else {
      loadError.textContent = error.message;
      showState('error');
    }
  } finally {
    csvUpload.value = '';
  }
});

setCodeType('barcode');
applyLanguage();
setupDialog.addEventListener('cancel', (event) => event.preventDefault());
initializeInventory();