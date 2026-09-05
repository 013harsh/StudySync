import axios from "axios";
import { loginSuccess, logout, Register, deleteuserAccount } from "../reducer/auth.slice";

// const dispatch = useDispatch();
export const userRegister = (data) => async (dispatch) => {
  try {
    const res = await axios.post("/api/auth/userRegister", data, {
      withCredentials: true,
    });
    console.log(res.data.user);
    dispatch(Register(res.data.user));
    return { success: true, user: res.data.user };
  } catch (error) {
    console.log("error", error);
    const message = error.response?.data?.message || "Registration failed";
    return { success: false, error: message };
  }
};
export const userLogin = (data) => async (dispatch) => {
  try {
    const res = await axios.post("/api/auth/userLogin", data, {
      withCredentials: true,
    });
    console.log(res.data.user);
    dispatch(loginSuccess(res.data.user));
    return { success: true, user: res.data.user };
  } catch (error) {
    console.log("error", error);
    const message = error.response?.data?.message || "Login failed";
    return { success: false, error: message };
  }
};
export const userLogout = (data) => async (dispatch) => {
  try {
    await axios.post("/api/auth/userLogout", data, {
      withCredentials: true,
    });
    dispatch(logout());
  } catch (error) {
    console.log("error", error.data.message);
  }
};

export const userdetails = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/auth/userDetails", {
      withCredentials: true,
    });

    dispatch(loginSuccess(res.data.userdetails));
    return { success: true, userdetails: res.data.userdetails };
  } catch (error) {
    console.log("error", error);
    dispatch(logout());
    return { success: false, error: error.data.message };
  }
};

export const userUpdate = (data) => async (dispatch) => {
  try {
    const res = await axios.put("/api/auth/userUpdateProfile", data, {
      withCredentials: true,
    });

    dispatch(loginSuccess(res.data.user));
  } catch (error) {
    console.log("error", error.data.message);
  }
};
export const deleteAccount = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/auth/deleteAccount/${id}`, {
      withCredentials: true,
    });
    dispatch(deleteuserAccount());
    return { success: true };
  } catch (error) {
    console.log("error", error);
    return { success: false, error: error.response?.data?.message };
  }
};
