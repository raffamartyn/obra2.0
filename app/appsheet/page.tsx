export default function AppSheetPage() {
  const urlAppSheet =
    "https://www.appsheet.com/start/71d86f50-241e-44f4-8abb-d368995d9f27";

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <iframe
          src={urlAppSheet}
          title="AppSheet"
          className="h-[calc(100vh-120px)] w-full border-0"
        />
      </div>
    </section>
  );
}