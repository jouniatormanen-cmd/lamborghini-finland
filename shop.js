(()=>{
  const euro=n=>new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const products=[...document.querySelectorAll('.product')].map((card,i)=>({
    id:card.querySelector('.sku')?.textContent.trim()||String(i),
    name:card.querySelector('h3')?.textContent.trim()||'Kello',
    price:Number((card.querySelector('.price')?.textContent||'').replace(/[^0-9,]/g,'').replace(',','.'))||0,
    image:card.querySelector('img')?.src||'',
    sku:card.querySelector('.sku')?.textContent.trim()||''
  }));
  if(!products.length)return;
  let cart={};
  const style=document.createElement('style');
  style.textContent=`
    .shop-actions{display:flex;gap:8px;margin-top:12px}
    .add-cart{flex:1;background:var(--gold);color:#111;border:0;padding:12px 9px;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:700;cursor:pointer}
    .add-cart:hover{background:var(--gold2)}
    .cart-open{border:1px solid var(--gold);background:transparent;color:var(--gold2);padding:10px 14px;font-size:10px;letter-spacing:1px;cursor:pointer;white-space:nowrap}
    .cart-count{display:inline-grid;place-items:center;background:var(--gold);color:#111;border-radius:50%;width:19px;height:19px;margin-left:5px;font-weight:700}
    .shop-backdrop{position:fixed;inset:0;background:#000b;z-index:30;display:none}
    .shop-backdrop.open{display:block}
    .shop-panel{position:absolute;right:0;top:0;height:100%;width:min(560px,100%);overflow:auto;background:#111;border-left:1px solid var(--line);padding:24px;color:var(--white)}
    .shop-panel h2,.shop-panel h3{font-family:'Cormorant Garamond',serif;font-weight:500}
    .shop-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:14px}
    .shop-close{background:none;border:1px solid var(--line);color:var(--gold2);padding:8px 12px;cursor:pointer}
    .cart-row{display:grid;grid-template-columns:76px 1fr auto;gap:12px;align-items:center;padding:16px 0;border-bottom:1px solid #30291e}
    .cart-row img{width:76px;height:76px;object-fit:contain;background:#211e19}
    .cart-row strong{font-size:12px;display:block;line-height:1.5}
    .cart-row small{display:block;color:var(--muted);margin-top:5px}
    .qty{display:flex;align-items:center;gap:8px;margin-top:8px}
    .qty button{background:#211e19;border:1px solid var(--line);color:var(--gold2);width:27px;height:27px;cursor:pointer}
    .remove-item{background:none;border:0;color:#b8a98b;text-decoration:underline;font-size:10px;cursor:pointer;margin-top:6px}
    .cart-total{display:flex;justify-content:space-between;padding:18px 0;font-size:17px;border-bottom:1px solid var(--line)}
    .shop-checkout{margin-top:20px}
    .shop-checkout label{display:block;font-size:11px;color:#d9d1c2;margin:12px 0 5px}
    .shop-checkout input,.shop-checkout textarea{width:100%;background:#090909;border:1px solid #393126;color:white;padding:12px;outline:none}
    .shop-checkout input:focus,.shop-checkout textarea:focus{border-color:var(--gold)}
    .pay-choice{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--gold);padding:13px;margin-top:8px}
    .pay-choice input{width:auto;margin-top:3px}
    .checkout-submit{width:100%;margin-top:18px;background:var(--gold);border:0;color:#111;padding:15px;text-transform:uppercase;letter-spacing:1.5px;font-size:11px;font-weight:700;cursor:pointer}
    .shop-disclaimer{font-size:11px;color:#a7a39a;line-height:1.7;margin-top:14px}
    .shop-empty{color:var(--muted);padding:25px 0;line-height:1.7}
    .shop-notice{background:#211e19;border:1px solid var(--line);padding:12px;font-size:11px;line-height:1.7;margin-top:14px;color:#d9d1c2}
    @media(max-width:560px){.nav{flex-wrap:wrap}.cart-open{margin-left:auto}.shop-panel{padding:18px}}
  `;
  document.head.appendChild(style);
  const nav=document.querySelector('.nav');
  const open=document.createElement('button');open.className='cart-open';open.type='button';open.innerHTML='OSTOSKORI <span class="cart-count">0</span>';nav.appendChild(open);
  const backdrop=document.createElement('div');backdrop.className='shop-backdrop';backdrop.innerHTML=`
    <aside class="shop-panel" role="dialog" aria-modal="true" aria-label="Ostoskori ja kassa">
      <div class="shop-head"><div><div class="eyebrow">Your selection</div><h2 style="font-size:34px;margin:5px 0">Ostoskori</h2></div><button class="shop-close" type="button">Sulje ✕</button></div>
      <div class="cart-lines"></div><div class="cart-total"><span>Yhteensä</span><strong class="cart-sum">0 €</strong></div>
      <form class="shop-checkout">
        <h3 style="font-size:29px;margin:22px 0 5px">Tilaustiedot</h3>
        <label for="buyer-name">Nimi *</label><input id="buyer-name" name="name" autocomplete="name" required>
        <label for="buyer-email">Sähköposti *</label><input id="buyer-email" name="email" type="email" autocomplete="email" required>
        <label for="buyer-phone">Puhelin *</label><input id="buyer-phone" name="phone" type="tel" autocomplete="tel" required>
        <label for="buyer-address">Katuosoite *</label><input id="buyer-address" name="address" autocomplete="street-address" required>
        <label for="buyer-postcode">Postinumero *</label><input id="buyer-postcode" name="postcode" autocomplete="postal-code" required>
        <label for="buyer-city">Postitoimipaikka *</label><input id="buyer-city" name="city" autocomplete="address-level2" required>
        <label>Maksutapa</label>
        <label class="pay-choice"><input type="radio" name="payment" value="invoice" checked><span><strong>Lasku</strong><br><small>Valittu maksutapa. Laskutuksen ja mahdollisen luottotarkistuksen ehdot vahvistetaan ennen varsinaista käyttöönottoa.</small></span></label>
        <label for="buyer-note">Lisätiedot (vapaaehtoinen)</label><textarea id="buyer-note" name="note" rows="3"></textarea>
        <button class="checkout-submit" type="submit">Jatka laskutilauksen vahvistukseen</button>
        <p class="shop-disclaimer">Tämä on verkkokaupan rakennusvaiheen kassaprototyyppi. Tilaus ei vielä lähde myyjälle eikä laskua muodosteta tai lähetetä. Maksupalvelu, tilausjärjestelmä, toimitus- ja palautusehdot sekä myyjän tiedot liitetään ennen myynnin avaamista.</p>
        <div class="shop-notice" role="status">Luksustuotteiden laskumaksu edellyttää selkeitä maksuehtoja ja toimivaa laskutusprosessia. Lopullinen laskukumppani ja mahdollinen asiakkaan luottotarkistus päätetään ennen julkaisua.</div>
      </form>
    </aside>`;
  document.body.appendChild(backdrop);
  const lines=backdrop.querySelector('.cart-lines'),sum=backdrop.querySelector('.cart-sum'),count=open.querySelector('.cart-count');
  function render(){
    const entries=Object.entries(cart).filter(([,q])=>q>0);
    count.textContent=entries.reduce((n,[,q])=>n+q,0);
    lines.innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>x.id===id);return `<div class="cart-row"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><small>${p.sku}</small><div class="qty"><button type="button" data-change="-1" data-id="${id}" aria-label="Vähennä">−</button><span>${q} kpl</span><button type="button" data-change="1" data-id="${id}" aria-label="Lisää">+</button></div><button type="button" class="remove-item" data-remove="${id}">Poista</button></div><strong>${euro(p.price*q)}</strong></div>`}).join(''):'<p class="shop-empty">Ostoskori on vielä tyhjä. Lisää mallistosta haluamasi kello.</p>';
    sum.textContent=euro(entries.reduce((n,[id,q])=>n+products.find(p=>p.id===id).price*q,0));
  }
  function show(){render();backdrop.classList.add('open');document.body.style.overflow='hidden'}
  function hide(){backdrop.classList.remove('open');document.body.style.overflow=''}
  open.addEventListener('click',show);backdrop.querySelector('.shop-close').addEventListener('click',hide);
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)hide()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
  document.querySelectorAll('.product').forEach((card,i)=>{
    const actions=document.createElement('div');actions.className='shop-actions';
    const btn=document.createElement('button');btn.type='button';btn.className='add-cart';btn.textContent='Lisää ostoskoriin';
    btn.addEventListener('click',()=>{cart[products[i].id]=(cart[products[i].id]||0)+1;render();open.innerHTML='OSTOSKORI <span class="cart-count">'+Object.values(cart).reduce((a,b)=>a+b,0)+'</span>';});
    actions.appendChild(btn);card.appendChild(actions);
  });
  lines.addEventListener('click',e=>{
    const change=e.target.closest('[data-change]'),remove=e.target.closest('[data-remove]');
    if(change){const id=change.dataset.id;cart[id]=Math.max(0,(cart[id]||0)+Number(change.dataset.change));if(!cart[id])delete cart[id];render()}
    if(remove){delete cart[remove.dataset.remove];render()}
  });
  backdrop.querySelector('form').addEventListener('submit',e=>{
    e.preventDefault();
    if(!Object.values(cart).some(q=>q>0)){alert('Ostoskori on tyhjä.');return}
    const msg=document.createElement('div');msg.className='shop-notice';msg.textContent='Tilaustiedot on täytetty prototyypissä. Tilausta ei lähetetty eikä maksusitoumusta syntynyt, koska laskutus- ja tilauspalvelua ei ole vielä kytketty. Voimme seuraavaksi liittää turvallisen tilausjärjestelmän.';
    const old=backdrop.querySelector('.shop-result');if(old)old.remove();msg.classList.add('shop-result');backdrop.querySelector('.shop-checkout').appendChild(msg);
  });
  render();
})();