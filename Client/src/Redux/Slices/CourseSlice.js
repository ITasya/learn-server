import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import toast from "react-hot-toast";

import axiosInstance from "../../Helpers/axiosinstance";

const initialState ={
    courseData: []
}

export const getAllCourse = createAsyncThunk("/course/get", async ()=>{
    try {
        const response=axiosInstance.get("/course");
        toast.promise(response, {
            loading: "Загрузка курсов...",
            success: "Курсы загружены",
            error: "Не удалось загрузить курсы",
        });
        return (await response).data.courses;
    } catch (error) {
        toast.error(error?.response?.data?.message);    
    }
})

export const createNewCourse= createAsyncThunk("/course/create", async(data)=>{
    try {
        let fromData = new FormData();
        fromData.append("title",data?.title);
        fromData.append("description",data?.description);
        fromData.append("category",data?.category);
        fromData.append("createdBy",data?.createdBy);
        fromData.append("thumbnail",data?.thumbnail);

        const response=axiosInstance.post("/course", fromData);
        toast.promise(response, {
            loading: "Создание курса...",
            success: "Курс успешно создан",
            error: "Не удалось создать курс",
        });

        return (await response).data;
        
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
})

export const assignCourse = createAsyncThunk("/course/assign", async ({ courseId, userIds, action }) => {
    try {
        const response = axiosInstance.post(`/course/${courseId}/assign`, { userIds, action });
        toast.promise(response, {
            loading: "Обновление назначений...",
            success: action === 'add' ? "Курс назначен сотрудникам" : "Назначение отменено",
            error: "Ошибка назначения",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const setCoursePublic = createAsyncThunk("/course/setPublic", async ({ courseId, isPublic }) => {
    try {
        const response = await axiosInstance.patch(`/course/${courseId}/public`, { isPublic });
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const getEmployeesProgress = createAsyncThunk("/admin/employees", async () => {
    try {
        const response = await axiosInstance.get("/course/admin/employees");
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message ?? "Не удалось загрузить данные");
    }
});

export const getAllUsers = createAsyncThunk("/admin/users", async () => {
    try {
        const response = await axiosInstance.get("/course/admin/users");
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message);
    }
});

export const deleteCourse = createAsyncThunk("/course/delete", async (id)=>{
    try {
        const response=axiosInstance.delete(`/course/${id}`);
        toast.promise(response, {
            loading: "Удаление курса...",
            success: "Курс удалён",
            error: "Не удалось удалить курс",
        });
        return (await response).data;
    } catch (error) {
        toast.error(error?.response?.data?.message);    
    }
})

export const updateCourse = createAsyncThunk("/course/update", async (data) => {
    try {
      // creating the form data from user data
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("createdBy", data.createdBy);
      formData.append("description", data.description);
      // backend is not allowing change of thumbnail
      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }
  
      const res = axiosInstance.put(`/course/${data.id}`, {
        title: data.title,
        category: data.category,
        createdBy: data.createdBy,
        description: data.description,
      });
  
      toast.promise(res, {
        loading: "Обновление курса...",
        success: "Курс обновлён",
        error: "Не удалось обновить курс",
      });
  
      const response = await res;
      return response.data;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  });

const courseSlice = createSlice({
    name: "course",
    initialState: {
        courseData: [],
        employees: [],
        allUsers: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllCourse.fulfilled, (state, action) => {
                if (action.payload) state.courseData = [...action.payload];
            })
            .addCase(getEmployeesProgress.fulfilled, (state, action) => {
                if (action?.payload?.employees) state.employees = action.payload.employees;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                if (action?.payload?.users) state.allUsers = action.payload.users;
            })
            .addCase(assignCourse.fulfilled, (state, action) => {
                if (action?.payload?.course) {
                    const idx = state.courseData.findIndex(c => c._id === action.payload.course._id);
                    if (idx !== -1) state.courseData[idx] = { ...state.courseData[idx], ...action.payload.course };
                }
            })
            .addCase(setCoursePublic.fulfilled, (state, action) => {
                if (action?.payload?.course) {
                    const idx = state.courseData.findIndex(c => c._id === action.payload.course._id);
                    if (idx !== -1) state.courseData[idx] = { ...state.courseData[idx], ...action.payload.course };
                }
            });
    },
});

export default courseSlice.reducer;
