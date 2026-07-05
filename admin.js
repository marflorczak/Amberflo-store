const config=window.AMBERFLO_CONFIG||{};
const state={session:null,products:[],reviews:[],editingId:null,gallery:[],mainImage:''};
const $=selector=>document.querySelector(selector);
const escapeHtml=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const slug=value=>String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);

function authHeaders(json=true){const headers={apikey:config.supabaseAnonKey,Authorization:`Bearer ${state.session?.access_token||config.supabaseAnonKey}`};if(json)headers['Content-Type']='application/json';return headers;}
async function fetchWithTimeout(url,options={},timeout=15000){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
  try{return await fetch(url,{...options,signal:controller.signal})}
  catch(error){if(error.name==='AbortError')throw new Error('Serwer nie odpowiedział w ciągu 15 sekund. Odśwież stronę i spróbuj ponownie.');throw error}
  finally{clearTimeout(timer)}
}
async function api(path,options={}){const response=await fetchWithTimeout(`${config.supabaseUrl}${path}`,{...options,headers:{...authHeaders(options.json!==false),...(options.headers||{})}});if(!response.ok){let message=`Błąd ${response.status}`;try{const body=await response.json();message=body.message||body.error_description||body.error||message}catch{}throw new Error(message)}if(response.status===204||response.headers.get('content-length')==='0')return null;const text=await response.text();return text?JSON.parse(text):null;}
function toast(message){const el=$('#adminToast');el.textContent=message;el.classList.add('show');clearTimeout(window.adminToastTimer);window.adminToastTimer=setTimeout(()=>el.classList.remove('show'),2500)}
function setLoginStatus(message){$('#loginStatus').textContent=message||''}

function verifyAdmin(){
  const expected=String(config.adminEmail||'biuroamberflo@gmail.com').trim().toLowerCase();
  const actual=String(state.session?.user?.email||'').trim().toLowerCase();
  if(!actual||actual!==expected)throw new Error('To konto nie ma uprawnień administratora.');
}
async function login(email,password){
  setLoginStatus('Sprawdzanie e-maila i hasła…');
  const response=await fetchWithTimeout(`${config.supabaseUrl}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:config.supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const body=await response.json();if(!response.ok){const message=body.error_description||body.msg||'';if(/invalid login credentials/i.test(message))throw new Error('Nieprawidłowy e-mail lub hasło ustawione w Supabase.');if(/email not confirmed/i.test(message))throw new Error('Adres e-mail administratora nie został potwierdzony w Supabase.');throw new Error(message||'Nie udało się zalogować.');}
  state.session=body;setLoginStatus('Sprawdzanie uprawnień administratora…');await verifyAdmin();sessionStorage.setItem('amberflo-admin-session',JSON.stringify(body));showDashboard();
}
function logout(){state.session=null;sessionStorage.removeItem('amberflo-admin-session');$('#adminView').hidden=true;$('#loginView').hidden=false;$('#loginForm').reset();setLoginStatus('')}
async function showDashboard(){
  $('#loginView').hidden=true;$('#adminView').hidden=false;$('#adminEmail').textContent=state.session.user.email;
  await Promise.all([loadProducts(),loadReviews()]);
}

async function loadProducts(){state.products=await api('/rest/v1/products?select=*&order=sort_order.asc');renderProducts()}
function renderProducts(){
  $('#productCount').textContent=state.products.length;
  $('#adminProducts').innerHTML=state.products.length?state.products.map(product=>`<article class="admin-product"><img src="${escapeHtml(product.main_image||product.gallery?.[0]||'LOGO.png')}" alt=""><div><h3>${escapeHtml(product.name_pl)} <span class="visibility ${product.active?'':'hidden'}">${product.active?'Widoczny':'Ukryty'}</span></h3><p>${escapeHtml(product.category)} · ${escapeHtml(product.height||'—')} · ${escapeHtml(product.pieces||'—')} bryłek</p><strong>${Number(product.price).toLocaleString('pl-PL')} zł</strong></div><div class="product-actions"><button data-edit-product="${escapeHtml(product.id)}">Edytuj</button><button data-toggle-product="${escapeHtml(product.id)}">${product.active?'Ukryj':'Pokaż'}</button><button class="danger" data-delete-product="${escapeHtml(product.id)}">Usuń</button></div></article>`).join(''):'<div class="empty-admin">Nie ma jeszcze produktów. Dodaj pierwszy produkt.</div>';
}

async function loadReviews(){try{state.reviews=await api('/rest/v1/reviews?select=*&order=created_at.desc');renderReviews()}catch{state.reviews=[];renderReviews()}}
function renderReviews(){
  const pending=state.reviews.filter(review=>review.status==='pending').length;$('#reviewCount').textContent=pending;
  $('#adminReviews').innerHTML=state.reviews.length?state.reviews.map(review=>`<article class="review-admin-card"><header><div><b>${escapeHtml(review.name)}</b> · ${'★'.repeat(Number(review.rating)||0)}</div><small>${new Date(review.created_at).toLocaleDateString('pl-PL')} · ${escapeHtml(review.status)}</small></header><p>${escapeHtml(review.content)}</p><footer>${review.status!=='approved'?`<button class="approve" data-review-status="approved" data-review-id="${review.id}">Zatwierdź</button>`:''}${review.status!=='rejected'?`<button class="reject" data-review-status="rejected" data-review-id="${review.id}">Odrzuć</button>`:''}<button data-delete-review="${review.id}">Usuń</button></footer></article>`).join(''):'<div class="empty-admin">Nie ma jeszcze opinii.</div>';
}

function fillForm(product){
  const form=$('#productForm');form.reset();
  const values=product||{id:'',sort_order:(state.products.at(-1)?.sort_order||0)+10,name_pl:'',name_en:'',description_pl:'',description_en:'',price:'',category:'classic',height:'',width:'',pieces:'',badge_pl:'',badge_en:'',active:true};
  Object.entries(values).forEach(([key,value])=>{const field=form.elements.namedItem(key);if(!field)return;if(field.type==='checkbox')field.checked=Boolean(value);else if(!Array.isArray(value)&&value!==null)field.value=value});
  state.editingId=product?.id||null;state.gallery=[...(product?.gallery||[])];state.mainImage=product?.main_image||state.gallery[0]||'';
  form.elements.id.readOnly=Boolean(product);$('#editorTitle').textContent=product?'Edytuj produkt':'Nowy produkt';$('#editorStatus').textContent='';$('#imageFiles').value='';renderGalleryEditor();$('#productEditor').showModal();
}
function renderGalleryEditor(){
  $('#galleryEditor').innerHTML=state.gallery.length?state.gallery.map((src,index)=>`<div class="gallery-edit-item ${src===state.mainImage?'main':''}"><img src="${escapeHtml(src)}" alt="Zdjęcie ${index+1}"><button type="button" class="remove-image" data-remove-image="${index}" aria-label="Usuń zdjęcie">×</button><button type="button" data-main-image="${index}">${src===state.mainImage?'Zdjęcie główne':'Ustaw jako główne'}</button></div>`).join(''):'<div class="empty-admin">Dodaj co najmniej jedno zdjęcie produktu.</div>';
}
async function uploadFile(file,productId){
  if(file.size>10*1024*1024)throw new Error(`Plik ${file.name} jest większy niż 10 MB.`);
  const path=`${slug(productId)}/${Date.now()}-${Math.random().toString(36).slice(2,7)}-${slug(file.name.replace(/\.[^.]+$/,''))}.${(file.name.split('.').pop()||'webp').toLowerCase()}`;
  const encoded=path.split('/').map(encodeURIComponent).join('/');
  const response=await fetch(`${config.supabaseUrl}/storage/v1/object/product-images/${encoded}`,{method:'POST',headers:{...authHeaders(false),'Content-Type':file.type||'application/octet-stream','x-upsert':'false'},body:file});
  if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.message||`Nie udało się wysłać ${file.name}`)}
  return `${config.supabaseUrl}/storage/v1/object/public/product-images/${encoded}`;
}
async function saveProduct(form){
  const status=$('#editorStatus');const button=$('#saveProduct');status.textContent='Zapisywanie…';button.disabled=true;
  try{
    const data=Object.fromEntries(new FormData(form));const id=state.editingId||slug(data.id||data.name_pl);if(!id)throw new Error('Podaj nazwę lub ID produktu.');
    const files=[...$('#imageFiles').files];for(const file of files){const url=await uploadFile(file,id);state.gallery.push(url);if(!state.mainImage)state.mainImage=url}
    if(!state.gallery.length&&state.mainImage)state.gallery=[state.mainImage];if(!state.gallery.length)throw new Error('Dodaj co najmniej jedno zdjęcie.');
    if(!state.gallery.includes(state.mainImage))state.mainImage=state.gallery[0];
    const payload={id,name_pl:data.name_pl.trim(),name_en:data.name_en.trim(),description_pl:data.description_pl.trim(),description_en:data.description_en.trim(),price:Math.round(Number(data.price)),category:data.category,height:data.height.trim(),width:data.width.trim(),pieces:data.pieces.trim(),badge_pl:data.badge_pl.trim(),badge_en:data.badge_en.trim(),main_image:state.mainImage,gallery:state.gallery,active:form.elements.active.checked,sort_order:Number(data.sort_order)||0,updated_at:new Date().toISOString()};
    if(state.editingId)await api(`/rest/v1/products?id=eq.${encodeURIComponent(state.editingId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});else await api('/rest/v1/products',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)});
    $('#productEditor').close();await loadProducts();toast('Produkt zapisany.');
  }catch(error){status.textContent=error.message}finally{button.disabled=false}
}

document.addEventListener('click',async event=>{
  const tab=event.target.closest('[data-tab]');if(tab){document.querySelectorAll('.admin-tab').forEach(button=>button.classList.toggle('active',button===tab));document.querySelectorAll('.panel').forEach(panel=>panel.classList.toggle('active',panel.id===`${tab.dataset.tab}Panel`))}
  const edit=event.target.closest('[data-edit-product]');if(edit)fillForm(state.products.find(product=>product.id===edit.dataset.editProduct));
  const toggle=event.target.closest('[data-toggle-product]');if(toggle){const product=state.products.find(item=>item.id===toggle.dataset.toggleProduct);await api(`/rest/v1/products?id=eq.${encodeURIComponent(product.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({active:!product.active,updated_at:new Date().toISOString()})});await loadProducts();toast(product.active?'Produkt ukryty.':'Produkt opublikowany.')}
  const remove=event.target.closest('[data-remove-image]');if(remove){const index=Number(remove.dataset.removeImage);const removed=state.gallery[index];state.gallery.splice(index,1);if(removed===state.mainImage)state.mainImage=state.gallery[0]||'';renderGalleryEditor()}
  const main=event.target.closest('[data-main-image]');if(main){state.mainImage=state.gallery[Number(main.dataset.mainImage)];renderGalleryEditor()}
  const del=event.target.closest('[data-delete-product]');if(del&&confirm('Usunąć ten produkt na stałe?')){await api(`/rest/v1/products?id=eq.${encodeURIComponent(del.dataset.deleteProduct)}`,{method:'DELETE'});await loadProducts();toast('Produkt usunięty.')}
  const reviewStatus=event.target.closest('[data-review-status]');if(reviewStatus){await api(`/rest/v1/reviews?id=eq.${reviewStatus.dataset.reviewId}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:reviewStatus.dataset.reviewStatus})});await loadReviews();toast('Status opinii zmieniony.')}
  const deleteReview=event.target.closest('[data-delete-review]');if(deleteReview&&confirm('Usunąć opinię na stałe?')){await api(`/rest/v1/reviews?id=eq.${deleteReview.dataset.deleteReview}`,{method:'DELETE'});await loadReviews();toast('Opinia usunięta.')}
});

$('#loginForm').addEventListener('submit',async event=>{event.preventDefault();const button=event.target.querySelector('button[type="submit"]');button.disabled=true;const data=new FormData(event.target);try{await login(data.get('email'),data.get('password'))}catch(error){state.session=null;setLoginStatus(error.message)}finally{button.disabled=false}});
$('#logoutButton').onclick=logout;$('#addProduct').onclick=()=>fillForm();document.querySelectorAll('.close-editor').forEach(button=>button.onclick=()=>$('#productEditor').close());$('#productForm').addEventListener('submit',event=>{event.preventDefault();saveProduct(event.target)});

(async function init(){
  if(!config.supabaseUrl||!config.supabaseAnonKey){$('#setupWarning').hidden=false;$('#loginForm').querySelector('button').disabled=true;return}
  try{const saved=JSON.parse(sessionStorage.getItem('amberflo-admin-session')||'null');if(saved?.access_token&&saved?.user){state.session=saved;await verifyAdmin();await showDashboard()}}catch{logout()}
})();
