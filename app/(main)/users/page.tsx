// app/users/page.tsx (veya pages/users.js)
'use client';

import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/users') // ← Backend URL
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Kullanıcılar</h1>
      <ul>
        {users.map(user => (
          <li key={(user as any).id} className="mb-2">
            <strong>{(user as any).name}</strong> — {(user as any).email}
          </li>
        ))}
      </ul>
    </div>
  );
}
