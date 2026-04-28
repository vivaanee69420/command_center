import Topbar from "@/components/layout/topbar";

export default function PlaceholderPage({ title = "Coming Soon" }) {
  return (
    <>
      <Topbar title={title} />
      <main className="p-6 max-w-[1500px] mx-auto w-full">
        <div className="bg-white border border-line rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="text-lg font-bold text-ink mb-1">{title}</h2>
          <p className="text-sm text-muted">This page is under construction. Check back soon.</p>
        </div>
      </main>
    </>
  );
}
