import axios from "axios";
import { addGroup, deleteg, setGroup, setGroups } from "../reducer/group.slice";

export const createGroup = (data) => async (dispatch) => {
  try {
    const res = await axios.post("/api/group/create", data);
    dispatch(addGroup(res.data.group));
  } catch (error) {
    console.log("error occured while creating group", error.message);
  }
};
export const deleteGroup = (groupId) => async (dispatch) => {
  try {
    const res = await axios.delete(`/api/group/delete/${groupId}`, {
      withCredentials: true,
    });

    console.log(res.data);
    dispatch(deleteg(res.data));
  } catch (error) {
    console.log(error);
  }
};

export const joinGroup = (inviteCode) => async (dispatch) => {
  try {
    const res = await axios.post(
      "/api/group/join",
      { inviteCode },
      { withCredentials: true }
    );
    console.log(res.data);
    dispatch(addGroup(res.data.group));
    return res.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || error;
  }
};
export const fetchMyGroups = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/group/my-groups", {
      withCredentials: true,
    });
    // Send data to the Redux store
    dispatch(setGroups(res.data.groups || []));
  } catch (error) {
    console.log("Error fetching my groups: ", error.message);
  }
};

// export const leaveGroup = () => async () => {};
// export const getGroupMembers = () => async () => {};
