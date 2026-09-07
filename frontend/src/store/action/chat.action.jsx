import axios from "axios";

import { getMessages, deleteMessage } from "../reducer/chat.slice";

export const fetchMessage = (groupId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/chat/group/${groupId}/group-messages`, {
      withCredentials: true,
    });
    dispatch(getMessages(res.data.messages));
  } catch (error) {
    console.log("chat-error", error);
  }
};

export const removeMessage = (messageId) => async (dispatch) => {
  try {
    await axios.delete(`/api/chat/messages/${messageId}`, {
      withCredentials: true,
    });
    dispatch(deleteMessage(messageId));
  } catch (error) {
    console.log("chat-error", error);
  }
};

export const uploadFile = async (groupId, file, caption = "") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) {
      formData.append("caption", caption);
    }

    const res = await axios.post(
      `/api/chat/group/${groupId}/upload`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};
