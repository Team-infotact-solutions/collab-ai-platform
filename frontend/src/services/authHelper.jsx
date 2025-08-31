export function setToken(token) {
  if (!token) return;
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token") || "";
}

export function removeToken() {
  localStorage.removeItem("token");
}

export function decodeToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}

export function isTokenExpired() {
  const decoded = decodeToken();
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}
