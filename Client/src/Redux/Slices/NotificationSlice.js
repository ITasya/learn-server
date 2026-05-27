import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axiosInstance from "../../Helpers/axiosinstance";

const initialState = {
    notifications: [],
    unreadCount: 0,
};

export const getNotifications = createAsyncThunk("/notifications/get", async () => {
    try {
        const response = await axiosInstance.get("/course/notifications");
        return response.data;
    } catch (_) {
        return null;
    }
});

export const markNotificationsRead = createAsyncThunk("/notifications/read", async () => {
    try {
        await axiosInstance.post("/course/notifications/read");
        return true;
    } catch (_) {
        return false;
    }
});

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getNotifications.fulfilled, (state, action) => {
                if (action?.payload?.notifications) {
                    state.notifications = action.payload.notifications;
                    state.unreadCount = action.payload.notifications.filter(n => !n.read).length;
                }
            })
            .addCase(markNotificationsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map(n => ({ ...n, read: true }));
                state.unreadCount = 0;
            });
    },
});

export default notificationSlice.reducer;
