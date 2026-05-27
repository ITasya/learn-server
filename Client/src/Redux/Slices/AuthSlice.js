import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosinstance"

const isBrowser = typeof window !== "undefined";

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const initialState = {
  isLoggedIn: isBrowser ? localStorage.getItem("isLoggedIn") === "true" : false,
  role: isBrowser ? localStorage.getItem("role") || "" : "",
  data: isBrowser ? safeParse(localStorage.getItem("data"), {}) : {},
};


export const creatAccount =createAsyncThunk("/auth/singup", async(data)=>{
    try {
        const res =axiosInstance.post("user/register", data);
        toast.promise(res,{
            loading:"Создаём аккаунт...",
            success:(data)=>{ return data?.data?.message; },
            error:"Не удалось создать аккаунт"
        })
        return(await res).data;
        
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

export const login =createAsyncThunk("/auth/login", async(data)=>{
    try {
        const res =axiosInstance.post("user/login", data);
        toast.promise(res,{
            loading:"Выполняем вход...",
            success:(data)=>{ return data?.data?.message; },
            error:"Не удалось войти"
        })
        return(await res).data;
        
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

export const logout=createAsyncThunk("/auth/logout", async ()=>{
    try {
        const res =axiosInstance.post("user/logout");
        toast.promise(res,{
            loading:"Выходим...",
            success:(data)=>{ return data?.data?.message; },
            error:"Не удалось выйти"
        })
        return(await res).data;

    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})

export const updateProfile=createAsyncThunk("/user/update/profile", async ( data)=>{
    try {
        const res =axiosInstance.put(`user/update`, data);
        toast.promise(res,{
            loading:"Обновляем профиль...",
            success:(data)=>{ return data?.data?.message; },
            error:"Не удалось обновить профиль"
        })
        return(await res).data;

    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})

export const getuserData=createAsyncThunk("/user/details", async ()=>{
    try {
        const res =axiosInstance.get("user/me");
        return(await res).data;
    } catch (error) {
        toast.error(error?.message)
    }
})

export const forgetPassword =createAsyncThunk("/auth/forget-Password", async(data)=>{
    try {
        const res =axiosInstance.post("user/reset", data);
        toast.promise(res,{
            loading:"Отправляем письмо...",
            success:(data)=>{ return data?.data?.message; },
            error:"Не удалось отправить письмо"
        })
        return(await res).data;
        
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

export const changePassword = createAsyncThunk(
    "/auth/changePassword",
    async (userPassword) => {
        try {
        let res = axiosInstance.post("/user/change-password", userPassword);
        toast.promise(res,{
            loading:"Меняем пароль...",
            success:(data)=>{ return data?.data?.message; },
            error:"Не удалось изменить пароль"
        })
        return(await res).data;
        } catch (error) {
        toast.error(error?.response?.data?.message);
        }
 });

export const resetPassword = createAsyncThunk("/user/reset", async (data) => {
    try {
        let res = axiosInstance.post(`/user/reset/${data.resetToken}`, { password: data.password });
        toast.promise(res,{
            loading:"Сбрасываем пароль...",
            success:(data)=>{ return data?.data?.message; },
            error:"Не удалось сбросить пароль"
        })
        return(await res).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(creatAccount.fulfilled, (state, action)=>{
            localStorage.setItem("data", JSON.stringify(action?.payload?.user));
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("role", action?.payload?.user?.role);
            state.data=action?.payload?.user;
            state.role=action?.payload?.user?.role
            state.isLoggedIn = true;

        })
        .addCase(login.fulfilled, (state, action)=>{
            localStorage.setItem("data", JSON.stringify(action?.payload?.user));
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("role", action?.payload?.user?.role);
            state.data=action?.payload?.user;
            state.role=action?.payload?.user?.role
            {state.role &&(state.isLoggedIn=true) } 

        })
        .addCase(logout.fulfilled, (state)=>{
            localStorage.clear();
            state.data={};
            state.isLoggedIn=false;
            state.role="";

        })
        .addCase(getuserData.fulfilled, (state, action)=>{
            if(action?.payload?.user)return;
            localStorage.setItem("data", JSON.stringify(action?.payload?.user));
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("role", action?.payload?.user?.role);
            state.isLoggedIn=true;
            state.data=action?.payload?.user;
            state.role=action?.payload?.user?.role

        })

    }
});

// export const {}= authSlice.actions;
export default authSlice.reducer;