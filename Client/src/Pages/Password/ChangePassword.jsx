import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { isPassword } from "../../Helpers/regexMatcher";
import HomeLayout from "../../Layouts/HomeLayout";
import { changePassword } from "../../Redux/Slices/AuthSlice";

function ChangePassword(){

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userPassword, setUserPassword] = useState({
        oldPassword: "",
        newPassword: "",
    });

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setUserPassword({ ...userPassword, [name]: value });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (!userPassword.oldPassword || !userPassword.newPassword) {
            toast.error("Все поля обязательны для заполнения");
            return;
        }
        if(!isPassword(userPassword.newPassword)){
            toast.error("Пароль должен содержать 6–16 символов, включая цифру и спецсимвол");
            return;
        }
        const response = await dispatch(changePassword(userPassword));
        if(response?.payload?.success){
            navigate("/user/profile");
            setUserPassword({ oldPassword: "", newPassword: "" });
        }
    }

    return(
        <HomeLayout>
            <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-white to-primary-50">
                <form
                    onSubmit={handleFormSubmit}
                    className="flex flex-col justify-center gap-5 rounded-2xl p-8 bg-white text-gray-900 w-[90vw] sm:w-96 shadow-lg border border-primary-100"
                >
                    <h1 className="text-center text-2xl font-bold text-gray-900">Смена пароля</h1>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="oldPassword">
                            Текущий пароль
                        </label>
                        <input
                            required
                            type="password"
                            name="oldPassword"
                            id="oldPassword"
                            placeholder="Введите текущий пароль"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            value={userPassword.oldPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="newPassword">
                            Новый пароль
                        </label>
                        <input
                            required
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            placeholder="Введите новый пароль"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            value={userPassword.newPassword}
                            onChange={handlePasswordChange}
                        />
                    </div>

                    <Link to={"/user/profile"}>
                        <p className="text-primary-600 hover:text-primary-700 cursor-pointer flex items-center gap-2 text-sm">
                            <AiOutlineArrowLeft /> Вернуться в профиль
                        </p>
                    </Link>

                    <button
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white transition-all ease-in-out duration-300 rounded-lg py-2.5 font-semibold text-lg cursor-pointer shadow-md"
                        type="submit"
                    >
                        Изменить пароль
                    </button>
                </form>
            </div>
        </HomeLayout>
    )
}
export default ChangePassword;
