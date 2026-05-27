import { useNavigate } from "react-router-dom";

function Denied(){
    const navigate = useNavigate();
    return(
        <main className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-white to-primary-50">
            <h1 className="text-9xl font-extrabold text-primary-700 tracking-widest">
                403
            </h1>
            <div className="bg-primary-600 text-white px-3 py-1 text-sm rounded-md rotate-12 absolute font-semibold">
                Доступ запрещён
            </div>
            <button
                onClick={() => navigate(-1)}
                className="mt-14 px-8 py-3 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold rounded-lg transition-all duration-300"
            >
                Назад
            </button>
        </main>
    );
}
export default Denied;
