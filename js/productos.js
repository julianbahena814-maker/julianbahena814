// js/productos.js
document.addEventListener('DOMContentLoaded', ()=> {
  const sidebar = document.getElementById('sidebar');
  if(typeof renderMenu === 'function' && sidebar) renderMenu(sidebar);

  // hide socials for admin
  if(typeof getRole === 'function' && getRole() === 'admin'){
    const sp = document.getElementById('socialPanel');
    if(sp) sp.style.display = 'none';
  }

  // containers (must exist in productos.html)
  const coctelesGrid = document.getElementById('coctelesGrid');
  const cervezasGrid = document.getElementById('cervezasGrid');
  const snacksGrid = document.getElementById('snacksGrid');

  function renderProductos(){
    const productos = getProducts();
    if(coctelesGrid) coctelesGrid.innerHTML = '';
    if(cervezasGrid) cervezasGrid.innerHTML = '';
    if(snacksGrid) snacksGrid.innerHTML = '';

    productos.forEach((p,i) => {
      const card = document.createElement('div'); card.className = 'product-card';
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

    document.querySelectorAll('.buyBtn').forEach(b=>{
      b.addEventListener('click', ()=> abrirModal(Number(b.dataset.idx)));
    });
  }

  renderProductos();

  // modal elements must be present in productos.html
  const compraModal = document.getElementById('compraModal');
  const modalProducto = document.getElementById('modalProducto');
  const clienteNombre = document.getElementById('clienteNombre');
  const metodoPago = document.getElementById('metodoPago');
  const cantidadCompra = document.getElementById('cantidadCompra');
  const totalCompra = document.getElementById('totalCompra');
  const confirmarCompra = document.getElementById('confirmarCompra');
  const cancelarCompra = document.getElementById('cancelarCompra');

  let productoActual = null;

  window.abrirModal = function(idx){
    if(getRole() === 'admin'){ alert('Área solo para clientes. Inicia sesión como cliente.'); window.location='login.html'; return; }
    const productos = getProducts();
    productoActual = productos[idx];
    if(!productoActual){ alert('Producto no encontrado'); return; }
    modalProducto.textContent = `${productoActual.nombre} — $${productoActual.precio}`;
    cantidadCompra.value = 1;
    totalCompra.textContent = productoActual.precio;
    clienteNombre.value = '';
    metodoPago.value = 'efectivo';
    compraModal.style.display = 'flex';
  };

  if(cantidadCompra) cantidadCompra.addEventListener('input', ()=>{
    let cant = Math.max(1, Math.floor(Number(cantidadCompra.value) || 1));
    if(productoActual && cant > productoActual.cantidad) cant = productoActual.cantidad;
    cantidadCompra.value = cant;
    totalCompra.textContent = productoActual ? (productoActual.precio * cant) : 0;
  });

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

    productos[idx].cantidad -= cant;
    setProducts(productos);

    const ventas = getVentas();
    ventas.push({ producto: productos[idx].nombre, cliente: nombre, precio: productos[idx].precio, cantidad: cant, metodo, fecha: new Date().toLocaleString() });
    setVentas(ventas);

    const clientes = getClientes();
    const cIdx = clientes.findIndex(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if(cIdx !== -1) clientes[cIdx].compras = (clientes[cIdx].compras || 0) + cant;
    else clientes.push({ nombre, compras: cant });
    setClientes(clientes);

    alert('Compra realizada. Total: $' + (productos[idx].precio * cant));
    compraModal.style.display='none';
    renderProductos();
  });

});


