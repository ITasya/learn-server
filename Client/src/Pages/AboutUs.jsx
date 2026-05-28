import aboutMainImage from "../Assets/Images/aboutMainImage.jpeg";
import CarouselSlide from "../Compontents/CarouselSlide";
import { celebrities } from "../Constants/CelebrityData";
import HomeLayout from "../Layouts/HomeLayout";

function AboutUs(){
    return (
        <HomeLayout>
            <div className="lg:pl-20 pt-20 flex flex-col bg-white min-h-[90vh]">
                <div className="flex flex-col lg:flex-row items-center gap-5 mx-10">
                    <section className="lg:w-1/2 space-y-8">
                        <h1 className="text-4xl sm:text-5xl text-primary-700 font-bold leading-tight">
                            Корпоративное обучение нового уровня
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            LearnHub — платформа для систематического обучения сотрудников внутри компании. Мы помогаем руководителям и HR-командам создавать курсы, назначать их персоналу и отслеживать результаты — всё в одном месте.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Наша миссия: сделать развитие команды простым, измеримым и эффективным. Каждый сотрудник видит свои назначенные курсы, проходит тесты и отслеживает собственный прогресс в личном кабинете.
                        </p>
                    </section>
                    <div className="lg:w-1/2">
                        <img
                            id="test1"
                            alt="о нас"
                            className="w-full max-w-md mx-auto rounded-2xl object-cover"
                            src={aboutMainImage}
                        />
                    </div>
                </div>

                <div className="w-[80vw] carousel lg:w-1/2 m-auto my-16 bg-primary-50 rounded-2xl p-6">
                    {celebrities && celebrities.map(celebrity => (
                        <CarouselSlide
                            {...celebrity}
                            key={celebrity.slideNumber}
                            totalSlides={celebrities.length}
                        />
                    ))}
                </div>

                {/* How it works */}
                <div className="px-10 lg:px-20 pb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Как это работает</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {[
                            { step: "1", title: "Создайте курс", text: "Администратор создаёт курс, добавляет лекции, материалы и тесты." },
                            { step: "2", title: "Назначьте сотрудникам", text: "Выберите, кому из сотрудников открыть курс или сделайте его доступным для всех." },
                            { step: "3", title: "Сотрудники обучаются", text: "Каждый видит свои курсы в личном кабинете, проходит материал и сдаёт тесты." },
                            { step: "4", title: "Отслеживайте результаты", text: "Панель администратора показывает прогресс, результаты тестов и активность команды." },
                        ].map(item => (
                            <div key={item.step} className="flex flex-col items-center text-center gap-3 bg-primary-50 rounded-2xl p-6 border border-primary-100">
                                <div className="w-12 h-12 rounded-full bg-primary-600 text-white text-xl font-bold flex items-center justify-center">
                                    {item.step}
                                </div>
                                <h3 className="font-bold text-gray-900">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </HomeLayout>
    )
}
export default AboutUs;
