import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CourseCard from "../../Compontents/CourseCard";
import HomeLayout from "../../Layouts/HomeLayout";
import { getAllCourse } from "../../Redux/Slices/CourseSlice";

function CourseList() {
    const dispatch = useDispatch();
    const { courseData } = useSelector((state) => state.course);
    const { role, data: userData } = useSelector((state) => state.auth);
    const userId = userData?._id;

    useEffect(() => {
        dispatch(getAllCourse());
    }, []);

    const assignedCourses = courseData.filter(c =>
        c.assignedTo?.some(id => id === userId || id?.toString() === userId)
    );
    const publicCourses = courseData.filter(c => c.isPublic);
    const hasAssigned = role === 'USER' && assignedCourses.length > 0;

    return (
        <HomeLayout>
            <div className="min-h-[90vh] bg-gradient-to-br from-white to-primary-50 pt-12 flex flex-col gap-10 pb-10 px-6">

                {/* Assigned courses section */}
                {hasAssigned && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            <span className="text-primary-600">Назначенные вам</span> курсы
                        </h2>
                        <div className="grid xl:grid-cols-3 md:grid-cols-2 mx-auto gap-8 grid-cols-1">
                            {assignedCourses.map(c => <CourseCard key={c._id} data={c} />)}
                        </div>
                    </div>
                )}

                {/* All / public courses section */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-center text-3xl font-bold text-gray-900">
                        {role === 'ADMIN' ? 'Все курсы' : 'Курсы для всех сотрудников'}
                        {role !== 'ADMIN' && (
                            <span className="text-primary-600"> платформы</span>
                        )}
                    </h1>
                    {courseData.length > 0 ? (
                        <div className="grid xl:grid-cols-3 md:grid-cols-2 mx-auto gap-8 grid-cols-1">
                            {(role === 'ADMIN' ? courseData : publicCourses).map(c => (
                                <CourseCard key={c._id} data={c} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-gray-400">
                            <p className="text-xl">Курсы пока не добавлены</p>
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}

export default CourseList;
