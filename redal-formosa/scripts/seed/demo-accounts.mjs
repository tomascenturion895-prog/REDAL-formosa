// Prepara las cuentas de demostración y pedidos de ejemplo para recorrer los tres roles. Uso (desde redal-formosa/):
//
//   npm run seed:demo                 Deja la contraseña de demo en las cuentas y crea pedidos de ejemplo.
//
// Requiere haber corrido antes `npm run seed -- --apply` (usa a Chacra El Sol y a Lucía Fernández).
// DEMO_PASSWORD (opcional) cambia la contraseña; por defecto es la que se muestra al terminar.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env");
  process.exit(1);
}

const PASSWORD = process.env.DEMO_PASSWORD || "Redal-Demo-2026";
const ACCOUNTS = {
  admin: "admin@seed.redal.test",
  vendedor: "productor.chacraelsol@seed.redal.test",
  comprador: "cliente.lucia@seed.redal.test",
};

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const fail = (context, error) => {
  throw new Error(`${context}: ${error.message}`);
};

async function findUser(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail("listar usuarios", error);
    const found = data.users.find((u) => u.email === email);
    if (found || data.users.length < 200) return found ?? null;
  }
  return null;
}

const users = {};
for (const [role, email] of Object.entries(ACCOUNTS)) {
  const user = await findUser(email);
  if (!user) fail(`buscar ${email}`, new Error("no existe; corré antes npm run seed -- --apply"));
  const { error } = await db.auth.admin.updateUserById(user.id, { password: PASSWORD, email_confirm: true });
  if (error) fail(`contraseña de ${email}`, error);
  users[role] = user.id;
}

// Pedidos de ejemplo de la Chacra El Sol, hechos por Lucía, en distintas etapas.
const { data: emp, error: empError } = await db.from("emprendimientos").select("id, nombre").eq("owner_id", users.vendedor).limit(1).single();
if (empError) fail("buscar el emprendimiento del vendedor", empError);

const { data: products, error: prodError } = await db.from("productos").select("id, nombre, precio").eq("emprendimiento_id", emp.id);
if (prodError) fail("buscar productos", prodError);
const byName = (part) => {
  const product = products.find((p) => p.nombre.toLowerCase().includes(part));
  if (!product) fail("producto de ejemplo", new Error(`falta "${part}"; corré npm run seed -- --apply`));
  return product;
};

const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000).toISOString();
const ORDERS = [
  { numero: "DEMO-0001", estado: "pagado", hace: 0.7, direccion: "Belgrano 450, Formosa Capital", nota: "Tel: 3704 555101 · tocar timbre", items: [["mandioca fresca", 2], ["frasco 500 g", 1]] },
  { numero: "DEMO-0002", estado: "pagado", hace: 5, direccion: "Av. 25 de Mayo 1200, Formosa Capital", nota: "Tel: 3704 555102", items: [["cajón de mandioca", 1]] },
  { numero: "DEMO-0003", estado: "en_preparacion", hace: 20, direccion: "Barrio San Miguel, Formosa Capital", nota: "Tel: 3704 555103 · después de las 18", items: [["zapallo plomo", 2], ["batata colorada", 3]] },
  { numero: "DEMO-0004", estado: "entregado", hace: 72, direccion: "Calle Brandsen 300, Formosa Capital", nota: "Tel: 3704 555104", items: [["frasco 1 kg", 1]] },
];

let created = 0;
for (const order of ORDERS) {
  const { data: existing } = await db.from("pedidos").select("id").eq("numero_pedido", order.numero).maybeSingle();
  if (existing) continue;

  const lines = order.items.map(([part, cantidad]) => {
    const p = byName(part);
    return { producto_id: p.id, cantidad, precio_unitario: Number(p.precio), subtotal: Number(p.precio) * cantidad };
  });
  const envio = 100 + 50 * lines.length;
  const total = lines.reduce((sum, l) => sum + l.subtotal, 0) + envio;

  const { data: pedido, error } = await db
    .from("pedidos")
    .insert({
      numero_pedido: order.numero,
      comprador_id: users.comprador,
      emprendimiento_id: emp.id,
      estado: order.estado,
      tipo_entrega: "domicilio",
      direccion_entrega: order.direccion,
      monto_total: total,
      monto_envio: envio,
      nota_cliente: order.nota,
      created_at: hoursAgo(order.hace),
    })
    .select("id")
    .single();
  if (error) fail(`crear ${order.numero}`, error);

  const { error: itemsError } = await db.from("pedido_items").insert(lines.map((l) => ({ ...l, pedido_id: pedido.id })));
  if (itemsError) fail(`ítems de ${order.numero}`, itemsError);
  created++;
}

console.log(`Listo. Pedidos de ejemplo creados: ${created} (los existentes se conservan).\n`);
console.log("Cuentas de demostración (misma contraseña):");
for (const [role, email] of Object.entries(ACCOUNTS)) console.log(`  ${role.padEnd(10)} ${email}`);
console.log(`  contraseña ${PASSWORD}`);
