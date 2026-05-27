import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosinstance";

const initialState = {
    progress: [],
    loading: false,
};

export const getMyProgress = createAsyncThunk("/progress/me", async () => {
    try {
        const response = await axiosInstance.get("/course/progress/me");
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message ?? "Не удалось загрузить прогресс");
    }
});

const progressSlice = createSlice({
    name: "progress",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMyProgress.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMyProgress.fulfilled, (state, action) => {
                state.loading = false;
                if (action?.payload?.progress) {
                    state.progress = action.payload.progress;
                }
            })
            .addCase(getMyProgress.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default progressSlice.reducer;
