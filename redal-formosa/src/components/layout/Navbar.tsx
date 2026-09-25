"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/mapa", label: "Ver Mapa", badge: "Nuevo" },
    { href: "/productor/chacra-la-esperanza", label: "Catálogo Productor" },
    { href: "/b2b", label: "Canal B2B & Mayoristas", badge: "Comercios" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E2D5] bg-white/95 backdrop-blur-lg shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#17924E] to-[#0E7A3F] text-white shadow-lg shadow-[#17924E]/30 group-hover:scale-105 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 10a6 6 0 0 0-6-6H3v2a6 6 0 0 0 6 6h3" />
                <path d="M12 14a6 6 0 0 1 6-6h3v2a6 6 0 0 1-6 6h-3" />
                <path d="M12 20V10" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black font-display tracking-tight text-[#0B2545] flex items-center gap-2">
                REDAL
                <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#E1F2E8] text-[#17924E]">
                  Formosa
                </span>
              </span>
              <span className="text-xs text-[#44576B] font-medium hidden sm:block tracking-wide">
                Red de Abastecimiento Local
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2.5 text-[15px] font-bold rounded-xl transition-all duration-200 ${
                  active
                    ? "text-[#17924E] bg-[#E1F2E8]"
                    : "text-[#44576B] hover:text-[#0B2545] hover:bg-[#F3EEE3]"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    link.badge === 'Nuevo' 
                      ? 'bg-[#F0A417]/20 text-[#D98500]' 
                      : 'bg-[#2FA8DE]/20 text-[#007AB0]'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/b2b"
            className="text-sm font-bold text-[#44576B] hover:text-[#17924E] transition-colors"
          >
            ¿Sos comerciante?
          </Link>
          <Link
            href="/productor/chacra-la-esperanza"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B2545] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0B2545]/20 hover:bg-[#123657] hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Ver Catálogo
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2.5 rounded-xl text-[#0B2545] bg-[#F3EEE3] hover:bg-[#E8E2D5] transition-colors focus:outline-none"
            aria-label="Abrir menú"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E2D5] bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-bold text-[#0B2545] hover:bg-[#F3EEE3] transition-colors"
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  link.badge === 'Nuevo' 
                    ? 'bg-[#F0A417]/20 text-[#D98500]' 
                    : 'bg-[#2FA8DE]/20 text-[#007AB0]'
                }`}>
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-[#E8E2D5]">
            <Link
              href="/b2b"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full justify-center rounded-xl bg-[#17924E] px-4 py-3.5 text-[15px] font-bold text-white shadow-md hover:bg-[#0E7A3F] transition-colors"
            >
              Portal Mayorista B2B
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

