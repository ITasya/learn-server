import { useEffect } from "react";
import { MdCheckCircle } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getMyProgress } from "../../Redux/Slices/ProgressSlice";

function Profile() {
    const userData = useSelector((state) => state?.auth?.data);
    const { progress, loading: progressLoading } = useSelector((state) => state.progress);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getMyProgress());
    }, []);

    return (
        <HomeLayout>
            <div className="min-h-[90vh] bg-gradient-to-br from-white to-primary-50 py-10 px-4">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">

                    {/* --- Profile card --- */}
                    <div className="flex flex-col gap-5 rounded-2xl p-8 bg-white text-gray-900 shadow-lg border border-primary-100 sm:flex-row sm:items-start">
                        <div className="flex flex-col items-center gap-3 sm:w-48 flex-shrink-0">
                            <img
                                className="w-32 h-32 rounded-full border-4 border-primary-200 object-cover shadow-md"
                                src={userData?.avatar?.secure_url}
                                alt="аватар"
                            />
                            <h3 className="text-xl font-bold text-center text-gray-900 capitalize">
                                {userData?.fullName}
                            </h3>
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <div className="grid grid-cols-[auto_1fr] gap-y-2 text-sm bg-primary-50 rounded-xl p-4">
                                <p className="font-semibold text-gray-600 pr-3 whitespace-nowrap">Email:</p>
                                <p className="text-gray-900 break-all">{userData?.email}</p>
                                <p className="font-semibold text-gray-600 pr-3 whitespace-nowrap">Роль:</p>
                                <p className="text-gray-900">
                                    {userData?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Link
                                    to='/change-password'
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center transition-all ease-in-out duration-300 rounded-lg font-semibold py-2.5 cursor-pointer shadow-sm text-sm"
                                >
                                    Сменить пароль
                                </Link>
                                <Link
                                    to='/user/editprofile'
                                    className="flex-1 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 text-center transition-all ease-in-out duration-300 rounded-lg font-semibold py-2.5 cursor-pointer text-sm"
                                >
                                    Редактировать профиль
                                </Link>
                            </div>

                        </div>
                    </div>

                    {/* --- Learning progress --- */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Моё обучение</h2>

                        {progressLoading ? (
                            <p className="text-gray-400 text-sm text-center py-6">Загрузка...</p>
                        ) : progress.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <p className="text-gray-400 text-sm">Вы ещё не начали ни одного курса</p>
                                <Link
                                    to="/courses"
                                    className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    Перейти к курсам
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {progress.map((item) => {
                                    const total = item.course?.numberOfLectures ?? 0;
                                    const done = item.completedLectures ?? 0;
                                    const pct = item.progressPercent ?? 0;
                                    const lastAttempts = item.recentAttempts ?? [];

                                    return (
                                        <div key={item.course?._id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                                            <div className="flex items-start gap-4">
                                                {item.course?.thumbnail?.secure_url && (
                                                    <img
                                                        src={item.course.thumbnail.secure_url}
                                                        alt="курс"
                                                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {item.course?.title}
                                                    </p>

                                                    {/* Progress bar */}
                                                    <div className="mt-2 mb-1">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>Лекций завершено: {done} / {total}</span>
                                                            <span className="font-semibold text-primary-700">{pct}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {pct >= 100 && (
                                                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mt-1">
                                                            <MdCheckCircle /> Курс пройден!
                                                        </div>
                                                    )}

                                                    {/* Last quiz attempts */}
                                                    {lastAttempts.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-xs text-gray-500 font-semibold mb-1">Последние тесты:</p>
                                                            <div className="flex flex-col gap-1">
                                                                {lastAttempts.map((a, i) => (
                                                                    <div key={i} className="flex items-center gap-2 text-xs">
                                                                        <span className={`font-bold ${a.passed ? 'text-green-600' : 'text-red-500'}`}>
                                                                            {a.passed ? '✓' : '✗'}
                                                                        </span>
                                                                        <span className="text-gray-600">
                                                                            {new Date(a.createdAt).toLocaleDateString('ru-RU')} —{' '}
                                                                            <span className="font-semibold">{a.score}%</span>
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

export default Profile;
