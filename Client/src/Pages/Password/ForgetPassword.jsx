import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { isEmail } from "../../Helpers/regexMatcher";
import HomeLayout from "../../Layouts/HomeLayout";
import { forgetPassword } from "../../Redux/Slices/AuthSlice";

function ForgetPassword(){
    const dispatch = useDispatch();

    const [data, setData] = useState({ email: "" });

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (!data.email) {
            toast.error("Все поля обязательны для заполнения");
            return;
        }
        if (!isEmail(data.email)) {
            toast.error("Некорректный адрес электронной почты");
            return;
        }
        const response = await dispatch(forgetPassword(data));
        if(response?.payload?.success){
            setData({ email: "" });
        }
    };

    return (
        <HomeLayout>
            <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-white to-primary-50">
                <form
                    onSubmit={handleFormSubmit}
                    className="flex flex-col justify-center gap-5 rounded-2xl p-8 bg-white text-gray-900 w-[90vw] sm:w-96 shadow-lg border border-primary-100"
                >
                    <h1 className="text-center text-2xl font-bold text-gray-900">Забыли пароль?</h1>

                    <p className="text-gray-500 text-sm text-center">
                        Введите ваш зарегистрированный email — мы отправим ссылку для сброса пароля
                    </p>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                        <input
                            required
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Введите ваш email"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            value={data.email}
                            onChange={(event) => setData({ email: event.target.value })}
                        />
                    </div>

                    <button
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white transition-all ease-in-out duration-300 rounded-lg py-2.5 font-semibold text-lg cursor-pointer shadow-md"
                        type="submit"
                    >
                        Получить ссылку для сброса
                    </button>

                    <p className="text-center text-gray-600 text-sm">
                        Вспомнили пароль?{" "}
                        <Link to={"/login"} className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer">
                            Войти
                        </Link>
                    </p>
                </form>
            </div>
        </HomeLayout>
    )
}
export default ForgetPassword;
