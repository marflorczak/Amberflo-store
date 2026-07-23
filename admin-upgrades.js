const orderStatusLabels={awaiting_payment:'Oczekuje na płatność',payment_expired:'Płatność wygasła',payment_failed:'Płatność nieudana',awaiting_transfer:'Oczekuje na przelew',paid:'Opłacone',processing:'W realizacji',shipped:'Wysłane',cancelled:'Anulowane'};
const adminMoney=cents=>(Number(cents||0)/100).toLocaleString('pl-PL',{style:'currency',currency:'PLN'});

function installStoreManagement(){
  const sidebar=document.querySelector('.admin-sidebar');const content=document.querySelector('.admin-content');if(!sidebar||!content)return;
  const storeLink=sidebar.querySelector('a');
  const shippingButton=document.createElement('button');shippingButton.className='admin-tab';shippingButton.dataset.tab='shipping';shippingButton.innerHTML='Dostawa <b id="shippingCount">0</b>';
  const ordersButton=document.createElement('button');ordersButton.className='admin-tab';ordersButton.dataset.tab='orders';ordersButton.innerHTML='Zamówienia <b id="orderCount">0</b>';
  sidebar.insertBefore(shippingButton,storeLink);sidebar.insertBefore(ordersButton,storeLink);
  content.insertAdjacentHTML('beforeend',`<div class="panel" id="shippingPanel"><div class="panel-head"><div><p class="eyebrow">Ustawienia sklepu</p><h1>Dostawa</h1><p>Zmieniaj ceny i dostępność metod dostawy.</p></div></div><div class="shipping-admin-list" id="shippingAdminList"></div></div><div class="panel" id="ordersPanel"><div class="panel-head"><div><p class="eyebrow">Obsługa sprzedaży</p><h1>Zamówienia</h1><p>Kontroluj płatności, status i wysyłaj klientom dane do śledzenia.</p></div></div><div class="admin-note"><b>Ważne:</b> anulowanie zamówienia nie zwraca automatycznie pieniędzy. Przy opłaconym zamówieniu najpierw wykonaj zwrot w Stripe, a następnie kliknij „Anuluj i wyślij e-mail”.</div><div class="orders-admin-list" id="ordersAdminList"></div></div>`);
}

async function loadAdminShipping(){
  const list=document.querySelector('#shippingAdminList');if(!list)return;list.innerHTML='<div class="empty-admin">Wczytywanie…</div>';
  try{const rows=await api('/rest/v1/shipping_methods?select=*&order=sort_order.asc');document.querySelector('#shippingCount').textContent=rows.length;list.innerHTML=rows.map(method=>`<div class="shipping-admin-row" data-shipping-id="${escapeHtml(method.id)}"><label>Nazwa<input data-field="name_pl" value="${escapeHtml(method.name_pl)}"></label><label>Cena brutto (zł)<input data-field="price" type="number" min="0" step="0.01" value="${(method.price_cents/100).toFixed(2)}"></label><label class="check-inline"><input data-field="active" type="checkbox" ${method.active?'checked':''}> Aktywna</label><button data-save-shipping="${escapeHtml(method.id)}">Zapisz</button></div>`).join('')||'<div class="empty-admin">Najpierw uruchom plik supabase/shipping-orders-upgrade.sql.</div>'}
  catch(error){list.innerHTML=`<div class="empty-admin">${escapeHtml(error.message)}. Uruchom plik supabase/shipping-orders-upgrade.sql.</div>`}
}

async function saveShippingMethod(id){
  const row=document.querySelector(`[data-shipping-id="${CSS.escape(id)}"]`);if(!row)return;
  const payload={name_pl:row.querySelector('[data-field="name_pl"]').value.trim(),price_cents:Math.max(0,Math.round(Number(row.querySelector('[data-field="price"]').value)*100)),active:row.querySelector('[data-field="active"]').checked,updated_at:new Date().toISOString()};
  await api(`/rest/v1/shipping_methods?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});toast('Metoda dostawy zapisana.');await loadAdminShipping();
}

function orderCustomer(order){return order.customer||{}}
function renderOrderItemColors(item){const colors=Array.isArray(item.colors)?item.colors:[];return colors.length?`<small class="order-item-colors">${colors.map((color,index)=>`Sztuka ${index+1}: ${escapeHtml(color)}`).join('<br>')}</small>`:''}
function renderOrderItems(order){return (order.items||[]).map(item=>`<li>${escapeHtml(item.name||item.id)} × ${item.quantity||item.qty||1} — ${adminMoney((item.price||0)*(item.quantity||item.qty||1))}${renderOrderItemColors(item)}</li>`).join('')}

async function loadAdminOrders(){
  const list=document.querySelector('#ordersAdminList');if(!list)return;list.innerHTML='<div class="empty-admin">Wczytywanie…</div>';
  try{const rows=await api('/rest/v1/orders?select=*&order=created_at.desc');document.querySelector('#orderCount').textContent=rows.length;list.innerHTML=rows.map(order=>{const customer=orderCustomer(order);const shipping=order.shipping_method||{};const point=customer.inpost_point_name?`<p><b>Paczkomat</b>${escapeHtml(customer.inpost_point_name)}${customer.inpost_point_address?`<br>${escapeHtml(customer.inpost_point_address)}`:''}</p>`:'';const documentInfo=customer.document_type==='invoice'?`<p><b>Dokument</b>Faktura VAT<br>${escapeHtml(customer.invoice_name||'')}<br>NIP: ${escapeHtml(customer.tax_id||'')}<br>${escapeHtml(customer.invoice_address||'').replace(/\n/g,'<br>')}</p>`:customer.document_type==='receipt'?'<p><b>Dokument</b>Paragon</p>':'<p><b>Dokument</b>Brak wyboru (stare zamówienie)</p>';const cancellation=order.status==='cancelled'?`<p><b>Anulowanie</b>${escapeHtml(order.cancellation_reason||'Bez podanego powodu')}<br>${order.cancellation_email_sent_at?'E-mail wysłany':'E-mail nie został jeszcze wysłany'}</p>`:'';const legacyAmberColor=customer.amber_color?`<p><b>Kolor bursztynu</b>${escapeHtml(customer.amber_color)}</p>`:'';const stateClass=order.status==='cancelled'?'order-cancelled':order.status==='payment_expired'?'order-expired':'';return `<article class="order-card ${stateClass}" data-order-id="${escapeHtml(order.id)}"><div class="order-card-head"><div><h3>#${escapeHtml(order.id.slice(0,8).toUpperCase())} · ${escapeHtml(customer.name||'Klient')}</h3><p>${new Date(order.created_at).toLocaleString('pl-PL')} · ${escapeHtml(customer.email||'')} · ${escapeHtml(customer.phone||'')}</p></div><span class="order-status">${escapeHtml(orderStatusLabels[order.status]||order.status)}</span></div><div class="order-details"><p><b>Adres</b>${escapeHtml(customer.address||'').replace(/\n/g,'<br>')}</p>${documentInfo}${point}<p><b>Dostawa</b>${escapeHtml(shipping.name||shipping.name_pl||'—')} · ${adminMoney(order.shipping_cost||0)}</p><p><b>Razem</b>${adminMoney(order.total||0)}</p>${legacyAmberColor}<p><b>Uwagi</b>${escapeHtml(customer.notes||'—')}</p>${cancellation}</div><ul class="order-items">${renderOrderItems(order)}</ul><div class="order-actions"><label>Status<select data-order-status>${Object.entries(orderStatusLabels).map(([value,label])=>`<option value="${value}" ${order.status===value?'selected':''}>${label}</option>`).join('')}</select></label><label>Numer przesyłki<input data-tracking-number value="${escapeHtml(order.tracking_number||'')}"></label><label>Link do śledzenia<input data-tracking-url type="url" value="${escapeHtml(order.tracking_url||'')}"></label><label class="cancellation-reason">Powód anulowania<input data-cancellation-reason value="${escapeHtml(order.cancellation_reason||'')}" placeholder="np. rezygnacja klienta"></label><div class="order-action-buttons"><button class="save-status" data-save-order="${escapeHtml(order.id)}">Zapisz status</button> <button class="ship-button" data-ship-order="${escapeHtml(order.id)}">Oznacz jako wysłane</button> <button class="cancel-button" data-cancel-order="${escapeHtml(order.id)}">Anuluj i wyślij e-mail</button></div></div></article>`}).join('')||'<div class="empty-admin">Nie ma jeszcze zamówień.</div>'}
  catch(error){list.innerHTML=`<div class="empty-admin">${escapeHtml(error.message)}. Uruchom plik supabase/shipping-orders-upgrade.sql.</div>`}
}

async function saveOrderStatus(id){
  const card=document.querySelector(`[data-order-id="${CSS.escape(id)}"]`);const status=card.querySelector('[data-order-status]').value;
  if(status==='cancelled'){await cancelOrder(id);return}
  await api(`/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status,updated_at:new Date().toISOString()})});toast('Status zamówienia zapisany.');await loadAdminOrders();
}

async function cancelOrder(id){
  const card=document.querySelector(`[data-order-id="${CSS.escape(id)}"]`);const reason=card.querySelector('[data-cancellation-reason]').value.trim();
  if(!window.confirm('Czy na pewno anulować zamówienie i powiadomić klienta? Jeśli zamówienie jest opłacone, zwrot pieniędzy wykonaj osobno w Stripe.'))return;
  const response=await fetch(`${config.supabaseUrl}/functions/v1/cancel-order`,{method:'POST',headers:{apikey:config.supabaseAnonKey,Authorization:`Bearer ${state.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({orderId:id,reason})});
  const result=await response.json();if(!response.ok){toast(result.error||'Nie udało się anulować zamówienia.');return}
  if(!result.emailSent&&result.gmailUrl)window.open(result.gmailUrl,'_blank','noopener');else if(!result.emailSent&&result.mailto)window.location.href=result.mailto;
  toast(result.emailSent?'Zamówienie anulowane i e-mail wysłany.':'Zamówienie anulowane. Otwieram gotową wiadomość.');await loadAdminOrders();
}

async function shipOrder(id){
  const card=document.querySelector(`[data-order-id="${CSS.escape(id)}"]`);const trackingNumber=card.querySelector('[data-tracking-number]').value.trim();const trackingUrl=card.querySelector('[data-tracking-url]').value.trim();
  if(!trackingNumber||!trackingUrl){toast('Wpisz numer oraz link do śledzenia.');return}
  const response=await fetch(`${config.supabaseUrl}/functions/v1/ship-order`,{method:'POST',headers:{apikey:config.supabaseAnonKey,Authorization:`Bearer ${state.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({orderId:id,trackingNumber,trackingUrl})});
  const result=await response.json();if(!response.ok){toast(result.error||'Nie udało się oznaczyć wysyłki.');return}
  if(!result.emailSent&&result.gmailUrl)window.open(result.gmailUrl,'_blank','noopener');else if(!result.emailSent&&result.mailto)window.location.href=result.mailto;toast(result.emailSent?'Wysyłka zapisana i e-mail wysłany.':'Wysyłka zapisana. Otwieram gotową wiadomość w Gmailu.');await loadAdminOrders();
}

installStoreManagement();
document.addEventListener('click',event=>{
  const tab=event.target.closest('[data-tab]');if(tab?.dataset.tab==='shipping')loadAdminShipping();if(tab?.dataset.tab==='orders')loadAdminOrders();
  const shipping=event.target.closest('[data-save-shipping]');if(shipping)saveShippingMethod(shipping.dataset.saveShipping).catch(error=>toast(error.message));
  const saveOrder=event.target.closest('[data-save-order]');if(saveOrder)saveOrderStatus(saveOrder.dataset.saveOrder).catch(error=>toast(error.message));
  const ship=event.target.closest('[data-ship-order]');if(ship)shipOrder(ship.dataset.shipOrder).catch(error=>toast(error.message));
  const cancel=event.target.closest('[data-cancel-order]');if(cancel)cancelOrder(cancel.dataset.cancelOrder).catch(error=>toast(error.message));
});
