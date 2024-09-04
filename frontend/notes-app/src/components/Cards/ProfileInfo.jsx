import React from "react";
import { getInitials } from "../../utils/helper";

const ProfileInfo = ({ userInfo,onLogout }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center rounded-full text-stat-950 font-medium bg-state-100 ">
        {getInitials(userInfo?.fullName)}
      </div>
      <div>
        <p className="text-sm font-medium">William</p>
        <button className="text-sm text-state-700 font-medium underline " onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;