import perfumeImg from "../assets/asesoria.webp";

export default function Asesoria() {
    const whatsappNumber = "549XXXXXXXXXX"; // <-- poné el número real
    const message = encodeURIComponent(
        "Hola! Me gustaría recibir asesoramiento para elegir una fragancia."
    );

    return (
        <section className="w-full bg-gradient-to-b from-white to-gray-50 py-20 px-6 font-serif">
            <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-12 items-center">

                {/* TEXTO */}
                <div className="flex flex-col gap-6">

                    <span className="text-sm uppercase tracking-widest -mt-10 text-amber-500 font-medium text-center">
                        Asesoramiento
                    </span>

                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight text-center">
                        Encontrá tu próxima fragancia
                    </h2>

                    <p className="text-gray-600 text-lg leading-relaxed text-justify">
                        La perfumería árabe se distingue por su carácter, su elegancia y su esencia refinada.
                    </p>

                    <p className="text-gray-600 text-lg leading-relaxed text-justify">
                        Te asesoramos para encontrar la fragancia ideal según tu estilo, tu personalidad y el momento que quieras destacar.
                    </p>

                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${message}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
inline-block
mx-auto
px-8
py-4
mt-3
rounded-xl
text-lg
font-medium
text-black
bg-[linear-gradient(110deg,#fbbf24,#f59e0b,#fbbf24)]
bg-[length:200%_100%]
bg-left
hover:bg-right
transition-all duration-500
shadow-lg shadow-amber-500/20
"
                    >
                        Solicitar asesoramiento
                    </a>

                </div>
                <div className="
w-full h-[1px] md:w-px md:h-full
bg-gradient-to-r md:bg-gradient-to-b
from-transparent via-amber-400/40 to-transparent
my-1 md:my-0
"></div>
                {/* IMAGEN */}
                <div className="relative">

                    <div className="rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={perfumeImg}
                            alt="Perfume elegante"
                            className="w-full h-[280px] md:h-[400px] object-cover"
                        />
                    </div>

                    {/* efecto decorativo */}
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-40"></div>
                </div>

            </div>
        </section>
    );
}