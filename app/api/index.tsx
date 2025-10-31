export async function getUsers() {
  const res = await fetch("http://localhost:3001/api/users");
  const data = await res.json();
  return data;
}
