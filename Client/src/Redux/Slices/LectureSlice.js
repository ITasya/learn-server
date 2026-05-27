import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosinstance";

const initialState = {
    lectures: [],
};

export const getCourseLectures = createAsyncThunk("/course/lecture/get", async (cid) => {
    try {
        const response = axiosInstance.get(`/course/${cid}`);
        toast.promise(response, {
            loading: "Загрузка лекций...",
            success: "Лекции загружены",
            error: "Не удалось загрузить лекции",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const addCourseLectures = createAsyncThunk("/course/lecture/add", async (formData) => {
    try {
        // formData is a FormData object — axios will set multipart header automatically
        const response = axiosInstance.post(`/course/${formData.get("id") ?? formData.get("_id")}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        toast.promise(response, {
            loading: "Сохранение лекции...",
            success: "Лекция добавлена!",
            error: "Не удалось добавить лекцию",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const deleteCourseLecture = createAsyncThunk("/course/lecture/delete", async (data) => {
    try {
        const response = axiosInstance.delete(`/course/${data.courseId}/lectures/${data.lectureId}`);
        toast.promise(response, {
            loading: "Удаление лекции...",
            success: "Лекция удалена",
            error: "Не удалось удалить лекцию",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getQuiz = createAsyncThunk("/course/quiz/get", async ({ courseId, lectureId }) => {
    try {
        const response = await axiosInstance.get(`/course/${courseId}/lectures/${lectureId}/quiz`);
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message ?? "Не удалось загрузить тест");
    }
});

export const submitQuiz = createAsyncThunk("/course/quiz/submit", async ({ courseId, lectureId, answers }) => {
    try {
        const response = axiosInstance.post(
            `/course/${courseId}/lectures/${lectureId}/quiz/submit`,
            { answers }
        );
        toast.promise(response, {
            loading: "Проверка ответов...",
            success: "Результаты получены",
            error: "Ошибка при проверке теста",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const updateCourseLecture = createAsyncThunk("/course/lecture/update", async ({ courseId, lectureId, formData }) => {
    try {
        const response = axiosInstance.put(`/course/${courseId}/lectures/${lectureId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        toast.promise(response, {
            loading: "Сохранение изменений...",
            success: "Лекция обновлена!",
            error: "Не удалось обновить лекцию",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const markLectureComplete = createAsyncThunk("/course/lecture/complete", async ({ courseId, lectureId }) => {
    try {
        const response = await axiosInstance.post(`/course/${courseId}/lectures/${lectureId}/complete`);
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message ?? "Ошибка");
    }
});

const lectureSlice = createSlice({
    name: "lecture",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCourseLectures.fulfilled, (state, action) => {
                if (action?.payload?.lectures) {
                    state.lectures = action.payload.lectures;
                }
            })
            .addCase(addCourseLectures.fulfilled, (state, action) => {
                // After add, the course page re-fetches — nothing to do here
            });
    },
});

export default lectureSlice.reducer;
