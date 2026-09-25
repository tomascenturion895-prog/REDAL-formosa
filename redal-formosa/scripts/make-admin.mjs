// SOLO PARA PRUEBAS. Crea (o promueve) una cuenta admin usando la service role key del .env.
//
//   npm run make-admin -- correo@ejemplo.com
//   npm run make-admin -- correo@ejemplo.com MiClaveSegura123
//
// Si la cuenta existe, solo la pasa a admin. Si no existe, la crea ya confirmada; sin contraseña
// en los argumentos genera una aleatoria y la muestra una sola vez. Nada queda escrito en el repo.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [email, givenPassword] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !email.includes("@")) {
  console.error("Uso: npm run make-admin -- correo@ejemplo.com [contraseña]");
  process.exit(1);
}
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser(address) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === address.toLowerCase());
    if (found || data.users.length < 200) return found ?? null;
  }
  return null;
}

let user = await findUser(email);
let password = null;

if (!user) {
  password = givenPassword ?? randomBytes(9).toString("base64url");
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Administrador de pruebas" },
  });
  if (error) throw error;
  user = data.user;
}

const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
if (error) throw error;

console.log(`Listo: ${email} ahora es admin.`);
if (password) console.log(`Cuenta creada. Contraseña: ${password}`);
else console.log("La cuenta ya existía; su contraseña no cambió.");
