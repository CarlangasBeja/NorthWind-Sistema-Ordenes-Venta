import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  clearToken,
  getStoredToken,
  login as loginRequest,
  register as registerRequest,
  saveToken,
  salesApi,
} from "./api.js";

const AuthContext = createContext(null);
const money = (value) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(value ?? 0);

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  useEffect(() => {
    const handleUnauthorized = () => setToken(null);
    window.addEventListener("northwind:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("northwind:unauthorized", handleUnauthorized);
  }, []);
  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      async signIn(email, password) {
        const tokens = await loginRequest(email, password);
        if (!tokens?.accessToken) throw new Error("El servidor no devolvió un token de acceso.");
        saveToken(tokens.accessToken);
        setToken(tokens.accessToken);
      },
      signOut() {
        clearToken();
        setToken(null);
      },
    }),
    [token],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated ? children : <Navigate to="/user/login" replace state={{ from: location }} />;
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("northwind.theme.v5") ?? "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("northwind.theme.v5", theme);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", theme === "dark" ? "#07111f" : "#0b1b35");
  }, [theme]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/user/login" element={<AuthPage mode="login" />} />
        <Route path="/user/register" element={<AuthPage mode="register" />} />
        <Route
          path="*"
          element={<ApplicationLayout theme={theme} setTheme={setTheme} />}
        />
      </Routes>
    </AuthProvider>
  );
}

function ApplicationLayout({ theme, setTheme }) {
  const { isAuthenticated, signOut } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="NorthWind, inicio">
          <span className="brand-mark">NW</span>
          <span><strong>NorthWind</strong><small>VENTAS</small></span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/customers">Clientes</NavLink>
              <NavLink to="/products">Productos</NavLink>
              <NavLink to="/createorder">Nueva orden</NavLink>
              <NavLink to="/invoices">Órdenes</NavLink>
            </>
          )}
        </nav>
        <div className="topbar-actions">
          <button
            className="icon-button theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            title={theme === "dark" ? "Tema claro" : "Tema oscuro"}
          >
            {theme === "dark" ? "☀" : "◐"}
          </button>
          {isAuthenticated ? (
            <button className="button button-quiet sign-out" onClick={signOut}>Cerrar sesión</button>
          ) : (
            <Link className="button button-primary sign-in" to="/user/login">Iniciar sesión</Link>
          )}
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customers" element={<Protected><CustomersPage /></Protected>} />
          <Route path="/products" element={<Protected><ProductsPage /></Protected>} />
          <Route path="/createorder" element={<Protected><CreateOrderPage /></Protected>} />
          <Route path="/invoices" element={<Protected><InvoicesPage /></Protected>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="footer"><span>NorthWind Ventas</span><span>Gestión comercial con control y claridad</span></footer>
    </div>
  );
}

function Protected({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function HomePage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">SISTEMA COMERCIAL NORTHWIND</span>
          <h1>Ventas claras,<br /><span>controladas y seguras.</span></h1>
          <p>Gestione órdenes de venta con validación de clientes, control de inventario y consulta de comprobantes desde una sola aplicación.</p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link className="button button-primary button-large" to="/createorder">＋ Crear nueva orden</Link>
                <Link className="button button-outline button-large" to="/invoices">Consultar órdenes</Link>
              </>
            ) : (
              <>
                <Link className="button button-primary button-large" to="/user/login">Iniciar sesión</Link>
                <Link className="button button-outline button-large" to="/user/register">Crear cuenta</Link>
              </>
            )}
          </div>
          <div className="session-note"><span className={`status-dot ${isAuthenticated ? "" : "muted"}`} />{isAuthenticated ? "Sesión activa. Ya puede operar." : "Inicie sesión para acceder a las operaciones de venta."}</div>
        </div>
        <aside className="hero-card">
          <div className="hero-card-head"><span>CONTROL DE VENTA</span><span className="badge badge-success">Protegido</span></div>
          <p className="hero-card-label">Flujo de una orden</p>
          <strong className="hero-flow">Cliente <i>→</i> Producto <i>→</i> Stock <i>→</i> Orden</strong>
          <ul className="check-list">
            <li>Cliente validado antes de vender</li>
            <li>Precio tomado del catálogo</li>
            <li>Inventario controlado al guardar</li>
            <li>Orden disponible en PDF</li>
          </ul>
        </aside>
      </section>
      <section className="feature-section">
        <div className="section-heading"><span className="eyebrow">FUNCIONES PRINCIPALES</span><h2>Todo el proceso en un flujo sencillo</h2><p>Las herramientas para consultar y registrar ventas, siempre a mano.</p></div>
        <div className="feature-grid">
          <FeatureCard number="01" title="Clientes habilitados" text="Consulte el saldo pendiente y verifique la elegibilidad antes de registrar una venta." />
          <FeatureCard number="02" title="Inventario bajo control" text="Consulte existencias y valide las cantidades antes de confirmar la orden." />
          <FeatureCard number="03" title="Órdenes verificables" text="Revise ventas registradas, sus detalles y genere comprobantes PDF." />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ number, title, text }) {
  return <article className="feature-card"><span className="feature-number">{number}</span><h3>{title}</h3><p>{text}</p></article>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

function Feedback({ error, success, onClose }) {
  if (!error && !success) return null;
  return (
    <div className={`feedback ${error ? "feedback-error" : "feedback-success"}`} role={error ? "alert" : "status"}>
      <span className="feedback-symbol">{error ? "!" : "✓"}</span>
      <span>{error || success}</span>
      {onClose && <button className="feedback-close" onClick={onClose} aria-label="Cerrar">×</button>}
    </div>
  );
}

function Pagination({ result, busy, onPage }) {
  if (!result || result.totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="button button-outline" disabled={busy || result.page <= 1} onClick={() => onPage(result.page - 1)}>← Anterior</button>
      <span>Página <strong>{result.page}</strong> de <strong>{Math.max(1, result.totalPages)}</strong></span>
      <button className="button button-outline" disabled={busy || result.page >= result.totalPages} onClick={() => onPage(result.page + 1)}>Siguiente →</button>
    </div>
  );
}

function CustomersPage() {
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load(page = 1, query = search, by = field) {
    setBusy(true);
    setError("");
    try {
      setResult(await salesApi.customers(query.trim(), by, page, 10));
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(1, "", "all"); }, []);

  async function saveCustomer(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await salesApi.createCustomer({
        id: form.get("id").trim(),
        name: form.get("name").trim(),
        currentBalance: Number(form.get("balance") || 0),
      });
      setModal(null);
      setSuccess("El cliente se registró correctamente.");
      await load(1);
    } catch (exception) {
      setModal((current) => ({ ...current, error: exception.message }));
    } finally {
      setSaving(false);
    }
  }

  async function saveBalance(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await salesApi.updateBalance(modal.customer.id, form.get("balance"));
      setModal(null);
      setSuccess("El saldo pendiente se actualizó correctamente.");
      await load(result?.page ?? 1);
    } catch (exception) {
      setModal((current) => ({ ...current, error: exception.message }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="CATÁLOGO DE CLIENTES"
        title="Clientes y saldos pendientes"
        description="Consulte clientes, registre nuevos contactos y controle sus saldos."
        action={<div className="heading-actions"><button className="button button-primary" onClick={() => { setError(""); setModal({ type: "create" }); }}>＋ Agregar cliente</button><Link className="button button-outline" to="/createorder">Ir a ventas →</Link></div>}
      />
      <Feedback error={error} success={success} onClose={() => { setError(""); setSuccess(""); }} />
      <section className="panel">
        <PanelHeader number="01" title="Buscar clientes" description="Localice clientes por código o nombre y consulte su saldo." count={`${result?.totalItems ?? 0} clientes`} />
        <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(1); }}>
          <label>Buscar por<select value={field} onChange={(event) => setField(event.target.value)}><option value="all">Código o nombre</option><option value="code">Solo código</option><option value="name">Solo nombre</option></select></label>
          <label className="search-field">Texto de búsqueda<input value={search} onChange={(event) => setSearch(event.target.value)} maxLength="100" placeholder="Ej.: ALFKI o María" /></label>
          <button className="button button-primary" disabled={busy}>{busy ? "Buscando..." : "Buscar clientes"}</button>
          <button type="button" className="button button-outline" disabled={busy} onClick={() => { setSearch(""); setField("all"); load(1, "", "all"); }}>Limpiar</button>
        </form>
        {busy ? <Loading text="Cargando clientes..." /> : !result?.items?.length ? <EmptyState title="No hay clientes para este filtro" text="Compruebe el criterio o registre un cliente nuevo." /> : (
          <>
            <div className="table-wrap"><table><thead><tr><th>Código</th><th>Nombre</th><th className="align-right">Saldo pendiente</th><th>Estado para comprar</th><th className="align-right">Gestión</th></tr></thead>
              <tbody>{result.items.map((customer) => <tr key={customer.id}><td><code>{customer.id}</code></td><td><strong>{customer.name}</strong></td><td className="align-right"><strong>{money(customer.currentBalance)}</strong></td><td><span className={`badge ${customer.currentBalance > 0 ? "badge-warning" : "badge-success"}`}>{customer.currentBalance > 0 ? "Con deuda · Compra bloqueada" : "Sin deuda · Puede comprar"}</span></td><td className="align-right"><button className="button button-small button-outline" onClick={() => setModal({ type: "balance", customer })}>Modificar saldo</button></td></tr>)}</tbody>
            </table></div>
            <Pagination result={result} busy={busy} onPage={load} />
          </>
        )}
      </section>
      {modal && <Modal title={modal.type === "create" ? "Agregar cliente" : "Modificar saldo pendiente"} busy={saving} onClose={() => setModal(null)}>
        <Feedback error={modal.error} />
        {modal.type === "create" ? (
          <form className="form-stack" onSubmit={saveCustomer}>
            <label>Código del cliente<input name="id" maxLength="5" required autoFocus placeholder="Ej.: NW001" /></label>
            <label>Nombre completo<input name="name" maxLength="80" required placeholder="Nombre del cliente" /></label>
            <label>Saldo pendiente (USD)<input name="balance" type="number" min="0" max="999999999999.99" step="0.01" defaultValue="0" required /></label>
            <ModalActions disabled={saving} onCancel={() => setModal(null)} submit={saving ? "Guardando..." : "Guardar cliente"} />
          </form>
        ) : (
          <form className="form-stack" onSubmit={saveBalance}>
            <div className="selected-customer"><code>{modal.customer.id}</code><strong>{modal.customer.name}</strong></div>
            <label>Deuda pendiente (USD)<input name="balance" type="number" min="0" max="999999999999.99" step="0.01" defaultValue={modal.customer.currentBalance} required autoFocus /></label>
            <ModalActions disabled={saving} onCancel={() => setModal(null)} submit={saving ? "Guardando..." : "Guardar saldo"} />
          </form>
        )}
      </Modal>}
    </>
  );
}

function ProductsPage() {
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load(page = 1, query = search, by = field) {
    setBusy(true);
    setError("");
    try {
      setResult(await salesApi.products(query.trim(), by, page, 10, true));
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { load(1, "", "all"); }, []);

  return (
    <>
      <PageHeading eyebrow="CATÁLOGO DE PRODUCTOS" title="Productos e inventario" description="Consulte precios y existencias, incluidos los productos agotados." action={<Link className="button button-primary" to="/createorder">＋ Crear orden</Link>} />
      <Feedback error={error} />
      <section className="panel">
        <PanelHeader number="01" title="Explorar productos" description="Filtre por identificador y nombre." count={`${result?.totalItems ?? 0} resultados`} />
        <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(1); }}>
          <label>Buscar por<select value={field} onChange={(event) => setField(event.target.value)}><option value="all">Código o nombre</option><option value="id">Solo código</option><option value="name">Solo nombre</option></select></label>
          <label className="search-field">Texto de búsqueda<input value={search} onChange={(event) => setSearch(event.target.value)} maxLength="100" placeholder="Ej.: 15 o Leche" /></label>
          <button className="button button-primary" disabled={busy}>{busy ? "Buscando..." : "Buscar productos"}</button>
          <button type="button" className="button button-outline" disabled={busy} onClick={() => { setSearch(""); setField("all"); load(1, "", "all"); }}>Limpiar</button>
        </form>
        {busy ? <Loading text="Cargando productos..." /> : !result?.items?.length ? <EmptyState title="No encontramos productos" text="Pruebe otro nombre o código." /> : (
          <>
            <div className="table-wrap"><table><thead><tr><th>Código</th><th>Nombre del producto</th><th className="align-right">Precio unitario</th><th className="align-right">Stock</th><th>Disponibilidad</th></tr></thead>
              <tbody>{result.items.map((product) => <tr key={product.id}><td><code>#{product.id}</code></td><td><strong>{product.name}</strong></td><td className="align-right"><strong>{money(product.unitPrice)}</strong></td><td className="align-right">{product.unitsInStock}</td><td><span className={`badge ${product.unitsInStock === 0 || product.unitsInStock <= 5 ? "badge-warning" : "badge-success"}`}>{product.unitsInStock === 0 ? "Agotado" : product.unitsInStock <= 5 ? "Stock bajo" : "Disponible"}</span></td></tr>)}</tbody>
            </table></div>
            <Pagination result={result} busy={busy} onPage={load} />
          </>
        )}
      </section>
    </>
  );
}

function CreateOrderPage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [details, setDetails] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationError, setConfirmationError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const orderFormRef = useRef(null);

  async function findCustomers(event) {
    event?.preventDefault();
    setError("");
    try {
      const data = await salesApi.customers(customerSearch.trim(), "all", 1, 10);
      setCustomers(data.items ?? []);
    } catch (exception) { setError(exception.message); }
  }

  async function findProducts(event) {
    event?.preventDefault();
    setError("");
    try {
      const data = await salesApi.products(productSearch.trim(), "all", 1, 10, false);
      setProducts(data.items ?? []);
    } catch (exception) { setError(exception.message); }
  }

  function addProduct(product) {
    setDetails((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) return current.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.unitsInStock) } : item);
      return [...current, { productId: product.id, productName: product.name, unitPrice: product.unitPrice, quantity: 1, unitsInStock: product.unitsInStock }];
    });
  }

  function prepareOrder(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPendingOrder({
      customerId,
      shipAddress: form.get("shipAddress").trim(),
      shipCity: form.get("shipCity").trim(),
      shipCountry: form.get("shipCountry").trim(),
      shipPostalCode: form.get("shipPostalCode").trim() || null,
      orderDetails: details.map(({ productId, unitPrice, quantity }) => ({ productId, unitPrice, quantity: Number(quantity) })),
    });
    setShowConfirmation(true);
  }

  async function confirmOrder() {
    if (!pendingOrder) return;
    setBusy(true);
    setConfirmationError("");
    try {
      const id = await salesApi.createOrder(pendingOrder);
      setCreatedId(id);
      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (exception) {
      setConfirmationError(exception.message);
    } finally {
      setBusy(false);
    }
  }

  const subtotal = details.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.round((subtotal * 0.15 + Number.EPSILON) * 100) / 100;
  const total = subtotal + tax;
  const selectedCustomer = customers.find((customer) => customer.id === customerId);
  function startAnotherOrder() {
    setShowSuccess(false);
    setCreatedId(null);
    setPendingOrder(null);
    setCustomerId("");
    setDetails([]);
    orderFormRef.current?.reset();
  }

  return (
    <>
      <PageHeading eyebrow="PUNTO DE VENTA" title="Crear una orden" description="Seleccione el cliente, agregue productos y confirme los datos de envío." />
      <Feedback error={error} />
      <form ref={orderFormRef} onSubmit={prepareOrder}>
        <section className="panel order-panel">
          <PanelHeader number="01" title="Seleccionar cliente" description="Las cuentas con saldo pendiente no pueden registrar una orden." />
          <div className="inline-search"><input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} maxLength="100" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); findCustomers(); } }} placeholder="Buscar por código o nombre" /><button className="button button-outline" type="button" onClick={findCustomers}>Buscar clientes</button></div>
          {customers.length > 0 && <div className="choice-list">{customers.map((customer) => <label className={`choice-card ${customerId === customer.id ? "selected" : ""}`} key={customer.id}><input type="radio" name="customer" value={customer.id} checked={customerId === customer.id} onChange={() => setCustomerId(customer.id)} disabled={customer.currentBalance > 0} /><span><strong>{customer.name}</strong><small>{customer.id} · Saldo {money(customer.currentBalance)}</small></span><span className={`badge ${customer.currentBalance > 0 ? "badge-warning" : "badge-success"}`}>{customer.currentBalance > 0 ? "Bloqueado por deuda" : "Habilitado"}</span></label>)}</div>}
          {!customers.length && <p className="helper-text">Busque un cliente para seleccionarlo.</p>}
        </section>

        <section className="panel order-panel">
          <PanelHeader number="02" title="Agregar productos" description="Solo se pueden agregar productos con existencias disponibles." />
          <div className="inline-search"><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} maxLength="100" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); findProducts(); } }} placeholder="Buscar por código o nombre" /><button className="button button-outline" type="button" onClick={findProducts}>Buscar productos</button></div>
          {products.length > 0 && <div className="product-pick-list">{products.map((product) => <div className="product-pick" key={product.id}><div><strong>{product.name}</strong><small>#{product.id} · Stock {product.unitsInStock} · {money(product.unitPrice)}</small></div><button type="button" className="button button-small button-outline" disabled={!product.unitsInStock} onClick={() => addProduct(product)}>Agregar</button></div>)}</div>}
          {details.length > 0 && <div className="table-wrap order-lines"><table><thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead><tbody>{details.map((item) => <tr key={item.productId}><td><strong>{item.productName}</strong><small className="table-subtext">Stock: {item.unitsInStock}</small></td><td>{money(item.unitPrice)}</td><td><input className="quantity-input" aria-label={`Cantidad de ${item.productName}`} type="number" min="1" max={item.unitsInStock} value={item.quantity} onChange={(event) => setDetails((current) => current.map((line) => line.productId === item.productId ? { ...line, quantity: Math.min(item.unitsInStock, Math.max(1, Number(event.target.value))) } : line))} /></td><td>{money(item.unitPrice * item.quantity)}</td><td><button type="button" className="text-button danger-text" onClick={() => setDetails((current) => current.filter((line) => line.productId !== item.productId))}>Quitar</button></td></tr>)}</tbody></table></div>}
          {!details.length && <p className="helper-text">Agregue al menos un producto a la orden.</p>}
          <div className="order-totals"><span>Subtotal <strong>{money(subtotal)}</strong></span><span>IVA (15%) <strong>{money(tax)}</strong></span><span>Total <strong>{money(total)}</strong></span></div>
        </section>

        <section className="panel order-panel">
          <PanelHeader number="03" title="Datos de envío" description="Indique la dirección de entrega de la orden." />
          <div className="form-grid">
            <label className="span-two">Dirección<input name="shipAddress" required maxLength="60" /></label>
            <label>Ciudad<input name="shipCity" required maxLength="15" /></label>
            <label>País<input name="shipCountry" required maxLength="15" /></label>
            <label>Código postal<input name="shipPostalCode" maxLength="10" /></label>
          </div>
          <div className="submit-row"><button className="button button-primary button-large" disabled={busy || createdId !== null || !customerId || !details.length}>Revisar y confirmar orden</button><Link className="button button-outline" to="/invoices">Cancelar</Link></div>
        </section>
      </form>
      {showConfirmation && pendingOrder && <Modal title="Confirmar orden de venta" eyebrow="REVISIÓN FINAL" busy={busy} onClose={() => setShowConfirmation(false)}>
        <Feedback error={confirmationError} />
        <p className="dialog-description">Revise los datos de la venta antes de guardarla.</p>
        <div className="confirm-summary">
          <div><span>Cliente</span><strong>{selectedCustomer?.name ?? pendingOrder.customerId} ({pendingOrder.customerId})</strong></div>
          <div><span>Productos</span><strong>{details.length} línea(s) · {details.reduce((units, item) => units + item.quantity, 0)} unidad(es)</strong></div>
          <div><span>Entrega</span><strong>{pendingOrder.shipAddress}, {pendingOrder.shipCity}, {pendingOrder.shipCountry}</strong></div>
          {details.map((item) => <div key={item.productId}><span>{item.productName} × {item.quantity}</span><strong>{money(item.unitPrice * item.quantity)}</strong></div>)}
          <div className="confirm-total"><span>Total con IVA</span><strong>{money(total)}</strong></div>
        </div>
        <div className="modal-actions"><button type="button" className="button button-outline" disabled={busy} onClick={() => setShowConfirmation(false)}>Volver a revisar</button><button type="button" className="button button-primary" disabled={busy} onClick={confirmOrder}>{busy ? "Guardando..." : "Confirmar y guardar"}</button></div>
      </Modal>}
      {showSuccess && createdId !== null && <div className="modal-backdrop"><section className="modal order-success" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
        <span className="success-check">✓</span><span className="eyebrow">VENTA CONFIRMADA</span><h2 id="order-success-title">La orden se registró correctamente.</h2>
        <div className="success-order-number"><span>NÚMERO DE ORDEN</span><strong>INV-{String(createdId).padStart(6, "0")}</strong></div>
        <div className="confirm-summary">
          <div><span>Cliente</span><strong>{selectedCustomer?.name ?? pendingOrder?.customerId}</strong></div>
          <div><span>Productos</span><strong>{details.length} línea(s) · {details.reduce((units, item) => units + item.quantity, 0)} unidad(es)</strong></div>
          <div><span>Total de la orden</span><strong>{money(total)}</strong></div>
        </div>
        <div className="modal-actions"><button type="button" className="button button-outline" onClick={startAnotherOrder}>Crear otra orden</button><Link className="button button-primary" to={`/invoices?orderId=${encodeURIComponent(createdId)}`}>Ver orden →</Link></div>
        <p className="dialog-description">Consulte los datos de entrega, el detalle y el comprobante generado.</p>
      </section></div>}
    </>
  );
}

function InvoicesPage() {
  const [searchParams] = useSearchParams();
  const requestedOrderId = Number(searchParams.get("orderId"));
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState("");
  const [field, setField] = useState("all");
  const [invoice, setInvoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [printPending, setPrintPending] = useState(false);
  const pdfFrameRef = useRef(null);

  async function load(page = 1, query = search, by = field) {
    setBusy(true);
    setError("");
    try {
      setResult(await salesApi.orders(query.trim(), by, page, 10));
    } catch (exception) { setError(exception.message); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    load(1, "", "all");
    if (Number.isInteger(requestedOrderId) && requestedOrderId > 0) {
      showInvoice(requestedOrderId);
    }
  }, []);

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  async function showInvoice(orderId) {
    setError("");
    try {
      const data = await salesApi.invoice(orderId);
      if (!data) throw new Error("No se encontró la orden solicitada.");
      setInvoice(data);
    } catch (exception) { setError(exception.message); }
  }

  async function viewPdf(orderId) {
    setError("");
    setPdfBusy(true);
    try {
      const blob = await salesApi.pdf(orderId);
      setPdfUrl(URL.createObjectURL(blob));
    } catch (exception) {
      setPrintPending(false);
      setError(exception.message);
    } finally {
      setPdfBusy(false);
    }
  }

  function printPdf(orderId = invoice?.orderId) {
    if (!pdfUrl) {
      setPrintPending(true);
      viewPdf(orderId);
      return;
    }
    const printWindow = pdfFrameRef.current?.contentWindow;
    if (!printWindow) {
      setError("No se pudo abrir la impresión del comprobante. Vuelva a intentarlo.");
      return;
    }
    printWindow.print();
  }

  async function downloadPdf(orderId) {
    setError("");
    try {
      const blob = await salesApi.pdf(orderId, true);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoice?.invoiceNumber ?? `orden-${orderId}`}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSuccess("El comprobante PDF se descargó correctamente.");
    } catch (exception) { setError(exception.message); }
  }

  return (
    <>
      <PageHeading eyebrow="HISTORIAL DE VENTAS" title="Consultar órdenes de venta" description="Localice una orden, revise su detalle y descargue su comprobante." action={<Link className="button button-primary" to="/createorder">＋ Nueva orden</Link>} />
      <Feedback error={error} success={success} onClose={() => { setError(""); setSuccess(""); }} />
      <section className="panel">
        <PanelHeader number="01" title="Localizar una orden" description="Busque por número de orden o datos del cliente." count={`${result?.totalItems ?? 0} órdenes`} />
        <form className="toolbar" onSubmit={(event) => { event.preventDefault(); load(1); }}>
          <label>Buscar por<select value={field} onChange={(event) => setField(event.target.value)}><option value="all">Todos los datos</option><option value="invoice">N.º de orden</option><option value="customercode">Código de cliente</option><option value="customername">Nombre de cliente</option></select></label>
          <label className="search-field">Texto de búsqueda<input value={search} onChange={(event) => setSearch(event.target.value)} maxLength="100" onKeyDown={(event) => { if (event.key === "Enter") load(1); }} placeholder={field === "invoice" ? "Ej.: INV-000001" : "Número o cliente"} /></label>
          <button className="button button-primary" disabled={busy}>{busy ? "Consultando..." : "Buscar órdenes"}</button>
          <button type="button" className="button button-outline" disabled={busy} onClick={() => { setSearch(""); setField("all"); setInvoice(null); load(1, "", "all"); }}>Restablecer</button>
        </form>
        {busy ? <Loading text="Consultando órdenes..." /> : !result?.items?.length ? <EmptyState title="No encontramos órdenes" text="Pruebe con otro número o criterio de búsqueda." /> : (
          <>
            <div className="table-wrap"><table><thead><tr><th>Número</th><th>Fecha</th><th>Cliente</th><th className="align-right">Total</th><th className="align-right">Detalle</th></tr></thead><tbody>{result.items.map((order) => <tr key={order.orderId}><td><code>{order.invoiceNumber}</code></td><td>{new Date(order.orderDate).toLocaleDateString("es-MX")}</td><td><strong>{order.customerName}</strong><small className="table-subtext">{order.customerId}</small></td><td className="align-right"><strong>{money(order.total)}</strong></td><td className="align-right"><button className="button button-small button-outline" onClick={() => showInvoice(order.orderId)}>Ver orden</button></td></tr>)}</tbody></table></div>
            <Pagination result={result} busy={busy} onPage={load} />
          </>
        )}
      </section>
      {invoice && <section className="panel invoice-detail">
        <div className="panel-heading"><div><span className="step-number">02</span><div><h2>Detalle de la orden</h2><p>{invoice.invoiceNumber} · {invoice.customerName}</p></div></div><div className="heading-actions"><button className="button button-outline" disabled={pdfBusy} onClick={() => viewPdf(invoice.orderId)}>{pdfBusy ? "Preparando..." : "Ver PDF"}</button><button className="button button-outline" disabled={pdfBusy} onClick={() => downloadPdf(invoice.orderId)}>↓ Descargar</button><button className="button button-primary" disabled={pdfBusy} onClick={() => printPdf(invoice.orderId)}>Imprimir</button></div></div>
        <div className="invoice-meta"><span>Fecha <strong>{new Date(invoice.orderDate).toLocaleDateString("es-MX")}</strong></span><span>Cliente <strong>{invoice.customerName} ({invoice.customerId})</strong></span><span>Envío <strong>{invoice.shipAddress}, {invoice.shipCity}, {invoice.shipCountry}</strong></span></div>
        <div className="table-wrap"><table><thead><tr><th>Producto</th><th className="align-right">Precio</th><th className="align-right">Cantidad</th><th className="align-right">Subtotal</th></tr></thead><tbody>{invoice.details?.map((item) => <tr key={item.productId}><td>{item.productName}</td><td className="align-right">{money(item.unitPrice)}</td><td className="align-right">{item.quantity}</td><td className="align-right">{money(item.subtotal)}</td></tr>)}</tbody></table></div>
        <div className="totals"><span>Subtotal <strong>{money(invoice.subtotal)}</strong></span><span>IVA <strong>{money(invoice.tax)}</strong></span><span>Total <strong>{money(invoice.total)}</strong></span></div>
      </section>}
      {pdfUrl && <div className="modal-backdrop pdf-backdrop"><section className="modal pdf-modal" role="dialog" aria-modal="true" aria-labelledby="pdf-title">
        <header><div><span className="eyebrow">VISTA PREVIA DEL COMPROBANTE</span><h2 id="pdf-title">{invoice?.invoiceNumber}</h2><p className="dialog-description">Revise el documento antes de imprimirlo o descargarlo.</p></div><div className="heading-actions"><button className="button button-outline" onClick={printPdf}>Imprimir</button><button className="button button-primary" onClick={() => downloadPdf(invoice.orderId)}>↓ Descargar</button><button className="icon-button" onClick={() => setPdfUrl("")} aria-label="Cerrar visor PDF">×</button></div></header>
        <iframe ref={pdfFrameRef} src={pdfUrl} onLoad={() => { if (printPending) { setPrintPending(false); pdfFrameRef.current?.contentWindow?.print(); } }} title="Vista previa de la orden de venta en PDF" />
      </section></div>}
    </>
  );
}

function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError("");
    setSuccess("");
    const form = new FormData(formElement);
    try {
      if (isLogin) {
        await signIn(form.get("email").trim(), form.get("password"));
        navigate(location.state?.from?.pathname ?? "/", { replace: true });
      } else {
        if (password !== confirmation) throw new Error("Las contraseñas no coinciden.");
        if (!hasValidPassword(password)) throw new Error("La contraseña debe tener entre 6 y 128 caracteres, mayúscula, minúscula, número y carácter especial.");
        await registerRequest({
          email: form.get("email").trim(),
          password,
          firstName: form.get("firstName").trim(),
          lastName: form.get("lastName").trim(),
        });
        setSuccess("La cuenta se creó correctamente. Ya puede iniciar sesión.");
        formElement.reset();
        setPassword("");
        setConfirmation("");
      }
    } catch (exception) {
      setError(exception.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <Link className="brand auth-brand" to="/"><span className="brand-mark">NW</span><span><strong>NorthWind</strong><small>VENTAS</small></span></Link>
      <div className="auth-shell">
        <section className="auth-form-panel">
          <span className="eyebrow">{isLogin ? "ACCESO SEGURO" : "REGISTRO DE USUARIO"}</span>
          <h1>{isLogin ? "Bienvenido de nuevo" : "Crear una cuenta"}</h1>
          <p className="muted-text">{isLogin ? "Ingrese sus credenciales para acceder a las operaciones de venta." : "Complete sus datos para crear una cuenta de acceso."}</p>
          <Feedback error={error} success={success} />
          <form className="form-stack" onSubmit={submit}>
            {!isLogin && <div className="form-grid"><label>Nombres<input name="firstName" autoComplete="given-name" maxLength="80" required /></label><label>Apellidos<input name="lastName" autoComplete="family-name" maxLength="80" required /></label></div>}
            <label>Correo electrónico<input name="email" type="email" autoComplete="email" inputMode="email" maxLength="256" placeholder="nombre@ejemplo.com" required /></label>
            <label>Contraseña
              <span className="password-input"><input name="password" type={showPassword ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} value={isLogin ? undefined : password} onChange={isLogin ? undefined : (event) => setPassword(event.target.value)} maxLength="128" required /><button type="button" className="text-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button></span>
            </label>
            {!isLogin && <>
              <label>Confirmar contraseña<span className="password-input"><input name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} maxLength="128" required /><button type="button" className="text-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button></span></label>
              <PasswordRules password={password} confirmation={confirmation} />
            </>}
            <button className="button button-primary button-large full-width" disabled={busy}>{busy ? (isLogin ? "Verificando datos..." : "Creando cuenta...") : (isLogin ? "Iniciar sesión" : "Crear cuenta")}</button>
          </form>
          <p className="auth-switch">{isLogin ? "¿Todavía no tiene una cuenta?" : "¿Ya tiene una cuenta?"} <Link to={isLogin ? "/user/register" : "/user/login"}>{isLogin ? "Crear cuenta" : "Iniciar sesión"}</Link></p>
        </section>
        <aside className="auth-info">
          <span className="auth-emblem">NW</span>
          <h2>{isLogin ? "Acceso a Gestión de Ventas" : "Una cuenta para operar con seguridad"}</h2>
          <p>Su sesión protege las operaciones que modifican inventario y generan órdenes de venta.</p>
          <ul className="check-list"><li>Acceso autenticado</li><li>Conexión con servicios REST</li><li>Mensajes claros para continuar</li></ul>
        </aside>
      </div>
    </div>
  );
}

function hasValidPassword(value) {
  return value.length >= 6 && value.length <= 128 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^a-zA-Z0-9]/.test(value);
}

function PasswordRules({ password, confirmation }) {
  const rules = [
    ["Entre 6 y 128 caracteres", password.length >= 6 && password.length <= 128],
    ["Una letra mayúscula", /[A-Z]/.test(password)],
    ["Una letra minúscula", /[a-z]/.test(password)],
    ["Un número", /\d/.test(password)],
    ["Un carácter especial", /[^a-zA-Z0-9]/.test(password)],
    ["Las contraseñas coinciden", Boolean(password) && password === confirmation],
  ];
  return <div className="password-rules"><strong>La contraseña debe cumplir:</strong>{rules.map(([text, valid]) => <span className={valid ? "rule-valid" : ""} key={text}>{valid ? "✓" : "·"} {text}</span>)}</div>;
}

function PanelHeader({ number, title, description, count }) {
  return <div className="panel-heading"><div><span className="step-number">{number}</span><div><h2>{title}</h2><p>{description}</p></div></div>{count && <span className="badge badge-neutral">{count}</span>}</div>;
}

function Loading({ text }) {
  return <div className="loading-state"><span className="spinner" />{text}</div>;
}

function EmptyState({ title, text }) {
  return <div className="empty-state"><strong>{title}</strong><span>{text}</span></div>;
}

function Modal({ title, eyebrow = "GESTIÓN DE CLIENTES", busy = false, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (!busy && event.target === event.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><div><span className="eyebrow">{eyebrow}</span><h2 id="modal-title">{title}</h2></div><button className="icon-button" onClick={onClose} disabled={busy} aria-label="Cerrar">×</button></header>{children}</section></div>;
}

function ModalActions({ disabled, onCancel, submit }) {
  return <div className="modal-actions"><button type="button" className="button button-outline" onClick={onCancel} disabled={disabled}>Cancelar</button><button className="button button-primary" disabled={disabled}>{submit}</button></div>;
}

function NotFoundPage() {
  return <section className="not-found"><span className="eyebrow">404 · PÁGINA NO ENCONTRADA</span><h1>Esta dirección no existe.</h1><p>Regrese al inicio o use el menú para continuar.</p><Link className="button button-primary" to="/">Volver al inicio</Link></section>;
}

export default App;
