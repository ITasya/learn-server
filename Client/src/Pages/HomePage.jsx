import { Link } from "react-router-dom";

import homeimg from '../Assets/Images/homePageMainImage.jpeg'
import HomeLayout from "../Layouts/HomeLayout";

function HomePage(){
    return(
        <HomeLayout>
            <div className="pt-10 bg-white flex flex-col md:flex-row items-center justify-center mx-5 gap-10 lg:mx-16 h-[50rem] sm:h-[90vh]">
                <div className="mt-16 sm:mt-0 flex flex-col justify-center md:w-1/2 space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                        Найдите лучшие{" "}
                        <span className="text-primary-600">
                            онлайн-курсы
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600">
                        У нас большая библиотека курсов, которые ведут высококвалифицированные преподаватели по доступным ценам.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/courses">
                            <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 shadow-md">
                                Смотреть курсы
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
        </HomeLayout>
    )
}
export default HomePage;
