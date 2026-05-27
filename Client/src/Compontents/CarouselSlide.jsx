function CarouselSlide({image, title, description, slideNumber, totalSlides}) {
    return (
        <div id={`slide${slideNumber}`} className="carousel-item relative w-full">
            <div className="flex flex-col items-center justify-center gap-4 px-[15%]">
                <img src={image} className="w-40 rounded-full border-2 border-primary-300" />
                <p className="text-lg text-gray-600 text-center">
                    {description}
                </p>
                <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
                <div className="absolute flex justify-between transform -translate-y-1/2 sm:left-5 sm:right-5 right-0 left-0 top-1/2">
                    <a href={`#slide${(slideNumber == 1 ? totalSlides : (slideNumber - 1))}`} className="btn btn-circle bg-white border-primary-300 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600">❮</a>
                    <a href={`#slide${(slideNumber) % totalSlides + 1}`} className="btn btn-circle bg-white border-primary-300 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600">❯</a>
                </div>
            </div>
        </div>
    );
}

export default CarouselSlide;
