import { useState } from "react";
import { toast } from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import HomeLayout from "../Layouts/HomeLayout";
import { login } from "../Redux/Slices/AuthSlice";

function Login(){

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loginData, setloginData] = useState({
        email: "",
        password: "",
    });

    function handleUserInput(e){
        const {name, value} = e.target;
        setloginData({ ...loginData, [name]: value })
    }

    async function onLogin(event){
        event.preventDefault();
        if (!loginData.email || !loginData.password) {
            toast.error("Пожалуйста, заполните все поля");
            return;
        }
        const response = await dispatch(login(loginData));
        if(response?.payload?.success){
            navigate("/");
            setloginData({ email: "", password: "" })
        }
    }

    return(
        <HomeLayout>
            <div className="flex items-center justify-center min-h-[90vh] bg-gradient-to-br from-white to-primary-50">
                <form
                    noValidate
                    onSubmit={onLogin}
                    className="flex flex-col justify-center gap-5 rounded-2xl bg-white text-gray-900 p-8 w-[90vw] sm:w-96 shadow-lg border border-primary-100"
                >
                    <h1 className="text-center text-3xl font-bold text-gray-900">Вход в систему</h1>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            name="email"
                            id="email"
                            placeholder="Введите ваш email"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            onChange={handleUserInput}
                            value={loginData.email}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700">Пароль</label>
                        <input
                            type="password"
                            required
                            name="password"
                            id="password"
                            placeholder="Введите ваш пароль"
                            className="border border-gray-300 focus:border-primary-500 focus:outline-none px-3 py-2 rounded-lg bg-white text-gray-900 transition-colors"
                            onChange={handleUserInput}
                            value={loginData.password}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 font-semibold text-lg cursor-pointer transition-all ease-in-out duration-300 rounded-lg shadow-md"
                    >
                        Войти
                    </button>

                    <Link to={"/forget-password"}>
                        <p className="text-center text-primary-600 hover:text-primary-700 cursor-pointer text-sm">
                            Забыли пароль?
                        </p>
                    </Link>

                    <p className="text-center text-gray-600 text-sm">
                        Нет аккаунта?{" "}
                        <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer">
                            Зарегистрироваться
                        </Link>
                    </p>
                </form>
            </div>
        </HomeLayout>
    )
}
export default Login;
