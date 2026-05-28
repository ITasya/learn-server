import { useEffect, useRef, useState } from 'react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { FiBell, FiMenu } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import Footer from '../Compontents/Footer.jsx';
import { logout } from '../Redux/Slices/AuthSlice.js';
import { getNotifications, markNotificationsRead } from '../Redux/Slices/NotificationSlice.js';

function HomeLayout({ children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
    const role = useSelector((state) => state?.auth?.role);
    const { notifications, unreadCount } = useSelector((state) => state.notification);

    const [notifOpen, setNotifOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        if (isLoggedIn) dispatch(getNotifications());
    }, [isLoggedIn]);

    // Закрывать dropdown при клике снаружи
    useEffect(() => {
        function handleClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Блокировать скролл когда мобильное меню открыто
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    function handleOpenNotif() {
        setNotifOpen(p => !p);
        if (unreadCount > 0) dispatch(markNotificationsRead());
    }

    async function handleLogout(e) {
        e.preventDefault();
        const res = await dispatch(logout());
        if (res?.payload?.sucess) navigate('/');
        setDrawerOpen(false);
    }

    const navLinks = [
        { to: '/', label: 'Главная' },
        { to: '/courses', label: 'Каталог курсов' },
        { to: '/contact', label: 'Связаться с нами' },
        { to: '/about', label: 'О платформе' },
        ...(isLoggedIn && role === 'ADMIN'
            ? [
                { to: '/admin/deshboard', label: 'Панель администратора' },
                { to: '/course/create', label: 'Создать курс' },
            ]
            : []),
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* ===== STICKY HEADER ===== */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-4 h-14">

                    {/* Left: burger */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="text-primary-700 p-1 rounded-md hover:bg-primary-50 transition-colors"
                        aria-label="Открыть меню"
                    >
                        <FiMenu size={26} />
                    </button>

                    {/* Center: logo (optional) */}
                    <Link to="/" className="font-bold text-primary-700 text-lg tracking-tight select-none">
                        LearnHub
                    </Link>

                    {/* Right: actions */}
                    <div className="flex items-center gap-1.5">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login">
                                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 font-semibold rounded-lg text-sm transition-all shadow-sm">
                                        Войти
                                    </button>
                                </Link>
                                <Link to="/signup" className="hidden sm:block">
                                    <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-3 py-1.5 font-semibold rounded-lg text-sm transition-all">
                                        Регистрация
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Notification bell */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={handleOpenNotif}
                                        className="relative p-2 text-primary-700 hover:bg-primary-50 rounded-full transition-colors"
                                        aria-label="Уведомления"
                                    >
                                        <FiBell size={22} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown:
                                        mobile  — fixed, по центру экрана под шапкой
                                        desktop — absolute, прижат вправо к кнопке        */}
                                    {notifOpen && (
                                        <div className="
                                            fixed left-1/2 -translate-x-1/2 top-16
                                            sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-[calc(100%+6px)]
                                            w-[calc(100vw-2rem)] max-w-sm
                                            bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden
                                        ">
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                                <span className="font-bold text-gray-800">Уведомления</span>
                                                <button
                                                    onClick={() => setNotifOpen(false)}
                                                    className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                                                >×</button>
                                            </div>
                                            <ul className="max-h-72 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <li className="px-4 py-6 text-sm text-gray-400 text-center">
                                                        Нет уведомлений
                                                    </li>
                                                ) : notifications.map((n, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => { setNotifOpen(false); if (n.courseId) navigate('/courses'); }}
                                                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-primary-50 transition-colors ${!n.read ? 'bg-primary-50/60' : ''}`}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary-600' : 'bg-gray-300'}`} />
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-gray-800">{n.message}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {new Date(n.createdAt).toLocaleDateString('ru-RU')}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <Link to="/user/profile">
                                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 font-semibold rounded-lg text-sm transition-all shadow-sm">
                                        Профиль
                                    </button>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="hidden sm:block border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-3 py-1.5 font-semibold rounded-lg text-sm transition-all"
                                >
                                    Выйти
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ===== MOBILE DRAWER OVERLAY ===== */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[60]"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* ===== MOBILE DRAWER PANEL ===== */}
            <aside className={`
                fixed top-0 left-0 h-full w-72 bg-white z-[70] shadow-2xl
                transform transition-transform duration-300 ease-in-out flex flex-col
                ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-primary-100">
                    <span className="text-lg font-bold text-primary-700">LearnHub</span>
                    <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-primary-600">
                        <AiFillCloseCircle size={24} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    <ul className="flex flex-col gap-1">
                        {navLinks.map(link => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    onClick={() => setDrawerOpen(false)}
                                    className="block px-4 py-2.5 rounded-xl text-gray-800 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Auth buttons in drawer */}
                <div className="px-4 py-5 border-t border-primary-100 flex flex-col gap-2">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/login" onClick={() => setDrawerOpen(false)}>
                                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-3 py-2.5 font-semibold rounded-xl transition-all">
                                    Войти
                                </button>
                            </Link>
                            <Link to="/signup" onClick={() => setDrawerOpen(false)}>
                                <button className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-3 py-2.5 font-semibold rounded-xl transition-all">
                                    Регистрация
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/user/profile" onClick={() => setDrawerOpen(false)}>
                                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-3 py-2.5 font-semibold rounded-xl transition-all">
                                    Профиль
                                </button>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-3 py-2.5 font-semibold rounded-xl transition-all"
                            >
                                Выйти
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* ===== PAGE CONTENT ===== */}
            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
}

export default HomeLayout;
