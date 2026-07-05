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
  const method=selectedShipping();const subtotal=productSubtotalCents();const shipping=subtotal>=50000?0:Number(method?.price_cents||0);
  const subtotalEl=document.querySelector('#checkoutProductsTotal');const shippingEl=document.querySelector('#checkoutShippingTotal');const totalEl=document.querySelector('#checkoutGrandTotal');
  if(subtotalEl)subtotalEl.textContent=shippingMoney(subtotal);if(shippingEl)shippingEl.textContent=shippingMoney(shipping);if(totalEl)totalEl.textContent=shippingMoney(subtotal+shipping);
}

async function submitOrderWithShipping(form){
  const data=Object.fromEntries(new FormData(form));const items=cart.map(item=>({id:item.id,qty:item.qty}));const status=document.querySelector('#checkoutStatus');const button=form.querySelector('button[type="submit"]');
  if(!items.length){status.textContent=currentLang==='pl'?'Koszyk jest pusty.':'Your cart is empty.';return}
  button.disabled=true;status.textContent=currentLang==='pl'?'Przygotowujemy zamówienie…':'Preparing your order…';
  const endpoint=data.payment==='online'?'create-checkout':'create-order';
  try{
    const response=await fetch(`${cfg.supabaseUrl}/functions/v1/${endpoint}`,{method:'POST',headers:{apikey:cfg.supabaseAnonKey,Authorization:`Bearer ${cfg.supabaseAnonKey}`,'Content-Type':'application/json'},body:JSON.stringify({customer:data,items,shippingMethodId:data.shipping_method,language:currentLang})});
    const result=await response.json();if(!response.ok)throw new Error(result.error||'Nie udało się utworzyć zamówienia.');
    if(data.payment==='online'){if(!result.url)throw new Error('Brak adresu płatności Stripe.');window.location.href=result.url;return}
    status.textContent=currentLang==='pl'?`Zamówienie ${result.orderId.slice(0,8).toUpperCase()} zostało przyjęte. Dane do przelewu znajdują się w sekcji Kontakt.`:`Order ${result.orderId.slice(0,8).toUpperCase()} has been received.`;
    cart=[];saveCart();form.reset();renderShippingMethods();
  }catch(error){status.textContent=error.message||'Nie udało się utworzyć zamówienia.'}
  finally{button.disabled=false}
}

const shippingSelect=document.querySelector('#shippingMethod');
shippingSelect?.addEventListener('change',updateShippingSummary);
document.querySelector('#checkoutButton')?.addEventListener('click',()=>setTimeout(updateShippingSummary,0));
document.querySelector('#checkoutForm').onsubmit=event=>{event.preventDefault();submitOrderWithShipping(event.target)};
document.addEventListener('click',event=>{if(event.target.closest('[data-lang]'))setTimeout(renderShippingMethods,0)});
loadShippingMethods();
