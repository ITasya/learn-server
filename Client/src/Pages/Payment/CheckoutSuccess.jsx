import { useEffect } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import HomeLayout from "../../Layouts/HomeLayout";
import { getuserData } from "../../Redux/Slices/AuthSlice";

function CheckoutSuccess(){
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getuserData());
    })
    return(
        <HomeLayout>
            <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-white to-primary-50">
                <div className="w-80 flex flex-col bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
                    <div className="bg-green-500 py-4 text-center">
                        <h1 className="text-2xl font-bold text-white">Оплата прошла успешно!</h1>
                    </div>

                    <div className="px-6 py-6 flex flex-col items-center gap-4">
                        <AiFillCheckCircle className="text-green-500 text-6xl" />
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-bold text-gray-900">
                                Добро пожаловать в подписку!
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Теперь вам доступны все курсы платформы.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/"
                        className="bg-green-500 hover:bg-green-600 transition-all ease-in-out duration-300 py-3 text-xl font-semibold text-center text-white"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </HomeLayout>
    )
}
export default CheckoutSuccess;
