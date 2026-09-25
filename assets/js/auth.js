// assets/js/auth.js
// NEXO — autenticação e criação de perfis.

const msg = (text, type = "info") => {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`;
};

function redirectByType(tipo) {
  window.location.href =
    tipo === "empresa"
      ? "../empresa/dashboard.html"
      : "../candidato/perfil.html";
}

async function cadastrarUsuario(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar").value;
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value;

  if (!nome || !email || !senha || !tipo) {
    msg("Preencha todos os campos obrigatórios.", "error");
    return;
  }

  if (senha.length < 8) {
    msg("A senha deve ter pelo menos 8 caracteres.", "error");
    return;
  }

  if (senha !== confirmar) {
    msg("As senhas não conferem.", "error");
    return;
  }

  msg("Criando seu acesso...");

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome,
        tipo
      }
    }
  });

  if (error) {
    msg(error.message, "error");
    return;
  }

  // Em projetos com confirmação de e-mail, session pode ser null.
  if (!data.session) {
    msg(
      "Cadastro realizado. Verifique seu e-mail para confirmar o acesso.",
      "success"
    );
    event.target.reset();
    return;
  }

  // O trigger do banco cria/atualiza usuarios automaticamente.
  redirectByType(tipo);
}

async function entrar(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    msg("Informe e-mail e senha.", "error");
    return;
  }

  msg("Entrando...");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    msg("E-mail ou senha inválidos.", "error");
    return;
  }

  const user = data.user;

  const { data: perfil, error: perfilError } = await supabaseClient
    .from("usuarios")
    .select("tipo")
    .eq("id", user.id)
    .maybeSingle();

  if (perfilError) {
    msg("Acesso autenticado, mas não foi possível carregar seu perfil.", "error");
    return;
  }

  redirectByType(perfil?.tipo || user.user_metadata?.tipo || "candidato");
}

async function sair() {
  await supabaseClient.auth.signOut();
  window.location.href = "../auth/login.html";
}

async function protegerPagina(tipoEsperado = null) {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    window.location.href = "../auth/login.html";
    return null;
  }

  const { data: perfil } = await supabaseClient
    .from("usuarios")
    .select("id, nome, tipo, ativo")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!perfil || perfil.ativo === false) {
    await supabaseClient.auth.signOut();
    window.location.href = "../auth/login.html";
    return null;
  }

  if (tipoEsperado && perfil.tipo !== tipoEsperado) {
    redirectByType(perfil.tipo);
    return null;
  }

  return { user: data.user, perfil };
}

document.addEventListener("DOMContentLoaded", () => {
  const cadastro = document.getElementById("formCadastro");
  const login = document.getElementById("formLogin");
  const logout = document.getElementById("btnSair");

  cadastro?.addEventListener("submit", cadastrarUsuario);
  login?.addEventListener("submit", entrar);
  logout?.addEventListener("click", sair);
});
