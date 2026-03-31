/* QuickActions — DaisyUI btn classes only */
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "../groups/CreateGroupModal";
import JoinGroupModal from "../groups/JoinGroupModal";

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-3 p-5 border shadow-sm rounded-2xl border-base-300 bg-base-100">
      <h3 className="text-lg font-black text-base-content">⚡ Quick Actions</h3>
      <div className="flex flex-col gap-2">
        <CreateGroupModal />
        <JoinGroupModal />
      </div>
      <div className="gap-2"></div>
    </div>
  );
};

export default QuickActions;
