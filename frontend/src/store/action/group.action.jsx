import axios from "axios";
import {
  addGroup,
  deleteg,
  setGroup,
  setGroups,
  setMembers,
} from "../reducer/group.slice";

const API = import.meta.env.VITE_API_URL || "";

export const createGroup = (data) => async (dispatch) => {
  try {
    const res = await axios.post("/api/group/create", data);
    dispatch(addGroup(res.data.group));
    return res.data.group;
  } catch (error) {
    console.log("error occured while creating group", error.message);
    return { message: error.response.data.message };
  }
};

export const joinGroup = (inviteCode) => async (dispatch) => {
  try {
    const res = await axios.post(
      "/api/group/join",
      { inviteCode },
      { withCredentials: true },
    );
    console.log(res.data);
    dispatch(addGroup(res.data.group));
    return res.data;
  } catch (error) {
    console.error("Error joining group:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to join group";
    throw new Error(errorMessage);
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

export const getGroupMembers = (groupId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/group/groupmember/${groupId}`, {
      withCredentials: true,
    });
    dispatch(setMembers(res.data || []));
    return res.data;
  } catch (error) {
    console.log("Error fetching group members: ", error.message);
    throw error;
  }
};

export const deleteGroup = (groupId) => async (dispatch) => {
  try {
    const res = await axios.delete(`/api/group/deletegroup/${groupId}`, {
      withCredentials: true,
      data: { groupId },
    });

    console.log(res.data);
    dispatch(deleteg(groupId));
  } catch (error) {
    console.log(error);
  }
};
