// js/script.js - único script (menu común + lógica app)
(function(){
  // --- Keys ---
  const K_ROLE = 'papistear_role';
  const K_PRODUCTS = 'papistear_products';
  const K_VENTAS = 'papistear_ventas';
  const K_CLIENTES = 'papistear_clientes';
  const K_PROVIDERS = 'papistear_providers';

  // --- Default data ---
  const DEFAULT_PRODUCTS = [
    {nombre:'Mojito', categoria:'cocteles', precio:120, cantidad:50, img:'img/Mojito.jpg'},
    {nombre:'Margarita', categoria:'cocteles', precio:140, cantidad:45, img:'img/Margarita.jpg'},
    {nombre:'Piña Colada', categoria:'cocteles', precio:130, cantidad:40, img:'img/PinaColada.jpg'},
    {nombre:'Cuba Libre', categoria:'cocteles', precio:110, cantidad:60, img:'img/CubaLibre.jpg'},
    {nombre:'Tequila Sunrise', categoria:'cocteles', precio:135, cantidad:35, img:'img/TequilaSunrise.jpg'},
    {nombre:'Corona', categoria:'cervezas', precio:60, cantidad:80, img:'img/Corona.jpg'},
    {nombre:'Colimita', categoria:'cervezas', precio:75, cantidad:70, img:'img/Colimita.jpg'},
    {nombre:'Heineken', categoria:'cervezas', precio:85, cantidad:60, img:'img/Heineken.jpg'},
    {nombre:'Nachos con queso y jalapeños', categoria:'snacks', precio:95, cantidad:50, img:'img/Nachos.jpg'},
    {nombre:'Papas a la francesa', categoria:'snacks', precio:70, cantidad:50, img:'img/Papas.jpg'},
    {nombre:'Alitas BBQ', categoria:'snacks', precio:110, cantidad:50, img:'img/AlitasBBQ.jpg'},
    {nombre:'Alitas Búfalo', categoria:'snacks', precio:120, cantidad:50, img:'img/AlitasBufalo.jpg'}
  ];

  const DEFAULT_PROVIDERS = [
    {nombre:'Casa del Ron', productos:['Ron','Soda','Limón']},
    {nombre:'Modelorama', productos:['Corona']},
    {nombre:'Cervecería de Colima', productos:['Colimita']},
    {nombre:'Cuauhtémoc Moctezuma', productos:['Heineken']},
    {nombre:'McCain', productos:['Papas a la francesa']},
    {nombre:'La Costeña', productos:['Nachos','Jalapeños']},
    {nombre:'Bachoco', productos:['Alitas']}
  ];

  // --- Storage init ---
  if(!localStorage.getItem(K_PRODUCTS)) localStorage.setItem(K_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  if(!localStorage.getItem(K_VENTAS)) localStorage.setItem(K_VENTAS, JSON.stringify([]));
  if(!localStorage.getItem(K_CLIENTES)) localStorage.setItem(K_CLIENTES, JSON.stringify([]));
  if(!localStorage.getItem(K_PROVIDERS)) localStorage.setItem(K_PROVIDERS, JSON.stringify(DEFAULT_PROVIDERS));

  // --- Accessors ---
  window.getRole = () => localStorage.getItem(K_ROLE) || null;
  window.setRole = (r) => localStorage.setItem(K_ROLE, r);
  window.logout = () => { localStorage.removeItem(K_ROLE); window.location = 'index.html'; };

  window.getProducts = () => JSON.parse(localStorage.getItem(K_PRODUCTS) || '[]');
  window.setProducts = (arr) => localStorage.setItem(K_PRODUCTS, JSON.stringify(arr));

  window.getVentas = () => JSON.parse(localStorage.getItem(K_VENTAS) || '[]');
  window.setVentas = (arr) => localStorage.setItem(K_VENTAS, JSON.stringify(arr));

  window.getClientes = () => JSON.parse(localStorage.getItem(K_CLIENTES) || '[]');
  window.setClientes = (arr) => localStorage.setItem(K_CLIENTES, JSON.stringify(arr));

  window.getProviders = () => JSON.parse(localStorage.getItem(K_PROVIDERS) || '[]');
  window.setProviders = (arr) => localStorage.setItem(K_PROVIDERS, JSON.stringify(arr));

  // --- Menu renderer (fills #sidebar) ---
  window.renderMenu = (sidebarEl) => {
    if(!sidebarEl) return;
    const role = getRole();
    const inner = document.createElement('div'); inner.className='sidebar-inner';

    if(role === 'admin'){
      inner.innerHTML = `
        <a href="admin_dashboard.html">Dashboard</a>
        <a href="inventario.html">Inventario</a>
        <a href="ventas.html">Registro de Ventas</a>
        <a href="clientes.html">Clientes Frecuentes</a>
        <a href="proveedores.html">Proveedores</a>
        <a href="index.html" id="logoutLink">Cerrar sesión</a>
      `;
    } else {
      inner.innerHTML = `
        <a href="inicio.html">Inicio</a>
        <a href="productos.html">Productos</a>
        <a href="index.html" id="loginLink">Iniciar sesión</a>
      `;
    }
    sidebarEl.innerHTML = '';
    sidebarEl.appendChild(inner);

    // attach logout
    const logoutLink = document.getElementById('logoutLink');
    if(logoutLink){
      logoutLink.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    }
    // attach login redirect
    const loginLink = document.getElementById('loginLink');
    if(loginLink){
      loginLink.addEventListener('click', (e) => { e.preventDefault(); window.location = 'index.html'; });
    }
  };

  // --- DOM helpers for menu open/close & click outside ---
  function setupMenuHandlers(){
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('menuOverlay');

    if(!menuBtn || !sidebar || !overlay) return;

    menuBtn.addEventListener('click', (e) => {
      sidebar.classList.toggle('open');
      overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    });

    // click overlay to close
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.style.display = 'none';
    });

    // close on escape
    document.addEventListener('keydown', (ev) => {
      if(ev.key === 'Escape'){
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      }
    });

    // close when navigating (click on links)
    sidebar.addEventListener('click', (e) => {
      if(e.target.tagName === 'A'){
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      }
    });
  }

  // --- Page-specific renderers and handlers ---
  function initInicio(){
    const sidebar = document.getElementById('sidebar');
    renderMenu(sidebar);

    // Hide socials for admin
    if(getRole() === 'admin'){
      const sp = document.getElementById('socialPanel'); if(sp) sp.style.display='none';
    }

    // Carousels: simple interval
    function initCarousel(trackId, time){
      const track = document.getElementById(trackId);
      if(!track) return;
      let pos = 0;
      const slides = track.children.length;
      setInterval(()=> {
        pos = (pos + 1) % slides;
        track.style.transform = `translateX(-${pos * 100}%)`;
      }, time);
    }
    initCarousel('trackPromos', 3800);
    initCarousel('trackSug', 3400);

    // click image to go to products as client
    document.addEventListener('click', (e)=>{
      const t = e.target;
      if(t.tagName === 'IMG' && t.dataset.link){
        setRole('cliente');
        window.location = t.dataset.link;
      }
    });
  }

  // Render products grid (used in productos.html)
  function renderProductosGrid(){
    const productos = getProducts();
    const coctelesGrid = document.getElementById('coctelesGrid');
    const cervezasGrid = document.getElementById('cervezasGrid');
    const snacksGrid = document.getElementById('snacksGrid');
    if(coctelesGrid) coctelesGrid.innerHTML = '';
    if(cervezasGrid) cervezasGrid.innerHTML = '';
    if(snacksGrid) snacksGrid.innerHTML = '';

    productos.forEach((p, i) => {
      const card = document.createElement('div'); card.className='product-card';
      card.innerHTML = `
        <img src="${p.img}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <div class="small">${p.categoria}</div>
        <div class="price">$${p.precio}</div>
        <div class="small">Disponibles: ${p.cantidad}</div>
        <button class="buyBtn" data-idx="${i}">Comprar</button>
      `;
      if(p.categoria === 'cocteles' && coctelesGrid) coctelesGrid.appendChild(card);
      if(p.categoria === 'cervezas' && cervezasGrid) cervezasGrid.appendChild(card);
      if(p.categoria === 'snacks' && snacksGrid) snacksGrid.appendChild(card);
    });

    // attach buy buttons
    document.querySelectorAll('.buyBtn').forEach(b=>{
      b.addEventListener('click', ()=> abrirModal(Number(b.dataset.idx)));
    });
  }

  // Modal purchase logic (used in productos.html)
  let productoActual = null;
  function abrirModal(idx){
    if(getRole() === 'admin'){ alert('Área solo para clientes. Inicia sesión como cliente.'); window.location='index.html'; return; }
    const productos = getProducts();
    productoActual = productos[idx];
    if(!productoActual){ alert('Producto no encontrado'); return; }
    const compraModal = document.getElementById('compraModal');
    const modalProducto = document.getElementById('modalProducto');
    const clienteNombre = document.getElementById('clienteNombre');
    const metodoPago = document.getElementById('metodoPago');
    const cantidadCompra = document.getElementById('cantidadCompra');
    const totalCompra = document.getElementById('totalCompra');

    modalProducto.textContent = `${productoActual.nombre} — $${productoActual.precio}`;
    cantidadCompra.value = 1;
    totalCompra.textContent = productoActual.precio;
    clienteNombre.value = '';
    metodoPago.value = 'efectivo';
    compraModal.style.display = 'flex';
  }

  function setupModalHandlers(){
    const compraModal = document.getElementById('compraModal');
    if(!compraModal) return;
    const modalProducto = document.getElementById('modalProducto');
    const clienteNombre = document.getElementById('clienteNombre');
    const metodoPago = document.getElementById('metodoPago');
    const cantidadCompra = document.getElementById('cantidadCompra');
    const totalCompra = document.getElementById('totalCompra');
    const confirmarCompra = document.getElementById('confirmarCompra');
    const cancelarCompra = document.getElementById('cancelarCompra');

    if(cantidadCompra){
      cantidadCompra.addEventListener('input', ()=> {
        let cant = Math.max(1, Math.floor(Number(cantidadCompra.value) || 1));
        if(productoActual && cant > productoActual.cantidad) cant = productoActual.cantidad;
        cantidadCompra.value = cant;
        totalCompra.textContent = productoActual ? (productoActual.precio * cant) : 0;
      });
    }

    if(cancelarCompra) cancelarCompra.addEventListener('click', ()=> compraModal.style.display='none');

    if(confirmarCompra) confirmarCompra.addEventListener('click', ()=>{
      const nombre = clienteNombre.value.trim();
      if(!nombre){ alert('Ingrese nombre del cliente.'); return; }
      const metodo = metodoPago.value;
      const cant = Math.max(1, Math.floor(Number(cantidadCompra.value) || 1));
      const productos = getProducts();
      const idx = productos.findIndex(p => p.nombre === productoActual.nombre && p.precio === productoActual.precio);
      if(idx === -1){ alert('Producto no encontrado'); return; }
      if(productos[idx].cantidad < cant){ alert('No hay suficiente inventario.'); return; }

      // update product stock
      productos[idx].cantidad -= cant;
      setProducts(productos);

      // save sale
      const ventas = getVentas();
      ventas.push({ producto: productos[idx].nombre, cliente: nombre, precio: productos[idx].precio, cantidad: cant, metodo, fecha: new Date().toLocaleString() });
      setVentas(ventas);

      // update clients
      const clientes = getClientes();
      const cIdx = clientes.findIndex(c => c.nombre.toLowerCase() === nombre.toLowerCase());
      if(cIdx !== -1) clientes[cIdx].compras = (clientes[cIdx].compras || 0) + cant;
      else clientes.push({ nombre, compras: cant });
      setClientes(clientes);

      alert('Compra realizada. Total: $' + (productos[idx].precio * cant));
      compraModal.style.display='none';

      // re-render products if on productos.html
      if(document.getElementById('coctelesGrid')) renderProductosGrid();
    });
  }

  // INVENTORY (admin)
  function initInventario(){
    // protect
    if(getRole() !== 'admin'){ alert('Acceso restringido. Debes ingresar como administrador.'); window.location='index.html'; return; }
    const tbody = document.querySelector('#invTable tbody');
    function renderInv(){
      const productos = getProducts();
      tbody.innerHTML = '';
      productos.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.nombre}</td><td>${p.categoria}</td><td>$${p.precio}</td><td><input type="number" min="0" value="${p.cantidad}" data-idx="${idx}" style="width:80px;padding:6px;border-radius:6px;border:none;background:rgba(255,255,255,0.03);color:#fff;"></td>`;
        tbody.appendChild(tr);
      });
    }
    renderInv();

    document.getElementById('saveInv').addEventListener('click', ()=>{
      const inputs = document.querySelectorAll('#invTable input[type="number"]');
      const productos = getProducts();
      inputs.forEach(inp=>{
        const idx = Number(inp.dataset.idx);
        productos[idx].cantidad = Math.max(0, Math.floor(Number(inp.value) || 0));
      });
      setProducts(productos);
      alert('Inventario actualizado.');
      renderInv();
    });

    document.getElementById('resetInv').addEventListener('click', ()=>{
      if(!confirm('Restablecer todas las cantidades a 35?')) return;
      const productos = getProducts();
      productos.forEach(p => p.cantidad = 35);
      setProducts(productos);
      renderInv();
      alert('Inventario restablecido a 35 por producto.');
    });
  }

  // VENTAS (admin)
  function initVentas(){
    if(getRole() !== 'admin'){ alert('Acceso restringido'); window.location='index.html'; return; }
    function renderSales(){
      const ventas = getVentas().slice().reverse();
      const cont = document.getElementById('ventasList');
      if(!ventas.length){ cont.innerHTML = '<p class="small">No hay ventas registradas.</p>'; return; }
      cont.innerHTML = '';
      ventas.forEach(v=>{
        const div = document.createElement('div'); div.className='section-box';
        div.innerHTML = `Cliente: ${v.cliente}<br>Producto: ${v.producto}<br>Cantidad: ${v.cantidad}<br>Monto: $${v.precio * v.cantidad}<br>Método: ${v.metodo}<br><small>${v.fecha || ''}</small>`;
        cont.appendChild(div);
      });
    }
    renderSales();
    document.getElementById('clearSales').addEventListener('click', ()=> {
      if(!confirm('Borrar todas las ventas?')) return;
      setVentas([]); renderSales(); alert('Ventas borradas.');
    });
  }

  // CLIENTES (admin)
  function initClientes(){
    if(getRole() !== 'admin'){ alert('Acceso restringido'); window.location='index.html'; return; }
    function renderClients(){
      const clients = getClientes().slice().sort((a,b)=> (b.compras||0)-(a.compras||0));
      const cont = document.getElementById('clientsList'); cont.innerHTML='';
      if(!clients.length){ cont.innerHTML = '<p class="small">No hay clientes registrados.</p>'; return; }
      clients.forEach((c, idx)=>{ const div=document.createElement('div'); div.className='section-box'; div.innerHTML = `<strong>${c.nombre}</strong><br>Compras: ${c.compras}<br><div style="margin-top:8px;"><button data-idx="${idx}" class="incBtn" style="margin-right:8px;" >+1</button><button data-idx="${idx}" class="delBtn">Eliminar</button></div>`; cont.appendChild(div); });
      document.querySelectorAll('.incBtn').forEach(b=> b.addEventListener('click', ()=>{ const i=Number(b.dataset.idx); const arr=getClientes(); arr[i].compras=(arr[i].compras||0)+1; setClientes(arr); renderClients(); }));
      document.querySelectorAll('.delBtn').forEach(b=> b.addEventListener('click', ()=>{ const i=Number(b.dataset.idx); if(!confirm('Eliminar cliente?')) return; const arr=getClientes(); arr.splice(i,1); setClientes(arr); renderClients(); }));
    }
    renderClients();
    document.getElementById('clearClients')?.addEventListener('click', ()=>{ if(!confirm('Borrar todos los clientes?')) return; setClientes([]); renderClients(); alert('Clientes borrados.'); });
  }

  // PROVEEDORES (admin)
  function initProveedores(){
    if(getRole() !== 'admin'){ alert('Acceso restringido'); window.location='index.html'; return; }
    function renderProviders(){
      const provs = getProviders(); const cont = document.getElementById('provList'); cont.innerHTML='';
      provs.forEach((p,idx)=>{ const div=document.createElement('div'); div.className='section-box'; div.innerHTML = `<strong>${p.nombre}</strong><br>Productos: ${p.productos.join(', ')}<br><button data-idx="${idx}" class="delProv" style="margin-top:8px;background:#c44;color:#fff;padding:6px;border:none;border-radius:6px;">Eliminar</button>`; cont.appendChild(div); });
      document.querySelectorAll('.delProv').forEach(b=> b.addEventListener('click', ()=>{ const idx=Number(b.dataset.idx); if(!confirm('Eliminar proveedor?')) return; const arr=getProviders(); arr.splice(idx,1); setProviders(arr); renderProviders(); }));
    }
    renderProviders();
    document.getElementById('addProv')?.addEventListener('click', ()=>{ const name=document.getElementById('provName').value.trim(); const prods=document.getElementById('provProds').value.split(',').map(s=>s.trim()).filter(Boolean); if(!name||!prods.length){ alert('Nombre y productos requeridos'); return; } const arr=getProviders(); arr.push({nombre:name,productos:prods}); setProviders(arr); document.getElementById('provName').value=''; document.getElementById('provProds').value=''; renderProviders(); });
  }

  // ADMIN DASHBOARD
  function initAdminDashboard(){
    if(getRole() !== 'admin'){ alert('Acceso restringido'); window.location='index.html'; return; }
    const summary = document.getElementById('summary');
    const prods = getProducts(), ventas = getVentas(), clientes = getClientes();
    const totalVentas = ventas.reduce((s,v)=> s + (v.precio * v.cantidad),0);
    if(summary) summary.innerHTML = `<div class="section-box">Productos: ${prods.length}<br>Ventas: ${ventas.length}<br>Clientes: ${clientes.length}<br>Total vendido: $${totalVentas}</div>`;
  }

  // LOGIN page handlers
  function initLogin(){
    const sidebar = document.getElementById('sidebar');
    renderMenu(sidebar);

    const adminBtn = document.getElementById('adminBtn');
    const guestBtn = document.getElementById('guestBtn');

    adminBtn?.addEventListener('click', ()=>{
      const pw = document.getElementById('password').value;
      if(pw === 'admin123'){ setRole('admin'); window.location='admin_dashboard.html'; }
      else alert('Contraseña incorrecta');
    });
    guestBtn?.addEventListener('click', ()=>{
      setRole('cliente'); window.location='inicio.html';
    });
  }

  // PROTECT admin pages list
  function protectAdminPages(){
    const path = window.location.pathname.split('/').pop();
    const adminPages = ['inventario.html','ventas.html','clientes.html','proveedores.html','admin_dashboard.html'];
    if(adminPages.includes(path) && getRole() !== 'admin'){
      window.location = 'index.html';
    }
  }

  // General DOMContentLoaded init
  document.addEventListener('DOMContentLoaded', ()=> {
    setupMenuHandlers();
    protectAdminPages();

    // Render menu on all pages' sidebars
    const sidebar = document.getElementById('sidebar');
    if(sidebar) renderMenu(sidebar);

    // Attach page-specific inits by existence of DOM elements
    if(document.getElementById('trackPromos')) initInicio();
    if(document.getElementById('coctelesGrid')) { renderProductosGrid(); setupModalHandlers(); }
    if(document.getElementById('invTable')) initInventario();
    if(document.getElementById('ventasList')) initVentas();
    if(document.getElementById('clientsList')) initClientes();
    if(document.getElementById('provList')) initProveedores();
    if(document.getElementById('summary')) initAdminDashboard();
    if(document.getElementById('adminBtn')) initLogin();

    // Close sidebar if clicking outside main areas (safety)
    document.addEventListener('click', (e)=>{
      const sidebar = document.getElementById('sidebar');
      const menuBtn = document.getElementById('menuBtn');
      const overlay = document.getElementById('menuOverlay');
      if(!sidebar || !menuBtn || !overlay) return;
      // if sidebar open and click not on sidebar or menuBtn => close
      if(sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)){
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      }
    });
  });

})();

