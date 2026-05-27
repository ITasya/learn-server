import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { isPassword } from "../../Helpers/regexMatcher";
import HomeLayout from "../../Layouts/HomeLayout";
import { resetPassword } from "../../Redux/Slices/AuthSlice";

function ResetPassword(){

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [data, setData] = useState({
        password: "",
        cnfPassword: "",
        resetToken: useParams().resetToken,
    });

    const handleUserInput = (event) => {
        const { name, value } = event.target;
        setData({ ...data, [name]: value });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if(!isPassword(data.password)){
            toast.error("Пароль должен содержать 6–16 символов, включая цифру и спецсимвол");
            return;
        }
        if (!data.password || !data.cnfPassword || !data.resetToken) {
            toast.error("Все поля обязательны для заполнения");
            return;
        }
        if (data.password !== data.cnfPassword) {
            toast.error("Пароли не совпадают");
            return;
        }
        const response = await dispatch(resetPassword(data));
        if(response?.payload?.success){
            navigate("/login");
            setData({ password: "", cnfPassword: "" });
        }
    }

    return (
        <HomeLayout>
            <div
                onSubmit={handleFormSubmit}
                className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-white to-primary-50"
            >
                <form className="flex flex-col justify-center gap-5 rounded-2xl p-8 bg-white text-gray-900 w-[90vw] sm:w-96 shadow-lg border border-primary-100">
                    <h1 className="text-center text-2xl font-bold text-gray-900">Сброс пароля</h1>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                            Новый пароль
                        </label>
                        <input
                            required
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Введите новый пароль"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            value={data.password}
                            onChange={handleUserInput}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="cnfPassword">
                            Подтвердите новый пароль
                        </label>
                        <input
                            required
                            type="password"
                            name="cnfPassword"
                            id="cnfPassword"
                            placeholder="Подтвердите новый пароль"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            value={data.cnfPassword}
                            onChange={handleUserInput}
                        />
                    </div>

                    <button
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white transition-all ease-in-out duration-300 rounded-lg py-2.5 font-semibold text-lg cursor-pointer shadow-md"
                        type="submit"
                    >
                        Сохранить новый пароль
                    </button>
                </form>
            </div>
        </HomeLayout>
    )
}
export default ResetPassword;
