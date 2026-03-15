import React, { useMemo } from "react";

const MemberPanel = ({ members = [], onlineUsers = [] }) => {

  // Convert to Set for O(1) lookup
  const onlineSet = useMemo(() => new Set(onlineUsers), [onlineUsers]);

  const onlineCount = onlineUsers.length;
  const totalCount = members.length;

  return (
    <div className="flex flex-col w-64 border-r bg-base-100 border-base-300">

      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-bold">Members</h2>

        <p className="text-xs text-base-content/60">
          <span className="font-semibold text-success">{onlineCount} online</span>
          {" • "}
          {totalCount} total
        </p>
      </div>

      {/* Members List */}
      <div className="flex-1 p-4 overflow-y-auto">

        {totalCount === 0 ? (
          <div className="text-center text-base-content/40">
            <p className="text-sm">No members found</p>
          </div>
        ) : (
          members.map((member) => {

            const user = member.user || member;

            const userId = user._id;
            const firstName = user?.fullName?.firstName || "User";
            const lastName = user?.fullName?.lastName || "";

            const isOnline = onlineSet.has(userId);

            return (
              <div
                key={userId}
                className={`flex items-center gap-3 p-2 mb-2 rounded-lg transition-colors
                ${isOnline ? "bg-success/10" : "hover:bg-base-200"}`}
              >

                {/* Avatar */}
                <div className="relative avatar">

                  <div className="w-10 rounded-full ring-2 ring-offset-2 ring-offset-base-100 ring-base-300">
                    <img
                      src={`https://ui-avatars.com/api/?name=${firstName}&background=random`}
                      alt={`${firstName} ${lastName}`}
                    />
                  </div>

                  {/* Online Indicator */}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full border-base-100
                    ${isOnline ? "bg-success animate-pulse" : "bg-base-300"}`}
                    title={isOnline ? "Online" : "Offline"}
                  />
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-base-content">
                    {firstName} {lastName}
                  </p>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-base-content/60">
                      {member.role === "admin" ? "Admin" : "Member"}
                    </p>

                    {isOnline && (
                      <span className="text-xs font-medium text-success">
                        ●
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}

      </div>

      {/* Footer */}
      <div className="p-3 border-t border-base-300 bg-base-200/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-base-content/60">Active now</span>

          <span className="font-bold badge badge-success badge-sm">
            {onlineCount}
          </span>
        </div>
      </div>

    </div>
  );
};

export default MemberPanel;