import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyGroups } from "../store/action/group.action";

import StatCard from "../components/dashboard/StatCard";
import UserProfileCard from "../components/dashboard/UserProfileCard";
import QuickActions from "../components/dashboard/QuickActions";
import GroupsTable from "../components/dashboard/GroupsTable";
import InviteCodes from "../components/dashboard/InviteCodes";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const groups = useSelector((state) => state.group.group) || [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        await dispatch(fetchMyGroups());
      } catch (err) {
        setError("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [dispatch]);

  const firstName = user?.fullName?.firstName || "Student";
  const lastName = user?.fullName?.lastName || "";
  const email = user?.email || "—";
  const role = user?.role || "user";

  const studyGroups = groups.filter((g) => g.type === "study");
  const friendGroups = groups.filter((g) => g.type === "friend");
  const adminGroups = groups.filter((g) => g.myRole === "admin");

  return (
    <div className="min-h-screen bg-base-200">
      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 px-8 mb-8 shadow-lg rounded-2xl bg-gradient-to-r from-primary to-secondary py-7 shadow-primary/20">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-primary-content/80">
              {getGreeting()},
            </p>
            <h1 className="mt-1 text-4xl font-black lg:text-5xl text-primary-content">
              {firstName} {lastName}
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border rounded-full bg-primary-content/20 text-primary-content backdrop-blur-sm border-primary-content/30">
            🎓 {role === "admin" ? "Administrator" : "Student"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="flex flex-col gap-4">
            <UserProfileCard
              firstName={firstName}
              lastName={lastName}
              email={email}
              role={role}
            />
            <QuickActions />
          </aside>

          <main className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              <StatCard
                icon="🏫"
                label="Total Groups"
                value={loading ? "—" : groups.length}
                sub="Groups you belong to"
                color="primary"
              />
              <StatCard
                icon="📚"
                label="Study Groups"
                value={loading ? "—" : studyGroups.length}
                sub="Academic collaborations"
                color="secondary"
              />
              <StatCard
                icon="👥"
                label="Friend Groups"
                value={loading ? "—" : friendGroups.length}
                sub="Social circles"
                color="accent"
              />
            </div>

            <div className="border shadow-sm card bg-base-100 border-base-300">
              <div className="gap-4 p-5 card-body">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black card-title">My Groups</h2>
                  {!loading && !error && (
                    <span className="badge badge-neutral badge-sm">
                      {groups.length} total
                    </span>
                  )}
                </div>
                <GroupsTable groups={groups} loading={loading} error={error} />
              </div>
            </div>

            <InviteCodes adminGroups={adminGroups} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
