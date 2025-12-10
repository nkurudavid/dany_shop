const categoriesData = [
    { id: 1, name: "Electronics", image: "https://afzalcorp.com.pk/wp-content/uploads/2025/04/Best-Electronics-Stores-in-Pakistan.jpg" },
    { id: 2, name: "Fashion", image: "https://www.downtownalexandria.com/wp-content/uploads/2019/04/storedashery-12-1024x684.jpg" },
    { id: 3, name: "Beauty", image: "https://cloudfront-eu-central-1.images.arcpublishing.com/businessoffashion/2UDNDDYDAZB57EYGS55VRAW7AQ.jpg" },
    { id: 4, name: "Perfumes", image: "https://d1ef7ke0x2i9g8.cloudfront.net/singapore/_1200x630_crop_center-center_82_none/Scents-for-Women-That-Are-Worth-Splurging-on-From-Luxury-Brands.jpg?mtime=1731467862" },
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
