const amberfloShipping={methods:[],fallback:[
  {id:'inpost-paczkomat',name_pl:'InPost Paczkomat',name_en:'InPost parcel locker',price_cents:1699},
  {id:'inpost-kurier',name_pl:'InPost Kurier',name_en:'InPost courier',price_cents:1999},
  {id:'dpd-pickup',name_pl:'DPD Pickup / automat paczkowy',name_en:'DPD Pickup / parcel locker',price_cents:1699},
  {id:'dpd-kurier',name_pl:'DPD Kurier',name_en:'DPD courier',price_cents:2199}
]};

const shippingEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shippingMoney=cents=>(Number(cents||0)/100).toLocaleString(currentLang==='pl'?'pl-PL':'en-GB',{style:'currency',currency:'PLN'});

async function loadShippingMethods(){
  try{
    const response=await fetch(`${cfg.supabaseUrl}/rest/v1/shipping_methods?active=eq.true&select=*&order=sort_order.asc`,{headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`}});
    if(!response.ok)throw new Error('shipping');
    const rows=await response.json();amberfloShipping.methods=rows.length?rows:amberfloShipping.fallback;
  }catch{amberfloShipping.methods=amberfloShipping.fallback}
  renderShippingMethods();
}

function selectedShipping(){
  const id=document.querySelector('#shippingMethod')?.value;
  return amberfloShipping.methods.find(method=>method.id===id)||amberfloShipping.methods[0];
}

function productSubtotalCents(){
  return Math.round(cart.reduce((sum,item)=>sum+(products.find(product=>product.id===item.id)?.price||0)*item.qty,0)*100);
}

function renderShippingMethods(){
  const select=document.querySelector('#shippingMethod');if(!select)return;
  const previous=select.value;
  select.innerHTML=amberfloShipping.methods.map(method=>`<option value="${shippingEscape(method.id)}">${shippingEscape(currentLang==='pl'?method.name_pl:method.name_en)} — ${shippingMoney(method.price_cents)}</option>`).join('');
  if(amberfloShipping.methods.some(method=>method.id===previous))select.value=previous;
  updateShippingSummary();
}

function updateShippingSummary(){
  const method=selectedShipping();const subtotal=productSubtotalCents();const shipping=subtotal>=30000?0:Number(method?.price_cents||0);
  const subtotalEl=document.querySelector('#checkoutProductsTotal');const shippingEl=document.querySelector('#checkoutShippingTotal');const totalEl=document.querySelector('#checkoutGrandTotal');
  if(subtotalEl)subtotalEl.textContent=shippingMoney(subtotal);if(shippingEl)shippingEl.textContent=shippingMoney(shipping);if(totalEl)totalEl.textContent=shippingMoney(subtotal+shipping);
  updateShippingPointUi();
}

let inpostAssetsPromise;
function updateShippingPointUi(){
  const method=selectedShipping();const isInpost=method?.id==='inpost-paczkomat';const isDpdPickup=method?.id==='dpd-pickup';
  const picker=document.querySelector('#inpostPointPicker');const pointInput=document.querySelector('#inpostPointName');const help=document.querySelector('#shippingHelp');const mapButton=document.querySelector('#openInpostMap');
  if(picker)picker.hidden=!isInpost;if(pointInput)pointInput.required=isInpost;if(help)help.hidden=!isDpdPickup;
  if(mapButton)mapButton.textContent=currentLang==='pl'?'Wybierz Paczkomat na mapie':'Choose a parcel locker on the map';
}

function loadInpostAssets(){
  if(customElements.get('inpost-geowidget'))return Promise.resolve();
  if(inpostAssetsPromise)return inpostAssetsPromise;
  if(!document.querySelector('#inpostGeowidgetCss')){
    const link=document.createElement('link');link.id='inpostGeowidgetCss';link.rel='stylesheet';link.href='https://geowidget.inpost.pl/inpost-geowidget.css';document.head.append(link);
  }
  inpostAssetsPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('#inpostGeowidgetScript');
    if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}
    const script=document.createElement('script');script.id='inpostGeowidgetScript';script.src='https://geowidget.inpost.pl/inpost-geowidget.js';script.onload=resolve;script.onerror=()=>reject(new Error('Nie udało się wczytać mapy InPost.'));document.head.append(script);
  });
  return inpostAssetsPromise;
}

function inpostPointAddress(point){
  const direct=[point?.address?.line1,point?.address?.line2].filter(Boolean).join(', ');if(direct)return direct;
  const details=point?.address_details||{};return [[details.street,details.building_number].filter(Boolean).join(' '),[details.post_code,details.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

function selectInpostPoint(point){
  const name=String(point?.name||point?.location_code||'').trim();if(!name)return;
  const address=inpostPointAddress(point);const nameInput=document.querySelector('#inpostPointName');const addressInput=document.querySelector('#inpostPointAddress');const summary=document.querySelector('#selectedInpostPoint');
  if(nameInput)nameInput.value=name;if(addressInput)addressInput.value=address;if(summary)summary.innerHTML=`<strong>${shippingEscape(name)}</strong>${address?` · ${shippingEscape(address)}`:''}`;
  document.querySelector('#inpostMapModal')?.close();
}

async function openInpostMap(){
  const token=String(cfg.inpostGeowidgetToken||'').trim();const status=document.querySelector('#checkoutStatus');
  if(!token){status.textContent=currentLang==='pl'?'Mapa Paczkomatów nie jest jeszcze aktywna. Wpisz kod Paczkomatu ręcznie.':'The parcel locker map is not active yet. Enter the locker code manually.';return}
  const modal=document.querySelector('#inpostMapModal');const host=document.querySelector('#inpostMapHost');modal.showModal();host.innerHTML='<p>Wczytywanie mapy…</p>';
  try{
    await loadInpostAssets();host.replaceChildren();const widget=document.createElement('inpost-geowidget');widget.setAttribute('onpoint','amberfloInpostPointSelected');widget.setAttribute('token',token);widget.setAttribute('language',currentLang==='en'?'en':'pl');widget.setAttribute('config','parcelCollect');host.append(widget);
  }catch(error){host.innerHTML=`<p>${shippingEscape(error.message||'Nie udało się wczytać mapy InPost.')}</p>`}
}

document.addEventListener('amberfloInpostPointSelected',event=>selectInpostPoint(event.detail||event.details||{}));
document.querySelector('#openInpostMap')?.addEventListener('click',openInpostMap);
document.querySelector('#inpostPointName')?.addEventListener('input',event=>{const address=document.querySelector('#inpostPointAddress');const summary=document.querySelector('#selectedInpostPoint');if(address)address.value='';if(summary)summary.textContent=event.target.value?`Wybrany kod: ${event.target.value}`:''});

function updateInvoiceFields(){
  const form=document.querySelector('#checkoutForm');const section=document.querySelector('#invoiceFields');if(!form||!section)return;
  const wantsInvoice=form.elements.document_type?.value==='invoice';section.hidden=!wantsInvoice;
  ['invoice_name','tax_id','invoice_address'].forEach(name=>{const input=form.elements[name];if(input)input.required=wantsInvoice});
}

function validPolishNip(value){
  const nip=String(value||'').replace(/\D/g,'');if(nip.length!==10)return false;
  const weights=[6,5,7,2,3,4,5,6,7];const checksum=weights.reduce((sum,weight,index)=>sum+weight*Number(nip[index]),0)%11;
  return checksum<10&&checksum===Number(nip[9]);
}

async function submitOrderWithShipping(form){
  const data=Object.fromEntries(new FormData(form));const items=cart.map(item=>({id:item.id,qty:item.qty}));const status=document.querySelector('#checkoutStatus');const button=form.querySelector('button[type="submit"]');
  if(!items.length){status.textContent=currentLang==='pl'?'Koszyk jest pusty.':'Your cart is empty.';return}
  if(data.document_type==='invoice'&&!validPolishNip(data.tax_id)){status.textContent=currentLang==='pl'?'Sprawdź NIP — powinien zawierać 10 cyfr i mieć prawidłową sumę kontrolną.':'Check the Polish tax ID (NIP).';form.elements.tax_id?.focus();return}
  if(data.shipping_method==='inpost-paczkomat'&&!String(data.inpost_point_name||'').trim()){status.textContent=currentLang==='pl'?'Wybierz Paczkomat na mapie albo wpisz jego kod.':'Choose a parcel locker on the map or enter its code.';document.querySelector('#inpostPointName')?.focus();return}
  button.disabled=true;status.textContent=currentLang==='pl'?'Przygotowujemy zamówienie…':'Preparing your order…';
  const endpoint=data.payment==='online'?'create-checkout':'create-order';
  try{
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/${endpoint}`,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json'},body:JSON.stringify({customer:data,items,shippingMethodId:data.shipping_method,language:currentLang})});
    const result=await response.json();if(!response.ok)throw new Error(result.error||'Nie udało się utworzyć zamówienia.');
    if(data.payment==='online'){if(!result.url)throw new Error('Brak adresu płatności Stripe.');window.location.href=result.url;return}
    status.textContent=currentLang==='pl'?`Zamówienie ${result.orderId.slice(0,8).toUpperCase()} zostało przyjęte. Dane do przelewu znajdują się w sekcji Kontakt.`:`Order ${result.orderId.slice(0,8).toUpperCase()} has been received.`;
    cart=[];saveCart();form.reset();updateInvoiceFields();const pointSummary=document.querySelector('#selectedInpostPoint');if(pointSummary)pointSummary.textContent='';renderShippingMethods();
  }catch(error){status.textContent=error.message||'Nie udało się utworzyć zamówienia.'}
  finally{button.disabled=false}
}

const shippingSelect=document.querySelector('#shippingMethod');
shippingSelect?.addEventListener('change',updateShippingSummary);
document.querySelectorAll('[name="document_type"]').forEach(input=>input.addEventListener('change',updateInvoiceFields));
document.querySelector('#checkoutButton')?.addEventListener('click',()=>setTimeout(updateShippingSummary,0));
document.querySelector('#checkoutForm').onsubmit=event=>{event.preventDefault();submitOrderWithShipping(event.target)};
document.addEventListener('click',event=>{if(event.target.closest('[data-lang]'))setTimeout(renderShippingMethods,0)});
loadShippingMethods();
updateInvoiceFields();
