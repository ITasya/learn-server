import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";

function CourseDescripition() {

    const {state} = useLocation();
    const navigate = useNavigate();
    const {role} = useSelector((state) => state.auth);

    return(
        <HomeLayout>
            <div className="min-h-[90vh] bg-gradient-to-br from-white to-primary-50 pt-12 md:px-20 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center bg-white border border-primary-100 rounded-2xl shadow-lg md:w-[52rem] w-[95vw] overflow-hidden">
                    <div className="w-full bg-primary-600 py-5 px-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
                            {state?.title}
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 px-6 w-full">
                        <div className="space-y-4">
                            <img
                                className="w-full h-56 object-cover rounded-xl border border-primary-100"
                                alt="обложка курса"
                                src={state?.thumbnail?.secure_url}
                            />
                            <div className="bg-primary-50 rounded-xl p-4 space-y-2">
                                <p className="font-semibold text-gray-700">
                                    <span className="text-primary-600">Лекций: </span>
                                    {state?.numberOfLectures}
                                </p>
                                <p className="font-semibold text-gray-700">
                                    <span className="text-primary-600">Преподаватель: </span>
                                    {state?.createdBy}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-primary-600 font-semibold text-lg">Описание курса</p>
                            <p className="text-gray-600 leading-relaxed lg:h-52 overflow-y-auto">{state?.description}</p>
                            <button
                                onClick={() => navigate("/course/displaylecture", {state: {...state}})}
                                className="bg-primary-600 hover:bg-primary-700 text-white text-lg rounded-xl font-bold px-5 py-3 w-full transition-all ease-in-out duration-300 shadow-md"
                            >
                                Смотреть лекции
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    )
}
export default CourseDescripition;
