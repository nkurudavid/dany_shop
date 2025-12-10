import { useLanguage } from "../context/LanguageContext";

const productsData = [
    { id: 1, name: "Ti House", price: 29.99, image: "https://tie-house.com/wp-content/uploads/2025/01/2-48.jpg" },
    { id: 2, name: "Jeans", price: 9.99, image: "https://cdn.britannica.com/74/190774-050-52CE5745/jeans-denim-pants-clothing.jpg" },
    { id: 3, name: "Initio Parfums", price: 29.99, image: "https://hrd-live.cdn.scayle.cloud/images/c05945a9fd3490cb98e85e74efcc84ee.jpg?brightness=1&width=922&height=1230&quality=75&bg=ffffff" },
    { id: 4, name: "Speaker", price: 69.99, image: "https://wirata.com.my/wp20201001/wp-content/uploads/2020/11/SP50S-05.png" },
];

export default function FeaturedProducts() {
    const { t } = useLanguage();

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <h3 className="text-3xl font-bold mb-8 text-center">{t.featured}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {productsData.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 hover:shadow-xl transition"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="rounded-lg mb-4 w-full h-40 object-cover"
                            />
                            <h4 className="font-semibold text-lg">{product.name}</h4>
                            <p className="text-primary font-bold">${product.price}</p>
                            <button className="mt-2 w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition">
                                {t.buyNow}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
