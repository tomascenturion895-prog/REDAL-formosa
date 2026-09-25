// Seeder de RedAL Formosa. Uso (desde redal-formosa/):
//
//   npm run seed                      Simulacro: muestra qué se crearía, sin tocar la base.
//   npm run seed -- --apply           Crea (o completa) los datos de prueba. Se puede repetir sin duplicar.
//   npm run seed -- --apply --remove  Borra los usuarios de prueba (@seed.redal.test) y todo lo que colgaba de ellos.
//
// Requiere en .env: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
// SEED_PASSWORD (opcional): contraseña de las cuentas de prueba; si falta se genera una y se muestra una vez.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { CATEGORIES, CUSTOMERS, PRODUCERS, PRODUCTS, SEED_EMAIL_DOMAIN } from "./data.mjs";
import {
  categoryFactory,
  customerFactory,
  emprendimientoFactory,
  producerUserFactory,
  productFactory,
} from "./factories.mjs";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const remove = args.has("--remove");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!apply) {
  console.log("SIMULACRO (no se escribe nada). Agregá --apply para ejecutar.\n");
  console.log(`Categorías:     ${CATEGORIES.length}`);
  console.log(`Productores:    ${PRODUCERS.length}  →  ${PRODUCERS.map((p) => p.nombre).join(", ")}`);
  console.log(`Clientes:       ${CUSTOMERS.length}  →  ${CUSTOMERS.map((c) => c.nombre).join(", ")}`);
  console.log(`Productos:      ${PRODUCTS.length}`);
  console.log(`Cuentas (@${SEED_EMAIL_DOMAIN}): ${[...PRODUCERS.map((p) => producerUserFactory(p).email), ...CUSTOMERS.map((c) => customerFactory(c).email)].join(", ")}`);
  process.exit(0);
}

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const fail = (context, error) => {
  throw new Error(`${context}: ${error.message}`);
};

async function listSeedUsers() {
  const found = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail("listar usuarios", error);
    found.push(...data.users.filter((u) => u.email?.endsWith(`@${SEED_EMAIL_DOMAIN}`)));
    if (data.users.length < 200) break;
  }
  return found;
}

async function removeSeedData() {
  const users = await listSeedUsers();
  for (const user of users) {
    const { error } = await db.auth.admin.deleteUser(user.id);
    if (error) fail(`borrar ${user.email}`, error);
  }
  console.log(`Borradas ${users.length} cuentas de prueba (y sus emprendimientos y productos).`);
  console.log("Las categorías se conservan.");
}

const generated = { password: null };
function seedPassword() {
  if (process.env.SEED_PASSWORD) return process.env.SEED_PASSWORD;
  generated.password ??= randomBytes(9).toString("base64url");
  return generated.password;
}

async function ensureUser(row, existing) {
  const current = existing.find((u) => u.email === row.email);
  let id = current?.id;
  let created = false;

  if (!id) {
    const { data, error } = await db.auth.admin.createUser({
      email: row.email,
      password: seedPassword(),
      email_confirm: true,
      user_metadata: { full_name: row.fullName },
    });
    if (error) fail(`crear ${row.email}`, error);
    id = data.user.id;
    created = true;
  }

  // El servicio de roles solo cambia con service role; nadie puede asignárselo desde la app.
  const { error } = await db.from("profiles").update({ role: row.role, full_name: row.fullName }).eq("id", id);
  if (error) fail(`asignar rol a ${row.email}`, error);
  return { id, created };
}

async function seed() {
  const stats = { usuarios: 0, categorias: 0, emprendimientos: 0, productos: 0 };

  // 1. Categorías (idempotente por slug)
  const { data: cats, error: catError } = await db
    .from("categorias")
    .upsert(CATEGORIES.map(categoryFactory), { onConflict: "slug" })
    .select("id, nombre");
  if (catError) fail("categorías", catError);
  const categoryId = Object.fromEntries(cats.map((c) => [c.nombre, c.id]));
  stats.categorias = cats.length;

  // 2. Usuarios: productores y clientes
  const existing = await listSeedUsers();
  const ownerId = {};
  for (const def of PRODUCERS) {
    const { id, created } = await ensureUser(producerUserFactory(def), existing);
    ownerId[def.key] = id;
    if (created) stats.usuarios++;
  }
  for (const def of CUSTOMERS) {
    const { created } = await ensureUser(customerFactory(def), existing);
    if (created) stats.usuarios++;
  }

  // 3. Emprendimientos (uno por productor; no se pisan si ya existen)
  const empId = {};
  for (const def of PRODUCERS) {
    const { data: found, error: findError } = await db
      .from("emprendimientos")
      .select("id")
      .eq("owner_id", ownerId[def.key])
      .eq("nombre", def.nombre)
      .maybeSingle();
    if (findError) fail(`buscar ${def.nombre}`, findError);
    if (found) {
      empId[def.key] = found.id;
      continue;
    }
    const { data: inserted, error } = await db
      .from("emprendimientos")
      .insert(emprendimientoFactory(def, ownerId[def.key]))
      .select("id")
      .single();
    if (error) fail(`crear ${def.nombre}`, error);
    empId[def.key] = inserted.id;
    stats.emprendimientos++;
  }

  // 4. Productos (no se pisan por nombre dentro de cada emprendimiento)
  for (const [index, def] of PRODUCTS.entries()) {
    const emprendimientoId = empId[def.producer];
    const { data: found, error: findError } = await db
      .from("productos")
      .select("id")
      .eq("emprendimiento_id", emprendimientoId)
      .eq("nombre", def.nombre)
      .maybeSingle();
    if (findError) fail(`buscar ${def.nombre}`, findError);
    if (found) continue;

    const { error } = await db
      .from("productos")
      .insert(productFactory(def, { emprendimientoId, categoriaId: categoryId[def.category], index }));
    if (error) fail(`crear ${def.nombre}`, error);
    stats.productos++;
  }

  console.log("Listo. Creado en esta corrida:", stats);
  console.log(`(Categorías: ${cats.length} en total. Lo que ya existía se conserva, no se duplica.)`);
  if (generated.password) {
    console.log(`\nContraseña de las cuentas nuevas de prueba (se muestra una sola vez): ${generated.password}`);
  }
  console.log(`Cuentas: productor.<clave>@${SEED_EMAIL_DOMAIN} y cliente.<clave>@${SEED_EMAIL_DOMAIN}`);
}

try {
  if (remove) await removeSeedData();
  else await seed();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
