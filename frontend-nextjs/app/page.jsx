"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState([]);

  const URL = "/api/users";

  useEffect(() => {
    async function getUsers() {
      try {
        const res = await axios.get(URL);
        setUsers(res.data.users);
        console.log(res);
      } catch (e) {
        console.log(e);
      }
    }
    getUsers();
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {users &&
          users.map((u, i) => (
            <h1 key={i}>
              {u.id}-{u.email}
            </h1>
          ))}
      </main>
    </div>
  );
}
