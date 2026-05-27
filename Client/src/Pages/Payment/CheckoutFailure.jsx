import { RxCrossCircled } from "react-icons/rx";
import { Link } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";

function CheckoutFailure(){
    return (
        <HomeLayout>
            <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-white to-primary-50">
                <div className="w-80 flex flex-col bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
                    <div className="bg-red-500 py-4 text-center">
                        <h1 className="text-2xl font-bold text-white">Оплата не прошла</h1>
                    </div>

                    <div className="px-6 py-6 flex flex-col items-center gap-4">
                        <RxCrossCircled className="text-red-500 text-6xl" />
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-bold text-gray-900">
                                Упс! Что-то пошло не так
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Пожалуйста, попробуйте снова
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/checkout"
                        className="bg-red-500 hover:bg-red-600 transition-all ease-in-out duration-300 py-3 text-xl font-semibold text-center text-white"
                    >
                        Попробовать снова
                    </Link>
                </div>
            </div>
        </HomeLayout>
    )
}
export default CheckoutFailure;
