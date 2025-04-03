export default function InstagramEmbed() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-8">
            Follow Us on Instagram
          </h2>
          <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
            {/* Instagram embed code will go here */}
            <p className="text-gray-500">Instagram Feed Loading...</p>
          </div>
        </div>
      </div>
    </section>
  );
}
