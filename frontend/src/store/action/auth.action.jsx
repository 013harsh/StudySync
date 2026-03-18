import axios from "axios";
import { loginSuccess, logout, Register } from "../reducer/auth.sclice";

// const dispatch = useDispatch();
export const userRegister = (data) => async (dispatch) => {
  try {
    const res = await axios.post("/api/auth/register", data, {
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
    const res = await axios.post("/api/auth/login", data, {
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
    await axios.post("/api/auth/logout", data, {
      withCredentials: true,
    });
    console.log();
    dispatch(logout());
  } catch (error) {
    console.log("error", error);
  }
};
export const usercurrent = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/auth/me", {
      withCredentials: true,
    });

    dispatch(loginSuccess(res.data.user));
    return { success: true, user: res.data.user };
  } catch (error) {
    console.log("error", error);
    dispatch(logout());
    return { success: false };
  }
};
export const userUpdate = (data) => async (dispatch) => {
  try {
    const res = await axios.put("/api/auth/profile", data, {
      withCredentials: true,
    });

    dispatch(loginSuccess(res.data.user));
  } catch (error) {
    console.log("error", error);
  }
};
