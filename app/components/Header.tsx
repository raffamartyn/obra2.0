"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  {
    nombre: "Obras",
    href: "/obras",
  },
  {
    nombre: "Contratistas",
    href: "/contratistas",
  },
  {
    nombre: "Movimientos",
    href: "/movimientos",
  },
];

function obtenerTitulo(pathname: string) {
  if (pathname.startsWith("/obras")) {
    return "Obras";
  }

  if (pathname.startsWith("/contratistas")) {
    return "Contratistas";
  }

  if (pathname.startsWith("/movimientos")) {
    return "Movimientos";
  }

  return "Control de Obras";
}

export default function Header() {
  const pathname = usePathname();
  const titulo = obtenerTitulo(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Control administrativo
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              {titulo}
            </h2>
          </div>

          <div className="hidden rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600 sm:block">
            Gestión de obras
          </div>
        </div>
      </header>

      <nav className="sticky top-16 z-20 flex border-b border-slate-200 bg-white p-2 lg:hidden">
        {enlaces.map((enlace) => {
          const activo =
            pathname === enlace.href ||
            pathname.startsWith(`${enlace.href}/`);

          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`flex-1 rounded-lg px-2 py-2 text-center text-sm font-medium transition ${
                activo
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {enlace.nombre}
            </Link>
          );
        })}
      </nav>
    </>
  );
}