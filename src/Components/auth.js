const USERS_KEY = "leetlens_users";
const SESSION_KEY = "leetlens_session";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

export function signup({ username, email, password }) {
  const users = readUsers();
  const cleanEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === cleanEmail)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const user = { username: username.trim(), email: cleanEmail, password };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ username: user.username, email: user.email })
  );
  return { ok: true };
}

export function login(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const user = readUsers().find(
    (u) => u.email === cleanEmail && u.password === password
  );

  if (!user) return { ok: false, error: "Invalid email or password." };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ username: user.username, email: user.email })
  );
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}