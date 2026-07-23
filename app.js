const cfg = window.AMBERFLO_CONFIG || {};
const money = value => new Intl.NumberFormat(currentLang === 'pl' ? 'pl-PL' : 'en-GB', {style:'currency', currency:'PLN', maximumFractionDigits:0}).format(value);

let products = window.AMBERFLO_PRODUCTS || [];

const colors = [
  ['rgba(236,201,53,.72)','Cytrynowy','Lemon'],['#984713','Koniakowy','Cognac'],['linear-gradient(145deg,#520611 0%,#340006 48%,#140002 100%)','Wiśniowy','Cherry']
];
const seedReviews = [
  {name:'Allegro · 216 kamieni',rating:5,content:{pl:'Średnia 5,00/5 na podstawie 18 ocen i 6 recenzji produktu.',en:'Average 5.00/5 based on 18 ratings and 6 product reviews.'},date:'dane Allegro'},
  {name:'Allegro · drzewko 20 cm',rating:5,content:{pl:'Średnia 5,00/5 na podstawie 5 ocen i 2 recenzji produktu.',en:'Average 5.00/5 based on 5 ratings and 2 product reviews.'},date:'dane Allegro'},
  {name:'marflorczak',rating:5,content:{pl:'Konto firmowe w Allegro polecane przez 100% oceniających klientów.',en:'The Allegro business seller is recommended by 100% of customers who rated it.'},date:'sprzedawca Allegro'}
];

const i18n = {
  pl:{announcement:'Darmowa dostawa od 500 zł · Rękodzieło z Polski · Zamówienia hurtowe',navHome:'Start',navShop:'Sklep',navAbout:'O mnie',navReviews:'Opinie',navContact:'Kontakt',cart:'Koszyk',heroEyebrow:'Bursztyn · drewno · ręce rzemieślnika',heroTitle:'Drzewka, które<br><em>niosą światło.</em>',heroLead:'Każde powstaje ręcznie z setek bryłek naturalnego bursztynu bałtyckiego. Nie ma dwóch takich samych.',seeCollection:'Zobacz kolekcję',meetMaker:'Poznaj twórcę',years:'lat doświadczenia',balticAmber:'bursztynu bałtyckiego',customerRating:'ocena klientów',handmade:'Wykonane ręcznie',uniqueBase:'na unikalnej podstawie z drewna',amberPalette:'Paleta bursztynu',chooseColor:'Wybierz swoje światło',colorText:'Od krystalicznej cytryny po głęboki wiśniowy — natura maluje każdą bryłkę inaczej.',collectionEyebrow:'Kolekcja Amberflo',shopTitle:'Znajdź swoje drzewko',shopIntro:'Ręcznie skręcane gałązki, naturalny bursztyn i podstawa z korzenia dębu lub egzotycznego mopani.',all:'Wszystkie',small:'Małe',classic:'Klasyczne',large:'Duże',priceNote:'Ceny i opisy opracowane na podstawie aktualnych oraz archiwalnych ofert sprzedawcy marflorczak w Allegro. Dostępność potwierdzamy po złożeniu zamówienia.',inOneTree:'W jednym drzewku',piecesTitle:'bryłki bursztynu<br>układane jedna po drugiej.',piecesText:'To nie jest produkcja seryjna. Każdy pień, każda gałązka i każda bryłka przechodzi przez ręce Marcina.',meetEyebrow:'Poznaj twórcę',largestTree:'Największe drzewo: 220 cm',hello:'Cześć, mam na imię',aboutP1:'Od około 20 lat tworzę wyroby z drewna i bursztynu. Postanowiłem urzeczywistnić własne pomysły — od pierwszego szkicu aż po ostatnią bryłkę wszystko wykonuję samodzielnie.',aboutP2:'Największe wykonane przeze mnie drzewo ma 220 cm wysokości i dziś jest atrakcją dla turystów oraz mieszkańców Chin. Jeśli masz własny pomysł, razem stworzymy coś wyjątkowego i niepowtarzalnego.',talkProject:'Porozmawiajmy o projekcie',reviewsEyebrow:'Wasze słowa',reviewsTitle:'Drzewka w nowych domach',basedOn:'na podstawie opinii klientów',addReview:'Dodaj swoją opinię',contactEyebrow:'Kontakt i zamówienia',contactTitle:'Stwórzmy coś<br>niepowtarzalnego.',contactLead:'Masz pytanie, własny projekt lub zamówienie hurtowe? Zadzwoń albo napisz — chętnie pomogę.',location:'Lokalizacja',openMap:'Otwórz w Mapach Google ↗',orderInfo:'Informacje do zamówienia',invoiceTitle:'Paragon lub faktura VAT',invoiceText:'Dołączamy do każdego zamówienia.',wholesaleTitle:'Zamówienia hurtowe',wholesaleText:'Realizujemy serie dla firm i sklepów.',bankTransfer:'Przelew tradycyjny · mBank',footerLine:'Ręcznie wykonane. Naturalnie niepowtarzalne.',yourCart:'Twój koszyk',selectedTreasures:'Wybrane skarby',emptyCart:'Koszyk jest pusty',emptyText:'Wybierz drzewko, które przyciągnęło Twój wzrok.',subtotal:'Suma',deliveryCalc:'Koszt dostawy obliczymy przy zamówieniu.',goCheckout:'Przejdź do zamówienia',yourOpinion:'Twoja opinia',shareExperience:'Podziel się wrażeniami',nameLabel:'Imię i nazwisko',emailLabel:'E-mail (nie będzie widoczny)',ratingLabel:'Ocena',reviewLabel:'Treść opinii',sendReview:'Wyślij opinię',checkoutEyebrow:'Finalizacja',orderTitle:'Dane zamówienia',phoneLabel:'Telefon',addressLabel:'Adres dostawy',notesLabel:'Uwagi / wybrany kolor bursztynu',paymentLabel:'Metoda płatności',onlinePayment:'Karta / BLIK',traditionalTransfer:'Przelew tradycyjny',placeOrder:'Złóż zamówienie',added:'Dodano do koszyka',copied:'Numer konta skopiowany',details:'Zobacz szczegóły',addToCart:'Dodaj do koszyka',height:'Wysokość',pieces:'Bryłki bursztynu',width:'Szerokość',material:'Materiał',materialValue:'Bursztyn bałtycki, drewno',reviewThanks:'Dziękujemy! Opinia czeka na zatwierdzenie.',orderSaved:'Zamówienie zostało przyjęte. Potwierdzenie wyślemy e-mailem.',configNeeded:'Płatności online wymagają jeszcze podłączenia kont Stripe i Supabase. Wybierz przelew tradycyjny lub uzupełnij konfigurację.',emailOrder:'Otwieram wiadomość z zamówieniem — wyślij ją, aby je potwierdzić.'},
  en:{announcement:'Free delivery from PLN 500 · Handmade in Poland · Wholesale orders',navHome:'Home',navShop:'Shop',navAbout:'About',navReviews:'Reviews',navContact:'Contact',cart:'Cart',heroEyebrow:'Amber · wood · a maker’s hands',heroTitle:'Trees that<br><em>carry light.</em>',heroLead:'Each is made by hand from hundreds of pieces of natural Baltic amber. No two are alike.',seeCollection:'View collection',meetMaker:'Meet the maker',years:'years of experience',balticAmber:'Baltic amber',customerRating:'customer rating',handmade:'Made by hand',uniqueBase:'on a unique wooden base',amberPalette:'Amber palette',chooseColor:'Choose your light',colorText:'From crystalline lemon to deep cherry — nature colours every stone differently.',collectionEyebrow:'Amberflo collection',shopTitle:'Find your tree',shopIntro:'Hand-twisted branches, natural amber and a base made from oak or exotic mopani root.',all:'All',small:'Small',classic:'Classic',large:'Large',priceNote:'Prices and descriptions are based on current and archived Allegro listings by marflorczak. Availability is confirmed after ordering.',inOneTree:'In a single tree',piecesTitle:'amber stones<br>placed one by one.',piecesText:'This is not mass production. Every trunk, branch and amber stone passes through Marcin’s hands.',meetEyebrow:'Meet the maker',largestTree:'Largest tree: 220 cm',hello:'Hello, my name is',aboutP1:'I have been creating objects from wood and amber for about 20 years. I decided to bring my own ideas to life — from the first sketch to the final stone, I make everything myself.',aboutP2:'The largest tree I have made is 220 cm tall and is now an attraction for tourists and residents in China. If you have an idea of your own, together we can create something truly unique.',talkProject:'Let’s discuss your project',reviewsEyebrow:'Your words',reviewsTitle:'Trees in their new homes',basedOn:'based on customer reviews',addReview:'Add your review',contactEyebrow:'Contact and orders',contactTitle:'Let’s create something<br>one of a kind.',contactLead:'Have a question, a custom idea or a wholesale order? Call or write — I will be happy to help.',location:'Location',openMap:'Open in Google Maps ↗',orderInfo:'Order information',invoiceTitle:'Receipt or VAT invoice',invoiceText:'Included with every order.',wholesaleTitle:'Wholesale orders',wholesaleText:'We create collections for businesses and shops.',bankTransfer:'Traditional bank transfer · mBank',footerLine:'Handmade. Naturally unique.',yourCart:'Your cart',selectedTreasures:'Selected treasures',emptyCart:'Your cart is empty',emptyText:'Choose the tree that caught your eye.',subtotal:'Total',deliveryCalc:'Shipping is calculated when ordering.',goCheckout:'Proceed to checkout',yourOpinion:'Your review',shareExperience:'Share your experience',nameLabel:'Full name',emailLabel:'Email (will not be displayed)',ratingLabel:'Rating',reviewLabel:'Review',sendReview:'Send review',checkoutEyebrow:'Checkout',orderTitle:'Order details',phoneLabel:'Phone',addressLabel:'Delivery address',notesLabel:'Notes / preferred amber colour',paymentLabel:'Payment method',onlinePayment:'Card / BLIK',traditionalTransfer:'Bank transfer',placeOrder:'Place order',added:'Added to cart',copied:'Account number copied',details:'View details',addToCart:'Add to cart',height:'Height',pieces:'Amber stones',width:'Width',material:'Material',materialValue:'Baltic amber, wood',reviewThanks:'Thank you! Your review is awaiting approval.',orderSaved:'Your order was received. We will email a confirmation.',configNeeded:'Online payments still require connected Stripe and Supabase accounts. Choose bank transfer or complete the configuration.',emailOrder:'Opening an order email — send it to confirm your order.'}
};
i18n.pl.workshop = 'Pracownia Amberflo';
i18n.pl.announcement = 'Darmowa dostawa od 300 zł · Rękodzieło z Polski · Zamówienia hurtowe';
i18n.pl.notesLabel = 'Uwagi do zamówienia';
i18n.pl.notesPlaceholder = 'np. jaśniejsza podstawa, dedykacja, termin realizacji';
i18n.pl.amberColorLabel = 'Wybrany kolor bursztynu';
i18n.pl.amberColorPlaceholder = 'Wybierz kolor...';
i18n.pl.amberColorMix = 'Mix kolor';
i18n.pl.amberColorLemon = 'Cytryna';
i18n.pl.amberColorCognac = 'Koniak jasny/ciemny';
i18n.pl.amberColorCherry = 'Wiśnia';
i18n.pl.cartColorItem = 'Drzewko';
i18n.pl.cartColorChoose = 'wybierz kolor';
i18n.pl.cartColorMissing = 'Wybierz kolor bursztynu dla każdej sztuki w koszyku.';
i18n.pl.colorOrderInfo = '<p>Kolory są poglądowe. Odcień bursztynu może delikatnie różnić się od rzeczywistego koloru bursztynu na drzewku.</p><p>W koszyku przy każdej sztuce wybierz kolor bursztynu:</p><ul><li>Mix kolor</li><li>Cytryna</li><li>Koniak jasny/ciemny</li><li>Wiśnia</li></ul>';
i18n.pl.documentLabel = 'Dokument sprzedaży';
i18n.pl.receiptOption = 'Paragon';
i18n.pl.receiptHint = 'Dla osoby prywatnej';
i18n.pl.invoiceOption = 'Faktura VAT';
i18n.pl.invoiceHint = 'Dla firmy lub działalności';
i18n.pl.invoiceDataTitle = 'Dane nabywcy do faktury';
i18n.pl.invoiceNameLabel = 'Nazwa firmy / nabywcy';
i18n.pl.nipLabel = 'NIP (10 cyfr)';
i18n.pl.invoiceAddressLabel = 'Adres do faktury';
i18n.pl.directions = 'Wyznacz trasę ↗';
i18n.pl.consentText = 'Akceptuję <a href="regulamin.html" target="_blank">regulamin</a> oraz zapoznałem/am się z <a href="polityka-prywatnosci.html" target="_blank">polityką prywatności</a> i zasadami <a href="dostawa-i-zwroty.html" target="_blank">dostaw i zwrotów</a>.';
i18n.pl.placeOrder = 'Kupuję i płacę';
i18n.pl.openingHours = 'Godziny otwarcia';
i18n.pl.openingHoursValue = 'Poniedziałek–sobota: 8:00–16:00';
i18n.pl.closedSunday = 'Niedziela: nieczynne';
i18n.pl.sellerDetails = 'Dane sprzedawcy';
i18n.pl.reviewPhotosLabel = 'Zdjęcia do opinii';
i18n.pl.reviewPhotosHint = 'Możesz dodać maksymalnie 4 zdjęcia: JPG, PNG, WEBP, GIF lub AVIF. Jedno zdjęcie maks. 8 MB.';
i18n.pl.availability = 'Dostępność';
i18n.pl.shippingTime = 'Czas realizacji';
i18n.pl.faqEyebrow = 'Warto wiedzieć';
i18n.pl.faqTitle = 'FAQ – najczęstsze pytania';
i18n.pl.faqQ1 = 'Czy każde drzewko wygląda identycznie?';
i18n.pl.faqA1 = 'Nie. Każde drzewko jest wykonywane ręcznie. Naturalna podstawa, kształt gałązek i ułożenie bursztynu mogą delikatnie różnić się od egzemplarza przedstawionego na zdjęciach.';
i18n.pl.faqQ2 = 'Jak wybrać kolor bursztynu?';
i18n.pl.faqA2 = 'Po dodaniu produktu do koszyka wybierz kolor osobno dla każdej sztuki: Mix kolor, Cytryna, Koniak jasny/ciemny lub Wiśnia. Przedstawione kolory są poglądowe.';
i18n.pl.faqQ3 = 'Ile trwa realizacja?';
i18n.pl.faqA3 = 'Aktualny czas realizacji jest podany przy każdym produkcie. Standardowo wysyłka następuje w ciągu 1–3 dni roboczych. Termin zamówień indywidualnych i hurtowych ustalamy osobno.';
i18n.pl.faqQ4 = 'Czy wystawiana jest faktura?';
i18n.pl.faqA4 = 'Tak. Podczas składania zamówienia możesz wybrać paragon albo fakturę VAT. Po wybraniu faktury pojawią się pola na dane nabywcy i NIP.';
i18n.pl.faqQ5 = 'Jak działa zwrot?';
i18n.pl.faqA5 = 'W przypadku standardowego produktu poinformuj nas o odstąpieniu w ciągu 14 dni od jego otrzymania, a następnie odeślij odpowiednio zabezpieczony produkt. Produkty wykonane według indywidualnej specyfikacji mogą nie podlegać zwrotowi. Szczegóły znajdziesz w dokumencie <a href="dostawa-i-zwroty.html">Dostawa i zwroty</a>.';
i18n.pl.allegroButton = 'Zobacz sklep na Allegro';
i18n.pl.socialFindUs = 'Znajdziesz nas również tutaj';
i18n.en.workshop = 'Amberflo workshop';
i18n.en.announcement = 'Free delivery from PLN 300 · Handmade in Poland · Wholesale orders';
i18n.en.notesLabel = 'Order notes';
i18n.en.notesPlaceholder = 'e.g. lighter base, dedication, delivery timing';
i18n.en.amberColorLabel = 'Selected amber colour';
i18n.en.amberColorPlaceholder = 'Choose a colour...';
i18n.en.amberColorMix = 'Colour mix';
i18n.en.amberColorLemon = 'Lemon';
i18n.en.amberColorCognac = 'Light/dark cognac';
i18n.en.amberColorCherry = 'Cherry';
i18n.en.cartColorItem = 'Tree';
i18n.en.cartColorChoose = 'choose colour';
i18n.en.cartColorMissing = 'Choose an amber colour for every item in your cart.';
i18n.en.colorOrderInfo = '<p>The colours shown are for reference. The shade of amber on the tree may differ slightly from the colour presented.</p><p>In the cart, select the amber colour for each item:</p><ul><li>Colour mix</li><li>Lemon</li><li>Light/dark cognac</li><li>Cherry</li></ul>';
i18n.en.documentLabel = 'Sales document';
i18n.en.receiptOption = 'Receipt';
i18n.en.receiptHint = 'For individual customers';
i18n.en.invoiceOption = 'VAT invoice';
i18n.en.invoiceHint = 'For a company or business';
i18n.en.invoiceDataTitle = 'Invoice buyer details';
i18n.en.invoiceNameLabel = 'Company / buyer name';
i18n.en.nipLabel = 'Polish tax ID (NIP, 10 digits)';
i18n.en.invoiceAddressLabel = 'Billing address';
i18n.en.directions = 'Get directions ↗';
i18n.en.consentText = 'I accept the <a href="regulamin.html" target="_blank">terms and conditions</a> and have read the <a href="polityka-prywatnosci.html" target="_blank">privacy policy</a> and the <a href="dostawa-i-zwroty.html" target="_blank">delivery and returns policy</a>.';
i18n.en.placeOrder = 'Order and pay';
i18n.en.openingHours = 'Opening hours';
i18n.en.openingHoursValue = 'Monday–Saturday: 8:00–16:00';
i18n.en.closedSunday = 'Sunday: closed';
i18n.en.sellerDetails = 'Seller details';
i18n.en.reviewPhotosLabel = 'Review photos';
i18n.en.reviewPhotosHint = 'You can add up to 4 photos: JPG, PNG, WEBP, GIF or AVIF. One photo max. 8 MB.';
i18n.en.availability = 'Availability';
i18n.en.shippingTime = 'Fulfilment time';
i18n.en.faqEyebrow = 'Good to know';
i18n.en.faqTitle = 'Frequently asked questions';
i18n.en.faqQ1 = 'Does every tree look identical?';
i18n.en.faqA1 = 'No. Every tree is handmade. The natural base, branch shape and arrangement of amber may differ slightly from the piece shown in the photos.';
i18n.en.faqQ2 = 'How do I choose the amber colour?';
i18n.en.faqA2 = 'After adding a product to the cart, choose the colour separately for each piece: Colour mix, Lemon, Light/dark cognac or Cherry. The colours shown are for reference.';
i18n.en.faqQ3 = 'How long does fulfilment take?';
i18n.en.faqA3 = 'The current fulfilment time is shown with each product. Orders are usually dispatched within 1–3 business days. Lead times for custom and wholesale orders are agreed individually.';
i18n.en.faqQ4 = 'Can I receive a VAT invoice?';
i18n.en.faqA4 = 'Yes. During checkout, you can choose a receipt or VAT invoice. When you select an invoice, fields for the buyer details and tax ID will appear.';
i18n.en.faqQ5 = 'How do returns work?';
i18n.en.faqA5 = 'For a standard product, notify us of your withdrawal within 14 days of receiving it and then return the properly secured product. Products made to an individual specification may be excluded from returns. See <a href="dostawa-i-zwroty.html">Delivery and returns</a> for details.';
i18n.en.allegroButton = 'View our Allegro store';
i18n.en.socialFindUs = 'You can also find us here';

const amberColorOptions = [
  {value:'Mix kolor',pl:'Mix kolor',en:'Colour mix'},
  {value:'Cytryna',pl:'Cytryna',en:'Lemon'},
  {value:'Koniak jasny/ciemny',pl:'Koniak jasny/ciemny',en:'Light/dark cognac'},
  {value:'Wiśnia',pl:'Wiśnia',en:'Cherry'}
];

let currentLang = localStorage.getItem('amberflo-lang') || 'pl';
let cart = JSON.parse(localStorage.getItem('amberflo-cart') || '[]');
let activeFilter = 'all';
let activeGallery = [];
let activeGalleryIndex = 0;
let activeReviewGallery = [];
let activeReviewGalleryIndex = 0;
const $ = s => document.querySelector(s);
const t = key => i18n[currentLang][key] || key;

async function loadCatalog(){
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)return;
  try{
    const response=await fetch(`${cfg.supabaseUrl}/rest/v1/products?active=eq.true&select=*&order=sort_order.asc`,{headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`}});
    if(!response.ok)return;
    const rows=await response.json();
    if(!rows.length)return;
    products=rows.map(row=>({
      id:row.id,category:row.category,name:{pl:row.name_pl,en:row.name_en||row.name_pl},price:Number(row.price),height:row.height||'—',pieces:row.pieces||'—',width:row.width||'—',image:row.main_image||(row.gallery?.[0]||''),gallery:Array.isArray(row.gallery)&&row.gallery.length?row.gallery:[row.main_image].filter(Boolean),badge:{pl:row.badge_pl||'',en:row.badge_en||row.badge_pl||''},desc:{pl:row.description_pl||'',en:row.description_en||row.description_pl||''},availability:{pl:row.availability_pl||'Dostępny',en:row.availability_en||'Available'},shippingTime:{pl:row.shipping_time_pl||'Wysyłka w 1–3 dni robocze',en:row.shipping_time_en||'Ships within 1–3 business days'}
    }));
    renderProducts();renderCart();
  }catch(error){console.warn('Katalog offline — używam produktów zapisanych w stronie.');}
}

function renderSwatches(){ $('#swatches').innerHTML=colors.map(c=>`<div class="swatch"><div class="swatch-color" style="background:${c[0]}"></div><b>${currentLang==='pl'?c[1]:c[2]}</b></div>`).join(''); }
function renderProducts(){ const visible=products.filter(p=>activeFilter==='all'||p.category===activeFilter); $('#productGrid').innerHTML=visible.map(p=>`<article class="product-card"><div class="product-image" data-detail="${escapeHtml(p.id)}" role="button" tabindex="0"><span class="product-badge">${escapeHtml(p.badge[currentLang])}</span><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name[currentLang])}" loading="lazy"></div><div class="product-info"><div class="product-meta"><span>${escapeHtml(p.height)}</span><span>${escapeHtml(p.pieces)} ${currentLang==='pl'?'bryłek':'stones'}</span></div><h3>${escapeHtml(p.name[currentLang])}</h3><p class="product-description">${escapeHtml(descriptionPlainText(p.desc[currentLang]))}</p><div class="product-fulfilment"><span>${escapeHtml(productAvailability(p))}</span><small>${escapeHtml(productShippingTime(p))}</small></div><div class="product-bottom"><strong class="price">${money(p.price)}</strong><button class="add-cart" data-add="${escapeHtml(p.id)}" aria-label="${escapeHtml(t('addToCart'))}">+</button></div></div></article>`).join(''); }
function updateI18n(){ document.documentElement.lang=currentLang; document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(i18n[currentLang][key])el.innerHTML=i18n[currentLang][key]}); document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const key=el.dataset.i18nPlaceholder;if(i18n[currentLang][key])el.placeholder=i18n[currentLang][key]}); document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===currentLang)); renderSwatches();renderProducts();renderReviews();renderCart(); }
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function descriptionPlainText(value=''){return String(value).replace(/\r\n?/g,'\n').replace(/\s+/g,' ').trim();}
function productAvailability(product){return product.availability?.[currentLang]||product.availability?.pl||(currentLang==='pl'?'Dostępny':'Available');}
function productShippingTime(product){return product.shippingTime?.[currentLang]||product.shippingTime?.pl||(currentLang==='pl'?'Wysyłka w 1–3 dni robocze':'Ships within 1–3 business days');}
function formatProductDescription(value=''){
  const lines=String(value).replace(/\r\n?/g,'\n').split('\n');
  let html='';let paragraph=[];let list=[];
  const flushParagraph=()=>{if(paragraph.length){html+=`<p>${paragraph.map(escapeHtml).join('<br>')}</p>`;paragraph=[];}};
  const flushList=()=>{if(list.length){html+=`<ul>${list.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`;list=[];}};
  lines.forEach(rawLine=>{
    const line=rawLine.trim();
    if(!line){flushParagraph();flushList();return;}
    const bullet=line.match(/^[-•]\s+(.+)$/);
    if(bullet){flushParagraph();list.push(bullet[1]);return;}
    flushList();paragraph.push(line);
  });
  flushParagraph();flushList();
  return html;
}
function syncCartItem(item){const qty=Math.max(1,Math.min(20,Number(item.qty)||1));const source=Array.isArray(item.colors)?item.colors:[];const allowedColors=new Set(amberColorOptions.map(option=>option.value));const colors=Array.from({length:qty},(_,index)=>{const value=String(source[index]||'');return allowedColors.has(value)?value:''});return {...item,qty,colors};}
function normalizeCart(){cart=(Array.isArray(cart)?cart:[]).filter(item=>item&&item.id).map(syncCartItem);}
function cartColorOptionsHtml(selected=''){return `<option value="">${t('amberColorPlaceholder')}</option>${amberColorOptions.map(option=>`<option value="${escapeHtml(option.value)}" ${option.value===selected?'selected':''}>${escapeHtml(currentLang==='pl'?option.pl:option.en)}</option>`).join('')}`;}
function cartColorRows(item){return item.colors.map((value,index)=>`<label class="cart-color-choice"><span>${t('cartColorItem')} ${index+1}: ${t('cartColorChoose')}</span><select data-cart-color="${escapeHtml(item.id)}" data-color-index="${index}" required>${cartColorOptionsHtml(value)}</select></label>`).join('');}
function addToCart(id){const found=cart.find(x=>x.id===id);if(found){const synced=syncCartItem(found);Object.assign(found,synced,{qty:synced.qty+1,colors:[...synced.colors,'']});}else cart.push({id,qty:1,colors:['']});saveCart();toast(t('added'));}
function saveCart(){normalizeCart();localStorage.setItem('amberflo-cart',JSON.stringify(cart));renderCart();}
function renderCart(){normalizeCart();const count=cart.reduce((s,x)=>s+x.qty,0);$('#cartCount').textContent=count;const list=$('#cartItems'),empty=$('#cartEmpty'),summary=$('#cartSummary');if(!count){list.innerHTML='';empty.style.display='block';summary.style.display='none';return}empty.style.display='none';summary.style.display='block';list.innerHTML=cart.map(item=>{const p=products.find(x=>x.id===item.id);if(!p)return'';return`<div class="cart-item"><img src="${p.image}" alt="${p.name[currentLang]}"><div class="cart-item-main"><h4>${p.name[currentLang]}</h4><small>${money(p.price)}</small><div class="qty-control"><button data-qty="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div><div class="cart-color-list">${cartColorRows(item)}</div></div><button class="remove-item" data-remove="${p.id}" aria-label="Usuń">×</button></div>`}).join('');$('#cartTotal').textContent=money(cart.reduce((s,item)=>{const p=products.find(product=>product.id===item.id);return s+(p?p.price*item.qty:0)},0));}
function changeQty(id,delta){const item=cart.find(x=>x.id===id);if(!item)return;const synced=syncCartItem(item);const qty=synced.qty+delta;if(qty<=0)cart=cart.filter(x=>x.id!==id);else{synced.qty=qty;if(delta>0)synced.colors.push('');else synced.colors=synced.colors.slice(0,qty);Object.assign(item,synced)}saveCart();}
function setCartColor(id,index,value){const item=cart.find(x=>x.id===id);if(!item)return;Object.assign(item,syncCartItem(item));item.colors[Number(index)]=String(value||'');saveCart();}
function getOrderItems(){normalizeCart();return cart.map(item=>({id:item.id,qty:item.qty,colors:item.colors.slice(0,item.qty)}));}
function findMissingCartColor(){normalizeCart();for(const item of cart){const missing=item.colors.findIndex(value=>!String(value||'').trim());if(missing>-1)return{id:item.id,index:missing}}return null;}
function cartOrderLines(){return getOrderItems().map(item=>{const p=products.find(product=>product.id===item.id);const colors=item.colors.map((color,index)=>`${t('cartColorItem')} ${index+1}: ${color}`).join(', ');return`${p?.name?.pl||item.id} × ${item.qty} — ${money((p?.price||0)*item.qty)}\nKolory: ${colors}`}).join('\n');}
function toggleCart(open){$('#cartDrawer').classList.toggle('open',open);$('#drawerOverlay').classList.toggle('open',open);$('#cartDrawer').setAttribute('aria-hidden',!open);document.body.classList.toggle('no-scroll',open);}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function updateGallery(index){
  if(!activeGallery.length)return;
  activeGalleryIndex=(index+activeGallery.length)%activeGallery.length;
  const image=$('#modalGalleryImage');
  if(image)image.src=activeGallery[activeGalleryIndex];
  const counter=$('#galleryCounter');
  if(counter)counter.textContent=`${activeGalleryIndex+1} / ${activeGallery.length}`;
  document.querySelectorAll('[data-gallery-index]').forEach((button,i)=>button.classList.toggle('active',i===activeGalleryIndex));
}
function openProduct(id){const p=products.find(x=>x.id===id);if(!p)return;activeGallery=p.gallery?.length?p.gallery:[p.image];activeGalleryIndex=0;const arrows=activeGallery.length>1?`<button class="gallery-arrow prev" data-gallery-nav="-1" aria-label="${currentLang==='pl'?'Poprzednie zdjęcie':'Previous image'}">‹</button><button class="gallery-arrow next" data-gallery-nav="1" aria-label="${currentLang==='pl'?'Następne zdjęcie':'Next image'}">›</button>`:'';const thumbs=activeGallery.length>1?`<div class="gallery-thumbs">${activeGallery.map((src,i)=>`<button class="gallery-thumb ${i===0?'active':''}" data-gallery-index="${i}" aria-label="${currentLang==='pl'?'Pokaż zdjęcie':'Show image'} ${i+1}"><img src="${escapeHtml(src)}" alt=""></button>`).join('')}</div>`:'';const handmadeNote=currentLang==='pl'?'Każdy egzemplarz jest wykonywany ręcznie, dlatego podstawa i układ gałązek mogą delikatnie różnić się od zdjęcia.':'Each piece is handmade, so the base and arrangement of branches may vary slightly from the photo.';$('#productModalContent').innerHTML=`<div class="product-modal-grid"><div class="product-gallery"><div class="gallery-stage"><img id="modalGalleryImage" src="${escapeHtml(activeGallery[0])}" alt="${escapeHtml(p.name[currentLang])}">${arrows}<span class="gallery-counter" id="galleryCounter">1 / ${activeGallery.length}</span></div>${thumbs}</div><div class="product-modal-copy"><p class="eyebrow">Amberflo · ${escapeHtml(p.badge[currentLang])}</p><h2>${escapeHtml(p.name[currentLang])}</h2><div class="product-description-full">${formatProductDescription(p.desc[currentLang])}</div><p class="product-handmade-note">${escapeHtml(handmadeNote)}</p><div class="specs"><div><span>${escapeHtml(t('availability'))}</span><b class="spec-availability">${escapeHtml(productAvailability(p))}</b></div><div><span>${escapeHtml(t('shippingTime'))}</span><b>${escapeHtml(productShippingTime(p))}</b></div><div><span>${escapeHtml(t('height'))}</span><b>${escapeHtml(p.height)}</b></div><div><span>${escapeHtml(t('pieces'))}</span><b>${escapeHtml(p.pieces)}</b></div><div><span>${escapeHtml(t('width'))}</span><b>${escapeHtml(p.width)}</b></div><div><span>${escapeHtml(t('material'))}</span><b>${escapeHtml(t('materialValue'))}</b></div></div><p class="gallery-note">${currentLang==='pl'?'Zdjęcia przedstawiają dostępne, ręcznie wykonane warianty. Naturalna podstawa i układ bursztynu są unikatowe.':'Photos show available handmade variants. The natural base and amber arrangement are unique.'}</p><p class="modal-price">${money(p.price)}</p><button class="button button-primary full" data-modal-add="${escapeHtml(p.id)}">${escapeHtml(t('addToCart'))}</button></div></div>`;$('#productModal').showModal();}
async function submitOrder(form){const data=Object.fromEntries(new FormData(form));const items=getOrderItems();const status=$('#checkoutStatus');status.textContent='…';const missingColor=findMissingCartColor();if(missingColor){status.textContent=t('cartColorMissing');toggleCart(true);setTimeout(()=>document.querySelector(`[data-cart-color="${missingColor.id}"][data-color-index="${missingColor.index}"]`)?.focus(),120);return}if(data.payment==='online'){if(!cfg.supabaseUrl||!cfg.supabaseAnonKey){status.textContent=t('configNeeded');return}try{const res=await fetch(`${cfg.supabaseUrl}/functions/v1/create-checkout`,{method:'POST',headers:{Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json'},body:JSON.stringify({customer:data,items,language:currentLang})});const out=await res.json();if(!res.ok||!out.url)throw new Error(out.error||'Checkout');window.location.href=out.url;}catch(e){status.textContent=currentLang==='pl'?'Nie udało się uruchomić płatności. Spróbuj ponownie.':'Could not start payment. Please try again.';}return}
  const lines=cartOrderLines();const total=money(cart.reduce((s,x)=>{const p=products.find(product=>product.id===x.id);return s+(p?p.price*x.qty:0)},0));const body=`NOWE ZAMÓWIENIE AMBERFLO\n\nKlient: ${data.name}\nTelefon: ${data.phone}\nE-mail: ${data.email}\nAdres: ${data.address}\nUwagi: ${data.notes||'-'}\n\n${lines}\n\nSuma: ${total}\nPłatność: przelew tradycyjny`;if(cfg.supabaseUrl&&cfg.supabaseAnonKey){try{await fetch(`${cfg.supabaseUrl}/functions/v1/notify`,{method:'POST',headers:{Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json'},body:JSON.stringify({type:'order',payload:{...data,items,summary:lines,total}})});status.textContent=t('orderSaved');cart=[];saveCart();return}catch(e){}}
  status.textContent=t('emailOrder');window.location.href=`mailto:biuroamberflo@gmail.com?subject=${encodeURIComponent('Nowe zamówienie Amberflo')}&body=${encodeURIComponent(body)}`;
}

const REVIEW_IMAGE_BUCKET = 'review-images';
const REVIEW_IMAGE_LIMIT = 4;
const REVIEW_IMAGE_MAX_SIZE = 8 * 1024 * 1024;
const REVIEW_IMAGE_TYPES = ['image/jpeg','image/png','image/webp','image/gif','image/avif'];

function reviewImages(review){
  return Array.isArray(review.images) ? review.images.filter(Boolean) : [];
}

function reviewImageGrid(images){
  if(!images.length)return '';
  const gallery=encodeURIComponent(JSON.stringify(images));
  return `<div class="review-photos">${images.map((src,index)=>`<button type="button" class="review-photo-thumb" data-review-images="${gallery}" data-review-image-index="${index}" aria-label="${currentLang==='pl'?'Otwórz zdjęcie opinii':'Open review photo'} ${index+1}"><img src="${escapeHtml(src)}" alt="${currentLang==='pl'?'Zdjęcie dodane do opinii':'Photo added to review'} ${index+1}" loading="lazy"></button>`).join('')}</div>`;
}

function renderReviews(){
  let local=JSON.parse(localStorage.getItem('amberflo-reviews')||'[]').filter(r=>r.status==='approved');
  let reviews=[...seedReviews,...local];
  $('#reviewsGrid').innerHTML=reviews.slice(0,6).map(r=>`<article class="review-card"><div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><blockquote>${typeof r.content==='object'?r.content[currentLang]:`“${escapeHtml(r.content)}”`}</blockquote>${reviewImageGrid(reviewImages(r))}<footer><b>${escapeHtml(r.name)}</b><small>${r.date||''}</small></footer></article>`).join('');
}

function updateReviewGallery(index){
  if(!activeReviewGallery.length)return;
  activeReviewGalleryIndex=(index+activeReviewGallery.length)%activeReviewGallery.length;
  const image=$('#reviewPhotoImage');
  if(image)image.src=activeReviewGallery[activeReviewGalleryIndex];
  const counter=$('#reviewPhotoCounter');
  if(counter)counter.textContent=`${activeReviewGalleryIndex+1} / ${activeReviewGallery.length}`;
  document.querySelectorAll('[data-review-gallery-nav]').forEach(button=>button.hidden=activeReviewGallery.length<2);
  const thumbs=$('#reviewPhotoThumbs');
  if(thumbs){
    thumbs.hidden=activeReviewGallery.length<2;
    thumbs.innerHTML=activeReviewGallery.map((src,i)=>`<button type="button" class="review-photo-modal-thumb ${i===activeReviewGalleryIndex?'active':''}" data-review-gallery-index="${i}" aria-label="${currentLang==='pl'?'Pokaż zdjęcie':'Show photo'} ${i+1}"><img src="${escapeHtml(src)}" alt=""></button>`).join('');
  }
}

function openReviewGallery(images,index=0){
  activeReviewGallery=Array.isArray(images)?images.filter(Boolean):[];
  if(!activeReviewGallery.length)return;
  updateReviewGallery(index);
  $('#reviewPhotoModal').showModal();
}

function reviewFileName(file){
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
  const base=file.name.replace(/\.[^.]+$/,'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'zdjecie-opinii';
  return `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${base}.${ext}`;
}

async function uploadReviewImage(file){
  const path=`pending/${reviewFileName(file)}`;
  const encoded=path.split('/').map(encodeURIComponent).join('/');
  const response=await fetch(`${cfg.supabaseUrl}/storage/v1/object/${REVIEW_IMAGE_BUCKET}/${encoded}`,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});
  if(!response.ok){
    const body=await response.json().catch(()=>({}));
    const message=body.message||body.error||'';
    if(/bucket|not found|row-level security|policy/i.test(message))throw new Error('Zdjęcia opinii nie są jeszcze włączone w Supabase. Uruchom plik supabase/review-images-upgrade.sql w SQL Editorze.');
    throw new Error(message||`Nie udało się wysłać zdjęcia: ${file.name}`);
  }
  return `${cfg.supabaseUrl}/storage/v1/object/public/${REVIEW_IMAGE_BUCKET}/${encoded}`;
}

async function submitReview(form){
  const data=Object.fromEntries(new FormData(form));
  const files=[...(form.elements.photos?.files||[])];
  const status=$('#reviewStatus');
  status.textContent='…';
  try{
    if(files.length>REVIEW_IMAGE_LIMIT)throw new Error(`Możesz dodać maksymalnie ${REVIEW_IMAGE_LIMIT} zdjęcia.`);
    for(const file of files){
      if(!REVIEW_IMAGE_TYPES.includes(file.type))throw new Error(`Plik ${file.name} ma nieobsługiwany format. Dodaj JPG, PNG, WEBP, GIF albo AVIF.`);
      if(file.size>REVIEW_IMAGE_MAX_SIZE)throw new Error(`Plik ${file.name} jest większy niż 8 MB.`);
    }
    const images=cfg.supabaseUrl&&cfg.supabaseAnonKey?await Promise.all(files.map(uploadReviewImage)):[];
    const payload={name:data.name,email:data.email,rating:Number(data.rating),content:data.content,status:'pending',images};
    if(!images.length)delete payload.images;
    if(cfg.supabaseUrl&&cfg.supabaseAnonKey){
      const res=await fetch(`${cfg.supabaseUrl}/rest/v1/reviews`,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload)});
      if(!res.ok){
        const body=await res.json().catch(()=>({}));
        const message=body.message||body.details||body.hint||body.error||'';
        if(/images|schema cache|column/i.test(message))throw new Error('Baza Supabase nie ma jeszcze pola na zdjęcia opinii. Uruchom plik supabase/review-images-upgrade.sql w SQL Editorze.');
        throw new Error(message||'Nie udało się zapisać opinii w Supabase.');
      }
      const notification=await fetch(`${cfg.supabaseUrl}/functions/v1/notify`,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json'},body:JSON.stringify({type:'review',payload:{name:payload.name,rating:payload.rating,content:payload.content,images}})});
      if(!notification.ok)console.warn('Powiadomienie e-mail nie zostało wysłane:',await notification.text());
    }else{
      const saved=JSON.parse(localStorage.getItem('amberflo-reviews')||'[]');
      saved.push({...payload,date:new Date().getFullYear()});
      localStorage.setItem('amberflo-reviews',JSON.stringify(saved));
    }
    status.textContent=t('reviewThanks');
    form.reset();
  }catch(e){
    status.textContent=e.message || (currentLang==='pl'?'Nie udało się wysłać opinii. Spróbuj ponownie.':'Could not send your review. Please try again.');
  }
}

const submitReviewBase = submitReview;
submitReview = async function(form){
  const textarea=form.elements.content;
  const status=$('#reviewStatus');
  if(textarea)textarea.value=String(textarea.value||'').trim();
  const content=textarea?textarea.value:'';
  if(content.length<5){
    status.textContent='Wpisz treść opinii — minimum 5 znaków.';
    return;
  }
  if(content.length>700){
    status.textContent='Treść opinii może mieć maksymalnie 700 znaków.';
    return;
  }
  return submitReviewBase(form);
};

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add],[data-modal-add]');if(add){addToCart(add.dataset.add||add.dataset.modalAdd);if(add.dataset.modalAdd)$('#productModal').close()}
  const detail=e.target.closest('[data-detail]');if(detail)openProduct(detail.dataset.detail);
  const galleryNav=e.target.closest('[data-gallery-nav]');if(galleryNav)updateGallery(activeGalleryIndex+Number(galleryNav.dataset.galleryNav));
  const galleryThumb=e.target.closest('[data-gallery-index]');if(galleryThumb)updateGallery(Number(galleryThumb.dataset.galleryIndex));
  const reviewPhoto=e.target.closest('[data-review-images]');if(reviewPhoto){try{openReviewGallery(JSON.parse(decodeURIComponent(reviewPhoto.dataset.reviewImages||'[]')),Number(reviewPhoto.dataset.reviewImageIndex)||0)}catch{}}
  const reviewGalleryNav=e.target.closest('[data-review-gallery-nav]');if(reviewGalleryNav)updateReviewGallery(activeReviewGalleryIndex+Number(reviewGalleryNav.dataset.reviewGalleryNav));
  const reviewGalleryThumb=e.target.closest('[data-review-gallery-index]');if(reviewGalleryThumb)updateReviewGallery(Number(reviewGalleryThumb.dataset.reviewGalleryIndex));
  const qty=e.target.closest('[data-qty]');if(qty)changeQty(qty.dataset.qty,Number(qty.dataset.delta));
  const remove=e.target.closest('[data-remove]');if(remove){cart=cart.filter(x=>x.id!==remove.dataset.remove);saveCart()}
  const filter=e.target.closest('[data-filter]');if(filter){activeFilter=filter.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===filter));renderProducts()}
  const lang=e.target.closest('[data-lang]');if(lang){currentLang=lang.dataset.lang;localStorage.setItem('amberflo-lang',currentLang);updateI18n()}
  const close=e.target.closest('.modal-close');if(close)close.closest('dialog').close();
});
document.addEventListener('change',e=>{const color=e.target.closest('[data-cart-color]');if(color)setCartColor(color.dataset.cartColor,Number(color.dataset.colorIndex),color.value)});
$('#cartButton').onclick=()=>toggleCart(true);$('#closeCart').onclick=()=>toggleCart(false);$('#drawerOverlay').onclick=()=>toggleCart(false);
$('#checkoutButton').onclick=()=>{const missingColor=findMissingCartColor();if(missingColor){toast(t('cartColorMissing'));document.querySelector(`[data-cart-color="${missingColor.id}"][data-color-index="${missingColor.index}"]`)?.focus();return}toggleCart(false);$('#checkoutModal').showModal()};$('#openReview').onclick=()=>$('#reviewModal').showModal();
$('#reviewForm').onsubmit=e=>{e.preventDefault();submitReview(e.target)};$('#checkoutForm').onsubmit=e=>{e.preventDefault();submitOrder(e.target)};
$('.copy-account').onclick=async e=>{try{await navigator.clipboard.writeText(e.currentTarget.dataset.account);toast(t('copied'))}catch{toast(e.currentTarget.dataset.account)}};
$('.menu-toggle').onclick=e=>{const open=$('.main-nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)};document.querySelectorAll('.main-nav a').forEach(a=>a.onclick=()=>$('.main-nav').classList.remove('open'));
document.addEventListener('keydown',e=>{if($('#reviewPhotoModal')?.open&&e.key==='ArrowLeft')updateReviewGallery(activeReviewGalleryIndex-1);else if($('#reviewPhotoModal')?.open&&e.key==='ArrowRight')updateReviewGallery(activeReviewGalleryIndex+1);else if($('#productModal').open&&e.key==='ArrowLeft')updateGallery(activeGalleryIndex-1);else if($('#productModal').open&&e.key==='ArrowRight')updateGallery(activeGalleryIndex+1);else if(e.key==='Enter'&&e.target.matches('[data-detail]'))openProduct(e.target.dataset.detail)});
const observer=new IntersectionObserver(entries=>entries.forEach(x=>x.isIntersecting&&x.target.classList.add('visible')),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
$('#year').textContent=new Date().getFullYear();updateI18n();loadCatalog();
const paymentResult = new URLSearchParams(location.search).get('payment');
if(paymentResult === 'success'){
  cart=[];saveCart();
  setTimeout(()=>toast(currentLang==='pl'?'Płatność przyjęta — dziękujemy za zamówienie!':'Payment received — thank you for your order!'),300);
  history.replaceState({},'',location.pathname+location.hash);
}else if(paymentResult === 'cancelled'){
  setTimeout(()=>toast(currentLang==='pl'?'Płatność anulowana. Produkty pozostały w koszyku.':'Payment cancelled. Your items are still in the cart.'),300);
  history.replaceState({},'',location.pathname+location.hash);
}

// Pobierz tylko zatwierdzone opinie. Gdy Supabase nie jest skonfigurowany, działają opinie demonstracyjne.
async function loadApprovedReviews(){
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)return;
  const headers={apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`};
  const withImages=`${cfg.supabaseUrl}/rest/v1/reviews?status=eq.approved&select=name,rating,content,images,created_at&order=created_at.desc&limit=6`;
  const withoutImages=`${cfg.supabaseUrl}/rest/v1/reviews?status=eq.approved&select=name,rating,content,created_at&order=created_at.desc&limit=6`;
  try{
    let response=await fetch(withImages,{headers});
    if(!response.ok)response=await fetch(withoutImages,{headers});
    const rows=response.ok?await response.json():[];
    if(rows.length){
      rows.forEach(r=>r.date=new Date(r.created_at).getFullYear());
      localStorage.setItem('amberflo-reviews',JSON.stringify(rows.map(r=>({...r,status:'approved',images:r.images||[]}))));
      renderReviews();
    }
  }catch{}
}
loadApprovedReviews();
