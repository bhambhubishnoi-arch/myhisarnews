"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Staff = {
  id: string;
  email: string;
  role: string;
};

export default function StaffPage() {
const supabase = createClient();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStaff() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role")
      .order("email");

    if (error) {
      console.log(error);
      return;
    }

    setStaff(data || []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role")
      .order("email");

    if (error) {
      console.log(error);
      return;
    }

    setStaff(data || []);
    setLoading(false);

      if (cancelled) return;
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [supabase]);


  async function updateRole(id: string, role: string) {

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);


    if(error){
      console.log("ROLE UPDATE ERROR:", error);
      return;
    }

    loadStaff();
  }


  return (

    <section className="p-6">

      <h1 className="mb-6 text-3xl font-bold">
        Staff Management 👥
      </h1>


      {loading ? (

        <p>Loading...</p>

      ) : (

        <div className="rounded-xl border bg-white overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Role
                </th>

              </tr>

            </thead>


            <tbody>

              {staff.map((user)=>(

                <tr key={user.id} className="border-t">

                  <td className="p-4">
                    {user.email}
                  </td>


                  <td className="p-4">

                    <select
                      value={user.role}
                      onChange={(e)=>
                        updateRole(
                          user.id,
                          e.target.value
                        )
                      }
                      className="rounded border px-3 py-2"
                    >

                      <option value="Admin">
                        Admin
                      </option>

                      <option value="Editor">
                        Editor
                      </option>

                      <option value="Reporter">
                        Reporter
                      </option>

                    </select>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );
}
