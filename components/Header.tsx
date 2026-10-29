"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { company, mainNav } from "@/src/data";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const link = "text-[16px] font-medium text-white/80 hover:text-[#c41616]";
const trigger =
  "h-auto rounded-none bg-transparent px-0 text-[16px] font-medium text-white/80 shadow-none hover:bg-transparent hover:text-[#c41616] focus:bg-transparent focus-visible:ring-0 focus-visible:outline-none aria-expanded:text-[#c41616] data-open:bg-transparent data-open:hover:bg-transparent data-open:focus:bg-transparent data-popup-open:bg-transparent data-popup-open:hover:bg-transparent data-popup-open:focus:bg-transparent";

function FacebookIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--header-h)] bg-black text-white shadow-[inset_0_-3px_0_#a01010]">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="justify-self-start"
          aria-label="New Concept Security home"
        >
          <img
            src="/images/logo-light.png"
            alt="New Concept Security"
            className="h-10 w-auto lg:h-[68px]"
          />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          <Link href="/" className={link}>
            Home
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={trigger}>
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent className="max-h-[70vh] w-72 overflow-y-auto bg-[#1d1d1f] p-2">
                  {mainNav.map((item) => (
                    <NavigationMenuLink
                      key={item.slug}
                      className="text-[#f5f5f7] hover:bg-white/10 hover:text-[#c41616] focus:bg-white/10 focus:text-[#c41616]"
                      render={<Link href={`/services/${item.slug}`} />}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  ))}
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Link href="/privacy-policy" className={link}>
            Privacy Policy
          </Link>
          <Link href="/our-details" className={link}>
            Our Details
          </Link>
          <a
            href={company.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="text-white/80 hover:text-[#c41616]"
          >
            <FacebookIcon className="size-5" />
          </a>
        </nav>
        <div className="flex items-center justify-end gap-1 sm:gap-6">
          <a
            href={company.phoneHref}
            aria-label={`Call ${company.phone}`}
            className="grid size-11 place-items-center rounded-full text-white hover:text-[#c41616] sm:hidden"
          >
            <Phone className="size-5" />
          </a>
          <div className="hidden text-right leading-tight lg:block">
            <p className="text-[12px] text-white/55">Our Location</p>
            <p className="text-[15px] font-medium">National Coverage</p>
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-[12px] text-white/55">Call Us</p>
            <a
              href={company.phoneHref}
              className="text-[15px] font-medium hover:text-[#c41616]"
            >
              {company.phone}
            </a>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="grid h-11 w-11 place-items-center text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-0 bg-white text-[#1d1d1f] data-[side=right]:w-full data-[side=right]:sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-sm font-medium text-[#6e6e73]">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4">
                <div className="leading-tight">
                  <p className="text-xs text-[#86868b]">Our Location</p>
                  <p className="text-lg font-semibold">National Coverage</p>
                  <p className="mt-3 text-xs text-[#86868b]">Call Us</p>
                  <a
                    href={company.phoneHref}
                    className="text-lg font-semibold hover:text-[#a01010]"
                  >
                    {company.phone}
                  </a>
                </div>
                <Link
                  href="/"
                  className="text-3xl font-semibold tracking-tight hover:text-[#a01010]"
                >
                  Home
                </Link>
                <button
                  className="text-left text-3xl font-semibold tracking-tight hover:text-[#a01010]"
                  aria-expanded={servicesOpen}
                  onClick={() => setServicesOpen((value) => !value)}
                >
                  Services
                </button>
                {servicesOpen &&
                  mainNav.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/services/${item.slug}`}
                      className="pl-3 text-lg text-[#6e6e73] hover:text-[#a01010]"
                    >
                      {item.label}
                    </Link>
                  ))}
                <Link
                  href="/privacy-policy"
                  className="text-3xl font-semibold tracking-tight hover:text-[#a01010]"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/our-details"
                  className="text-3xl font-semibold tracking-tight hover:text-[#a01010]"
                >
                  Our Details
                </Link>
                <a
                  href={company.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="text-[#1d1d1f] hover:text-[#a01010]"
                  onClick={() => setOpen(false)}
                >
                  <FacebookIcon className="size-7" />
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
