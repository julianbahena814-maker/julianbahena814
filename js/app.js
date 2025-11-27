// js/app.js - inicializador y helpers compartidos
(function(){
  const K_ROLE = 'papistear_role';
  const K_PRODUCTS = 'papistear_products';
  const K_VENTAS = 'papistear_ventas';
  const K_CLIENTES = 'papistear_clientes';
  const K_PROVIDERS = 'papistear_providers';

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

  if(!localStorage.getItem(K_PRODUCTS)) localStorage.setItem(K_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  if(!localStorage.getItem(K_VENTAS)) localStorage.setItem(K_VENTAS, JSON.stringify([]));
  if(!localStorage.getItem(K_CLIENTES)) localStorage.setItem(K_CLIENTES, JSON.stringify([]));
  if(!localStorage.getItem(K_PROVIDERS)) localStorage.setItem(K_PROVIDERS, JSON.stringify(DEFAULT_PROVIDERS));

  window.getRole = () => localStorage.getItem(K_ROLE) || null;
  window.setRole = (r) => localStorage.setItem(K_ROLE, r);
  window.logout = () => { localStorage.removeItem(K_ROLE); window.location = 'login.html'; };

  window.getProducts = () => JSON.parse(localStorage.getItem(K_PRODUCTS) || '[]');
  window.setProducts = (arr) => localStorage.setItem(K_PRODUCTS, JSON.stringify(arr));

  window.getVentas = () => JSON.parse(localStorage.getItem(K_VENTAS) || '[]');
  window.setVentas = (arr) => localStorage.setItem(K_VENTAS, JSON.stringify(arr));

  window.getClientes = () => JSON.parse(localStorage.getItem(K_CLIENTES) || '[]');
  window.setClientes = (arr) => localStorage.setItem(K_CLIENTES, JSON.stringify(arr));

  window.getProviders = () => JSON.parse(localStorage.getItem(K_PROVIDERS) || '[]');
  window.setProviders = (arr) => localStorage.setItem(K_PROVIDERS, JSON.stringify(arr));

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
        <a href="login.html" id="logoutLink">Cerrar sesión</a>
      `;
    } else {
      inner.innerHTML = `
        <a href="inicio.html">Inicio</a>
        <a href="productos.html">Productos</a>
        <a href="login.html" id="logoutLink">Entrar / Admin</a>
      `;
    }
    sidebarEl.innerHTML = ''; sidebarEl.appendChild(inner);
    const logoutLink = document.getElementById('logoutLink');
    if(logoutLink){
      logoutLink.addEventListener('click', ()=> { logout(); });
    }
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    if(menuBtn && sidebar){
      menuBtn.addEventListener('click', ()=> sidebar.classList.toggle('open'));
    }
    // Protect admin pages
    const path = window.location.pathname.split('/').pop();
    const adminPages = ['inventario.html','ventas.html','clientes.html','proveedores.html','admin_dashboard.html'];
    if(adminPages.includes(path) && getRole() !== 'admin'){
      if(path !== 'login.html') window.location = 'login.html';
    }
  });

})();


