const categoriesData = [
    { id: 1, name: "Electronics", image: "https://via.placeholder.com/300x150" },
    { id: 2, name: "Fashion", image: "https://via.placeholder.com/300x150" },
    { id: 3, name: "Home & Garden", image: "https://via.placeholder.com/300x150" },
    { id: 4, name: "Beauty", image: "https://via.placeholder.com/300x150" },
];

export default function Categories() {
    return (
        <section className="py-16">
            <div className="container mx-auto px-6">
                <h3 className="text-3xl font-bold mb-8 text-center">Shop by Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {categoriesData.map((category) => (
                        <div key={category.id} className="relative rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                            <img src={category.image} alt={category.name} className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <h4 className="text-white text-xl font-semibold">{category.name}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
