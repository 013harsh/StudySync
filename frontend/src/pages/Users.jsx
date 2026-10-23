import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllusers } from "../store/action/auth.action";

const Users = () => {
  const dispatch = useDispatch();
  const {
    allUsers,
    usersLoading,
    usersError,
    user: currentUser,
  } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all', 'user', 'admin'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'az', 'za'
  const [viewMode, setViewMode] = useState("table"); // 'table', 'grid'

  useEffect(() => {
    dispatch(getAllusers());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getAllusers());
  };

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(allUsers)) return [];

    return allUsers
      .filter((u) => {
        const firstName = u?.fullName?.firstName || "";
        const lastName = u?.fullName?.lastName || "";
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const role = (u?.role || "").toLowerCase();
        const query = searchQuery.trim().toLowerCase();

        const matchesSearch =
          !query || fullName.includes(query) || role.includes(query);

        const matchesRole =
          roleFilter === "all" ||
          (roleFilter === "admin" && u?.role === "admin") ||
          (roleFilter === "user" && (u?.role === "user" || !u?.role));

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === "az") {
          const nameA =
            `${a?.fullName?.firstName || ""} ${a?.fullName?.lastName || ""}`
              .trim()
              .toLowerCase();
          const nameB =
            `${b?.fullName?.firstName || ""} ${b?.fullName?.lastName || ""}`
              .trim()
              .toLowerCase();
          return nameA.localeCompare(nameB);
        }
        if (sortBy === "za") {
          const nameA =
            `${a?.fullName?.firstName || ""} ${a?.fullName?.lastName || ""}`
              .trim()
              .toLowerCase();
          const nameB =
            `${b?.fullName?.firstName || ""} ${b?.fullName?.lastName || ""}`
              .trim()
              .toLowerCase();
          return nameB.localeCompare(nameA);
        }
        if (sortBy === "oldest") {
          return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
        }
        // Default: newest
        return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      });
  }, [allUsers, searchQuery, roleFilter, sortBy]);

  // Statistics
  const totalCount = allUsers?.length || 0;
  const adminCount = allUsers?.filter((u) => u?.role === "admin")?.length || 0;
  const studentCount = totalCount - adminCount;

  return (
    <div className="min-h-screen pb-16 bg-base-200">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* ── Hero Banner ── */}
        <div className="relative p-6 mb-8 overflow-hidden shadow-xl sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-secondary text-primary-content">
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none w-96 h-96 bg-white/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase rounded-full bg-white/20 backdrop-blur-md">
                <span>👥 Community Directory</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                All Users & Members
              </h1>
              <p className="max-w-2xl mt-2 text-sm sm:text-base text-primary-content/85">
                Connect and collaborate with learners, mentors, and administrators across StudySync.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={usersLoading}
              className="gap-2 text-white border-0 shadow-sm btn btn-sm sm:btn-md bg-white/20 hover:bg-white/30 backdrop-blur-md"
              title="Refresh users list"
            >
              <svg
                className={`w-4 h-4 ${usersLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{usersLoading ? "Refreshing..." : "Refresh List"}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-3 sm:gap-4">
            <div className="p-3 border rounded-2xl bg-white/10 backdrop-blur-sm border-white/15">
              <span className="text-xs font-medium text-primary-content/80">
                Total Members
              </span>
              <div className="text-2xl font-black">{totalCount}</div>
            </div>
            <div className="p-3 border rounded-2xl bg-white/10 backdrop-blur-sm border-white/15">
              <span className="text-xs font-medium text-primary-content/80">
                🎓 Students
              </span>
              <div className="text-2xl font-black">{studentCount}</div>
            </div>
            <div className="col-span-2 p-3 border rounded-2xl sm:col-span-1 bg-white/10 backdrop-blur-sm border-white/15">
              <span className="text-xs font-medium text-primary-content/80">
                🛡️ Administrators
              </span>
              <div className="text-2xl font-black">{adminCount}</div>
            </div>
          </div>
        </div>

        {/* ── Filters & Controls Bar ── */}
        <div className="p-4 mb-6 border shadow-sm rounded-2xl bg-base-100 border-base-300">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-base-content/50">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 input input-bordered input-sm sm:input-md bg-base-200/50 focus:bg-base-100 focus:input-primary rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-base-content/50 hover:text-base-content"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills, Sort, and View Mode */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Role filter */}
              <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`join-item btn btn-xs sm:btn-sm border-0 rounded-lg ${
                    roleFilter === "all"
                      ? "btn-primary shadow-sm"
                      : "btn-ghost text-base-content/70 hover:text-base-content"
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setRoleFilter("user")}
                  className={`join-item btn btn-xs sm:btn-sm border-0 rounded-lg ${
                    roleFilter === "user"
                      ? "btn-primary shadow-sm"
                      : "btn-ghost text-base-content/70 hover:text-base-content"
                  }`}
                >
                  Students ({studentCount})
                </button>
                <button
                  onClick={() => setRoleFilter("admin")}
                  className={`join-item btn btn-xs sm:btn-sm border-0 rounded-lg ${
                    roleFilter === "admin"
                      ? "btn-primary shadow-sm"
                      : "btn-ghost text-base-content/70 hover:text-base-content"
                  }`}
                >
                  Admins ({adminCount})
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered select-xs sm:select-sm rounded-xl bg-base-200/50"
              >
                <option value="newest">🕒 Newest first</option>
                <option value="oldest">🕰️ Oldest first</option>
                <option value="az">🔤 Name (A - Z)</option>
                <option value="za">🔠 Name (Z - A)</option>
              </select>

              {/* View Toggle */}
              <div className="join bg-base-200 p-0.5 rounded-xl border border-base-300">
                <button
                  onClick={() => setViewMode("table")}
                  className={`join-item btn btn-xs sm:btn-sm border-0 rounded-lg ${
                    viewMode === "table"
                      ? "btn-primary shadow-sm"
                      : "btn-ghost text-base-content/70"
                  }`}
                  title="Table View"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`join-item btn btn-xs sm:btn-sm border-0 rounded-lg ${
                    viewMode === "grid"
                      ? "btn-primary shadow-sm"
                      : "btn-ghost text-base-content/70"
                  }`}
                  title="Grid View"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Error State ── */}
        {usersError && (
          <div className="mb-6 shadow-sm alert alert-error rounded-2xl">
            <svg
              className="w-6 h-6 stroke-current shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error loading users</h3>
              <div className="text-xs">{usersError}</div>
            </div>
            <button onClick={handleRefresh} className="btn btn-sm btn-ghost">
              Try Again
            </button>
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {usersLoading && (
          <div className="p-6 border shadow-sm rounded-2xl bg-base-100 border-base-300">
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between py-2 border-b border-base-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-base-300"></div>
                    <div className="w-36 h-4 rounded bg-base-300"></div>
                  </div>
                  <div className="w-20 h-6 rounded-full bg-base-300"></div>
                  <div className="w-24 h-4 rounded bg-base-300"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {!usersLoading && filteredUsers.length > 0 ? null : !usersLoading && (
          <div className="p-12 text-center border shadow-sm rounded-3xl bg-base-100 border-base-300">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl rounded-full bg-base-200">
              🔍
            </div>
            <h3 className="text-xl font-bold">No members found</h3>
            <p className="max-w-md mx-auto mt-2 text-sm text-base-content/60">
              {searchQuery
                ? `No users match "${searchQuery}". Try adjusting your search query or reset filters.`
                : "No users currently match the selected criteria."}
            </p>
            {(searchQuery || roleFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
                className="mt-4 btn btn-outline btn-sm rounded-xl"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ── Content View: Table ── */}
        {!usersLoading && filteredUsers.length > 0 && viewMode === "table" && (
          <div className="overflow-x-auto border shadow-sm rounded-2xl bg-base-100 border-base-300">
            <table className="table w-full table-zebra">
              <thead>
                <tr className="text-xs tracking-wider uppercase bg-base-200/50 text-base-content/80">
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((member) => {
                  const firstName = member?.fullName?.firstName || "Member";
                  const lastName = member?.fullName?.lastName || "";
                  const fullName = `${firstName} ${lastName}`.trim();
                  const role = member?.role || "user";
                  const isMe =
                    currentUser?._id && currentUser._id === member._id;
                  const joinedDate = member?.createdAt
                    ? new Date(member.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={member._id || fullName}
                      className={isMe ? "bg-primary/5" : ""}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="overflow-hidden border rounded-full w-9 h-9 border-base-300">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                firstName + " " + lastName,
                              )}&background=random&color=fff&size=80`}
                              alt={fullName}
                            />
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{fullName}</span>
                              {isMe && (
                                <span className="py-1 badge badge-accent badge-xs">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold ${
                            role === "admin"
                              ? "badge-secondary text-secondary-content"
                              : "badge-primary badge-outline"
                          }`}
                        >
                          {role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/70">
                        {joinedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Content View: Grid ── */}
        {!usersLoading && filteredUsers.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredUsers.map((member) => {
              const firstName = member?.fullName?.firstName || "Member";
              const lastName = member?.fullName?.lastName || "";
              const fullName = `${firstName} ${lastName}`.trim();
              const role = member?.role || "user";
              const isMe = currentUser?._id && currentUser._id === member._id;
              const joinedDate = member?.createdAt
                ? new Date(member.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })
                : "Joined recently";

              return (
                <div
                  key={member._id || fullName}
                  className={`group relative flex flex-col justify-between p-5 border rounded-2xl bg-base-100 border-base-300 shadow-sm hover:shadow-md transition-all duration-200 ${
                    isMe ? "ring-2 ring-primary/40 bg-primary/5" : ""
                  }`}
                >
                  <div>
                    {/* Top row: Avatar & Role */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 overflow-hidden transition-colors border-2 rounded-full border-primary/20 group-hover:border-primary">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              firstName + " " + lastName,
                            )}&background=random&color=fff&size=120`}
                            alt={fullName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success ring-2 ring-base-100"></span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {isMe && (
                          <span className="badge badge-accent badge-xs font-bold uppercase tracking-wider py-1.5 px-2">
                            You
                          </span>
                        )}
                        <span
                          className={`badge badge-sm font-semibold gap-1 ${
                            role === "admin"
                              ? "badge-secondary text-secondary-content"
                              : "badge-primary badge-outline"
                          }`}
                        >
                          {role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="mt-4">
                      <h3
                        className="text-base font-bold truncate text-base-content"
                        title={fullName}
                      >
                        {fullName}
                      </h3>
                    </div>

                    {/* Joined Date */}
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-base-content/50">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Member since {joinedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Bottom count indicator ── */}
        {!usersLoading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-2 mt-4 text-xs text-base-content/60">
            <span>
              Showing{" "}
              <strong className="text-base-content">
                {filteredUsers.length}
              </strong>{" "}
              of <strong className="text-base-content">{totalCount}</strong>{" "}
              users
            </span>
            {searchQuery && (
              <span className="text-primary">
                Filtered by &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
