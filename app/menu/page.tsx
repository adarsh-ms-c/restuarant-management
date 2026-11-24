import UserShell from "@/components/UserShell";
import MenuSection from "@/components/MenuSection";

export default function MenuPage() {
  return (
    <UserShell>
      <main className="mx-auto max-w-6xl space-y-12 px-4 pb-16 pt-10 sm:px-6">
        <section className="card overflow-hidden">
          <div className="hero-panel px-6 py-10 text-white sm:px-10">
            <p className="text-sm font-medium text-cream">Slo Labs</p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Our menu</h1>
            <p className="mt-3 max-w-xl text-sm text-cream">
              Pick your favourites, choose a quantity, and place an order. Track it any time from the Track Order page.
            </p>
          </div>
        </section>
        <MenuSection />
      </main>
    </UserShell>
  );
}
