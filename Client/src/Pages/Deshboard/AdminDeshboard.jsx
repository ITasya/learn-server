import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Pie } from "react-chartjs-2";
import { AiOutlineClose, AiOutlineUserAdd } from 'react-icons/ai';
import { BsCollectionPlayFill, BsGlobe, BsTrash } from 'react-icons/bs';
import { FaUsers } from "react-icons/fa";
import { MdCheckCircle } from 'react-icons/md';
import { TiEdit } from "react-icons/ti";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import HomeLayout from "../../Layouts/HomeLayout";
import { assignCourse, deleteCourse, getAllCourse, getAllUsers, getEmployeesProgress, setCoursePublic } from '../../Redux/Slices/CourseSlice';
import { getPaymentRecord } from '../../Redux/Slices/RazorpaySlice';
import { getStatsData } from '../../Redux/Slices/StatSlice';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function AdminDeshboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview'); // overview | courses | employees
    const [assignModal, setAssignModal] = useState(null); // courseId | null
    const [selectedUsers, setSelectedUsers] = useState([]);

    const { allUsersCount, subscribedCount } = useSelector((state) => state.stat);
    const { allPayments, monthlySalesRecord } = useSelector((state) => state.razorpay);
    const { courseData, employees, allUsers } = useSelector((state) => state.course);

    const userData = {
        labels: ["Зарегистрированные", "С подпиской"],
        datasets: [{
            label: "Пользователи",
            data: [allUsersCount, subscribedCount],
            backgroundColor: ["#a78bfa", "#7c3aed"],
            borderWidth: 1,
            borderColor: ["#a78bfa", "#7c3aed"]
        }]
    };

    const salesData = {
        labels: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
        datasets: [{
            label: "Продажи/месяц",
            data: monthlySalesRecord,
            backgroundColor: ["#7c3aed"],
        }]
    };

    async function onCourseDelete(id) {
        if (window.confirm("Вы уверены, что хотите удалить этот курс?")) {
            const res = await dispatch(deleteCourse(id));
            if (res?.payload?.success) await dispatch(getAllCourse());
        }
    }

    async function togglePublic(course) {
        await dispatch(setCoursePublic({ courseId: course._id, isPublic: !course.isPublic }));
        await dispatch(getAllCourse());
    }

    function openAssignModal(courseId) {
        const course = courseData.find(c => c._id === courseId);
        const preSelected = (course?.assignedTo || []).map(id => id?.toString?.() ?? id);
        setSelectedUsers(preSelected);
        setAssignModal(courseId);
        dispatch(getAllUsers());
    }

    async function saveAssignment() {
        const course = courseData.find(c => c._id === assignModal);
        const currentIds = (course?.assignedTo || []).map(id => id?.toString?.() ?? id);

        const toAdd = selectedUsers.filter(id => !currentIds.includes(id));
        const toRemove = currentIds.filter(id => !selectedUsers.includes(id));

        if (toAdd.length > 0) await dispatch(assignCourse({ courseId: assignModal, userIds: toAdd, action: 'add' }));
        if (toRemove.length > 0) await dispatch(assignCourse({ courseId: assignModal, userIds: toRemove, action: 'remove' }));

        await dispatch(getAllCourse());
        setAssignModal(null);
        setSelectedUsers([]);
    }

    function toggleUserSelect(uid) {
        setSelectedUsers(prev =>
            prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
        );
    }

    useEffect(() => {
        dispatch(getAllCourse());
        dispatch(getStatsData());
        dispatch(getPaymentRecord());
    }, []);

    useEffect(() => {
        if (activeTab === 'employees') dispatch(getEmployeesProgress());
    }, [activeTab]);

    const tabs = [
        { id: 'overview', label: 'Обзор' },
        { id: 'courses', label: 'Курсы' },
        { id: 'employees', label: `Сотрудники${employees.length > 0 ? ` (${employees.length})` : ''}` },
    ];

    return (
        <HomeLayout>
            <div className="min-h-[90vh] bg-gradient-to-br from-white to-primary-50 pt-6 pb-10 flex flex-col gap-6">
                <h1 className="text-center text-3xl sm:text-4xl font-bold text-primary-700">
                    Панель администратора
                </h1>

                {/* Tabs */}
                <div className="flex mx-4 md:mx-10 border-b border-primary-100 bg-white rounded-t-xl overflow-hidden shadow-sm">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === t.id
                                ? 'border-b-2 border-primary-600 text-primary-700 bg-primary-50'
                                : 'text-gray-500 hover:text-primary-500'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ========== TAB: OVERVIEW ========== */}
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6 mx-4 md:mx-10">
                        <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl shadow-md border border-primary-100">
                            <div className="w-64 h-64 sm:w-72 sm:h-72"><Pie data={userData} /></div>
                            <div className="w-full">
                                <div className="flex items-center justify-between p-4 gap-3 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600">Сотрудников</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{allUsersCount}</h3>
                                    </div>
                                    <FaUsers className="text-primary-600 text-4xl" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl shadow-md border border-primary-100">
                            <div className="h-72 w-full relative">
                                <Bar className="absolute bottom-0 h-72 w-full" data={salesData} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="flex items-center justify-between p-4 gap-3 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600">Курсов</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{courseData.length}</h3>
                                    </div>
                                    <BsCollectionPlayFill className="text-primary-600 text-3xl" />
                                </div>
                                <div className="flex items-center justify-between p-4 gap-3 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600">Публичных</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{courseData.filter(c => c.isPublic).length}</h3>
                                    </div>
                                    <BsGlobe className="text-green-500 text-3xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== TAB: COURSES ========== */}
                {activeTab === 'courses' && (
                    <div className="mx-4 md:mx-[5%] flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Управление курсами</h2>
                            <button
                                onClick={() => navigate("/course/create")}
                                className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2 px-4 font-semibold text-sm cursor-pointer shadow-sm"
                            >
                                + Создать курс
                            </button>
                        </div>

                        <div className="overflow-x-auto w-full bg-white rounded-2xl shadow-md border border-primary-100">
                            <table className="table w-full text-sm">
                                <thead>
                                    <tr className="bg-primary-100 text-primary-800">
                                        <th>№</th>
                                        <th>Название</th>
                                        <th>Категория</th>
                                        <th>Лекций</th>
                                        <th>Для всех</th>
                                        <th>Назначено</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courseData?.map((course, idx) => (
                                        <tr key={course._id} className="hover:bg-primary-50 text-gray-800">
                                            <td>{idx + 1}</td>
                                            <td className="max-w-[160px]">
                                                <p className="truncate font-medium">{course?.title}</p>
                                            </td>
                                            <td>{course?.category}</td>
                                            <td>{course?.numberOfLectures}</td>
                                            <td>
                                                <button
                                                    onClick={() => togglePublic(course)}
                                                    title={course.isPublic ? "Сделать только по назначению" : "Открыть для всех"}
                                                    className={`px-2 py-1 rounded-full text-xs font-bold transition-colors ${course.isPublic
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {course.isPublic ? '✓ Да' : 'Нет'}
                                                </button>
                                            </td>
                                            <td>
                                                <span className="text-primary-700 font-semibold">
                                                    {course?.assignedTo?.length ?? 0} чел.
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        title="Назначить сотрудникам"
                                                        onClick={() => openAssignModal(course._id)}
                                                        className="bg-primary-100 hover:bg-primary-200 text-primary-700 text-lg py-1.5 px-2.5 rounded-lg"
                                                    >
                                                        <AiOutlineUserAdd />
                                                    </button>
                                                    <button
                                                        title="Просмотр лекций"
                                                        onClick={() => navigate("/course/displaylecture", { state: { ...course } })}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg py-1.5 px-2.5 rounded-lg"
                                                    >
                                                        <BsCollectionPlayFill />
                                                    </button>
                                                    <button
                                                        title="Редактировать"
                                                        onClick={() => navigate("/course/edit", { state: { ...course } })}
                                                        className="bg-primary-600 hover:bg-primary-700 text-white text-lg py-1.5 px-2.5 rounded-lg"
                                                    >
                                                        <TiEdit />
                                                    </button>
                                                    <button
                                                        title="Удалить"
                                                        onClick={() => onCourseDelete(course?._id)}
                                                        className="bg-red-100 hover:bg-red-200 text-red-600 text-lg py-1.5 px-2.5 rounded-lg"
                                                    >
                                                        <BsTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========== TAB: EMPLOYEES ========== */}
                {activeTab === 'employees' && (
                    <div className="mx-4 md:mx-[5%] flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Прогресс сотрудников</h2>

                        {employees.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-md border border-primary-100">
                                Сотрудники ещё не зарегистрированы или не начали обучение
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {employees.map(emp => (
                                    <div key={emp._id} className="bg-white rounded-2xl shadow-md border border-primary-100 p-5">
                                        {/* Employee header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <img
                                                src={emp.avatar?.secure_url}
                                                alt={emp.fullName}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
                                            />
                                            <div>
                                                <p className="font-bold text-gray-900 capitalize">{emp.fullName}</p>
                                                <p className="text-sm text-gray-500">{emp.email}</p>
                                            </div>
                                            <span className="ml-auto text-sm text-gray-400">
                                                Курсов начато: {emp.courses?.length ?? 0}
                                            </span>
                                        </div>

                                        {/* Courses progress */}
                                        {emp.courses?.length > 0 ? (
                                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {emp.courses.map(c => (
                                                    <div key={c.courseId} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                                                        <p className="font-semibold text-gray-800 text-sm truncate mb-2">{c.title}</p>
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>{c.completedLectures}/{c.totalLectures} лекций</span>
                                                            <span className="font-bold text-primary-700">{c.progressPercent}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-primary-600 h-1.5 rounded-full"
                                                                style={{ width: `${c.progressPercent}%` }}
                                                            />
                                                        </div>
                                                        {c.progressPercent >= 100 && (
                                                            <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                                                                <MdCheckCircle /> Завершён
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400">Ещё не приступал к курсам</p>
                                        )}

                                        {/* Quiz results */}
                                        {emp.quizAttempts?.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                                    Последние результаты тестов
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {emp.quizAttempts.slice(0, 8).map((a, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-xs px-2 py-1 rounded-full font-semibold ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                                                        >
                                                            {a.passed ? '✓' : '✗'} {a.score}% · {new Date(a.date).toLocaleDateString('ru-RU')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ========== ASSIGN MODAL ========== */}
            {assignModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">
                                Назначить сотрудников
                            </h3>
                            <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-700 text-xl">
                                <AiOutlineClose />
                            </button>
                        </div>

                        <p className="px-6 py-2 text-sm text-gray-500">
                            Курс: <span className="font-semibold text-gray-800">{courseData.find(c => c._id === assignModal)?.title}</span>
                        </p>

                        <div className="overflow-y-auto flex-1 px-6 py-2">
                            {allUsers.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-6">Нет зарегистрированных сотрудников</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {allUsers.map(u => {
                                        const checked = selectedUsers.includes(u._id?.toString() ?? u._id);
                                        return (
                                            <li
                                                key={u._id}
                                                onClick={() => toggleUserSelect(u._id?.toString() ?? u._id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${checked ? 'bg-primary-50 border-primary-300' : 'border-gray-100 hover:bg-gray-50'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => {}}
                                                    className="accent-primary-600 w-4 h-4 flex-shrink-0"
                                                />
                                                <img src={u.avatar?.secure_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 capitalize truncate">{u.fullName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setAssignModal(null)}
                                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl font-semibold hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={saveAssignment}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl font-semibold"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HomeLayout>
    );
}

export default AdminDeshboard;
