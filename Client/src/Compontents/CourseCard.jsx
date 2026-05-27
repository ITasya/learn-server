import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function CourseCard({ data }) {
    const navigate = useNavigate();
    const { data: userData } = useSelector((state) => state.auth);
    const userId = userData?._id;

    const isAssigned = userId && data?.assignedTo?.some(
        id => id === userId || id?.toString() === userId
    );

    return (
        <div
            onClick={() => navigate("/course/description/", { state: { ...data } })}
            className="w-[20rem] bg-white border border-primary-200 rounded-xl shadow-md cursor-pointer group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all ease-in-out duration-300 relative"
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2 z-10">
                {data?.isPublic && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        Для всех
                    </span>
                )}
                {isAssigned && (
                    <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        Назначено
                    </span>
                )}
            </div>

            <div className="overflow-hidden">
                <img
                    className="h-48 w-full rounded-tl-xl rounded-tr-xl object-cover group-hover:scale-105 transition-all ease-in-out duration-300"
                    src={data?.thumbnail?.secure_url}
                    alt="обложка курса"
                />
                <div className="p-5 space-y-2">
                    <h2 className="text-xl font-bold text-primary-700 line-clamp-2">{data?.title}</h2>
                    <p className="text-gray-600 line-clamp-2 text-sm">{data?.description}</p>
                    <p className="text-sm font-semibold text-gray-800">
                        <span className="text-primary-600 font-bold">Категория: </span>
                        {data?.category}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                        <span className="text-primary-600 font-bold">Преподаватель: </span>
                        {data?.createdBy}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default CourseCard;
