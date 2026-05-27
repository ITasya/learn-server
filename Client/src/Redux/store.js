import { configureStore } from "@reduxjs/toolkit";

import AuthSliceReducer from "./Slices/AuthSlice";
import CourseSliceReducer from "./Slices/CourseSlice";
import LecturesReducer from './Slices/LectureSlice';
import NotificationReducer from './Slices/NotificationSlice';
import ProgressReducer from './Slices/ProgressSlice';
import RazorpayReducer from './Slices/RazorpaySlice';
import StatReducer from './Slices/StatSlice';

const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,
        course: CourseSliceReducer,
        razorpay: RazorpayReducer,
        lecture: LecturesReducer,
        stat: StatReducer,
        progress: ProgressReducer,
        notification: NotificationReducer,
    },
    devTools: true
})
export default store;