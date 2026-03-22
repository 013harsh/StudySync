import axios from "axios";

import {
  getMessages,
  deleteMessage,
} from "../reducer/chat.slice";

export const fetchMessage = (groupId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/chat/groups/${groupId}/messages`, {
      withCredentials: true,
    });
    dispatch(getMessages(res.data.messages));
  } catch (error) {
    console.log("chat-error", error);
  }
};

export const removeMessage = (messageId) => async (dispatch) => {
  try {
    await axios.delete(`/api/chat/message/${messageId}`, {
      withCredentials: true,
    });
    dispatch(deleteMessage(messageId));
  } catch (error) {
    console.log("chat-error", error);
  }
};

// export const UpdateMessage = (data) => async (dispatch) => {};
// export const UpdateMessage = (data) => async (dispatch) => {};