"use client";

import { getUserRole } from "@/lib/getUserRole";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import StatCard from "@/components/admin/StatCard";
import RecentActivity from "@/components/admin/RecentActivity";

const supabaseAuth = createClient();

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    views: 0,
  });

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabaseAuth.auth.getUser();

      if (user?.email) {
        const userRole = await getUserRole();

        console.log("USER ROLE:", userRole);
      }
    }

    checkRole();
  }, []);

  useEffect(() => {
    async function loadStats() {
      const { data: articles, error } = await supabaseAuth
        .from("articles")
        .select("status, views");

      if (error) {
        console.log(error);
        return;
      }

      console.log("DASHBOARD ARTICLES:", articles);

      const total = articles?.length || 0;

      const published =
        articles?.filter(
          (item) => item.status === "published"
        ).length || 0;

      const draft =
        articles?.filter(
          (item) => item.status === "draft"
        ).length || 0;

      const views =
        articles?.reduce(
          (sum, item) => sum + (item.views || 0),
          0
        ) || 0;

      setStats({
        total,
        published,
        draft,
        views,
      });
    }

    loadStats();
  }, []);

  return (
    <main className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <section className="p-6">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">
            Welcome to MyHisarNews 👋
          </h1>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total News"
              value={String(stats.total)}
              icon="📰"
            />

            <StatCard
              title="Published"
              value={String(stats.published)}
              icon="✅"
            />

            <StatCard
              title="Draft"
              value={String(stats.draft)}
              icon="📝"
            />

            <StatCard
              title="Total Views"
              value={String(stats.views)}
              icon="👁️"
            />
          </div>

          <div className="mt-8">
            <RecentActivity />
          </div>
        </section>
      </div>
    </main>
  );
}