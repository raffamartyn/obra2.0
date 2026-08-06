"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  {
    nombre: "Obras",
    href: "/obras",
    icono: "🏗️",
  },
  {
    nombre: "Contratistas",
    href: "/contratistas",
    icono: "👷",
  },
  {
    nombre: "Movimientos",
    href: "/movimientos",
    icono: "💰",
  },
  {
  nombre: "Cargar datos",
  href: "/appsheet",
  icono:  "📝",
},
 {
  nombre: "Presupuestos",
  href: "/presupuestos",
  icono:  "📋",
}
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Sistema
        </p>

        <h1 className="mt-2 text-xl font-bold">
          Control de Obras
        </h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {enlaces.map((enlace) => {
          const activo =
            pathname === enlace.href ||
            pathname.startsWith(`${enlace.href}/`);

          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                activo
                  ? "bg-white text-slate-950 shadow"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <span className="text-lg">{enlace.icono}</span>
              <span>{enlace.nombre}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm font-semibold">
            Administración
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Obras, contratos, cobros y pagos.
          </p>
        </div>
      </div>
    </aside>
  );
}