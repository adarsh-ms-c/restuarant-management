import UserShell from "@/components/UserShell";
import MenuSection from "@/components/MenuSection";

const galleryImages = [
  "/home-1.jpg",
  "/home-2.jpg",
  "/home-3.jpg",
  "/home-4.jpg",
  "/home-5.jpg",
  "/home-6.jpg",
];

export default function HomePage() {
  return (
    <UserShell>
      <main className="mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-10 sm:px-6">
        <section className="card overflow-hidden">
          <div className="hero-panel px-6 py-10 text-white sm:px-10">
            <p className="text-sm font-medium text-cream">Welcome to</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Slo Labs</h1>
            <p className="mt-3 max-w-xl text-sm text-cream">
              Pick your favourites, choose a quantity, and place an order. Track it any time from the Track Order page.
            </p>
            <a href="#menu" className="btn-primary mt-6">Browse the menu</a>
          </div>
        </section>

        <MenuSection />

        <section id="gallery">
          <div>
            <h2 className="text-xl font-semibold text-charcoal">A taste of Slo Labs</h2>
            <p className="mt-1 text-sm text-muted">A closer look at our coffee, café and bakery moments.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {galleryImages.map((src, index) => (
              <div key={src} className="card overflow-hidden">
                <img
                  src={src}
                  alt={`Slo Labs café moment ${index + 1}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </UserShell>
  );
}
