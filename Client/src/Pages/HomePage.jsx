import { Link } from "react-router-dom";

import homeimg from '../Assets/Images/homePageMainImage.jpeg'
import HomeLayout from "../Layouts/HomeLayout";

function HomePage(){
    return(
        <HomeLayout>
            {/* Hero */}
            <div className="pt-10 bg-white flex flex-col md:flex-row items-center justify-center mx-5 gap-10 lg:mx-16 h-[50rem] sm:h-[90vh]">
                <div className="mt-16 sm:mt-0 flex flex-col justify-center md:w-1/2 space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                        Обучайте{" "}
                        <span className="text-primary-600">команду</span>{" "}
                        эффективно
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600">
                        Корпоративная платформа для обучения и развития сотрудников. Назначайте курсы, отслеживайте прогресс и повышайте компетенции всей команды в одном месте.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/courses">
                            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 shadow-md">
                                Каталог курсов
                            </button>
                        </Link>
                        <Link to="/contact">
                            <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300">
                                Связаться с нами
                            </button>
                        </Link>
                    </div>
                </div>
                <div className="lg:w-1/2 flex items-center justify-center">
                    <img src={homeimg} alt="главная страница" className="drop-shadow-xl" />
                </div>
            </div>

            {/* Features */}
            <div className="bg-primary-50 py-16 px-5 lg:px-20">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Почему выбирают нас</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {[
                        {
                            icon: "🎯",
                            title: "Назначение курсов",
                            text: "Администратор назначает нужные курсы конкретным сотрудникам или открывает их для всей команды.",
                        },
                        {
                            icon: "📊",
                            title: "Аналитика прогресса",
                            text: "Отслеживайте, кто и насколько прошёл курс, какие тесты сдал и где нужна дополнительная поддержка.",
                        },
                        {
                            icon: "📝",
                            title: "Тесты и материалы",
                            text: "К каждой лекции можно добавить документы, ссылки, видео и тест для проверки знаний.",
                        },
                        {
                            icon: "🔔",
                            title: "Уведомления",
                            text: "Сотрудники получают мгновенные уведомления при назначении нового курса.",
                        },
                        {
                            icon: "🏢",
                            title: "Корпоративный доступ",
                            text: "Гибкое разграничение: часть курсов для всех, часть — только для определённых сотрудников.",
                        },
                        {
                            icon: "🚀",
                            title: "Простое управление",
                            text: "Удобная панель администратора для создания курсов, управления персоналом и контента.",
                        },
                    ].map((f) => (
                        <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-primary-100 flex flex-col gap-3">
                            <span className="text-3xl">{f.icon}</span>
                            <h3 className="font-bold text-gray-900 text-lg">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </HomeLayout>
    )
}
export default HomePage;
