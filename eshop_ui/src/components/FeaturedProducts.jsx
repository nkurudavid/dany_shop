import { useLanguage } from "../context/LanguageContext";

const productsData = [
    { id: 1, name: "Product 1", price: 29.99, image: "https://via.placeholder.com/150" },
    { id: 2, name: "Product 2", price: 49.99, image: "https://via.placeholder.com/150" },
    { id: 3, name: "Product 3", price: 19.99, image: "https://via.placeholder.com/150" },
    { id: 4, name: "Product 4", price: 39.99, image: "https://via.placeholder.com/150" },
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
