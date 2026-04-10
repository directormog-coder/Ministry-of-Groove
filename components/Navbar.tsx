"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/store";
import { useUnreadCount } from "@/lib/supabase";
import {
  ShoppingBag, X, Plus, Minus, Menu, ArrowRight, MessageCircle, Hash
} from "lucide-react";

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, addToCart, removeFromCart } = useCart();
  const unreadCount = useUnreadCount();

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 w-full z-[60] flex items-center justify-between px-6 md:px-12 py-4 bg-[var(--cream)]/90 backdrop-blur-md border-b border-[var(--gold)]/10">
        <button className="md:hidden text-[var(--charcoal)]" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        <Link href="/" className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <Image src="/logo.png" alt="Origin 54" width={42} height={42} className="rounded-full border border-[var(--gold)]/20" />
          <div className="hidden sm:block leading-none">
            <span className="font-display text-xl text-[var(--charcoal)] block uppercase">Origin 54</span>
            <span className="font-serif text-[7px] tracking-widest text-[var(--gold)] uppercase italic">The Asili Collective</span>
          </div>
        </Link>

        <div className="hidden md:flex gap-10 text-[10px] font-bold tracking-[0.2em] text-[var(--charcoal)] uppercase items-center">
          <Link href="/shop" className="hover:text-[var(--gold)] transition-colors">Shop</Link>
          <Link href="/artisans" className="hover:text-[var(--gold)] transition-colors">Artisans</Link>
          <Link href="/about" className="hover:text-[var(--gold)] transition-colors">Our Story</Link>

          {/* Chat with unread badge */}
          <Link href="/chat" className="relative hover:text-[var(--gold)] transition-colors flex items-center gap-1">
            <MessageCircle size={16} strokeWidth={1.5} />
            <span>Chat</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1 animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Rooms */}
          <Link href="/chat/rooms" className="hover:text-[var(--gold)] transition-colors flex items-center gap-1">
            <Hash size={14} />
            <span>Rooms</span>
          </Link>
        </div>

        <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[var(--charcoal)]">
          <ShoppingBag size={22} strokeWidth={1.5} />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-[var(--gold)] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-[var(--charcoal)] flex flex-col px-8 pt-16 pb-10">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-5 right-6 text-[var(--cream)]">
            <X size={26} />
          </button>
          <nav className="flex flex-col gap-8 mt-8">
            {[["Shop", "/shop"], ["Artisans", "/artisans"], ["Our Story", "/about"]].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-4xl text-[var(--cream)] uppercase tracking-widest hover:text-[var(--gold)] transition-colors"
              >
                {label}
              </Link>
            ))}

            <Link
              href="/chat"
              onClick={() => setIsMenuOpen(false)}
              className="font-display text-4xl text-[var(--cream)] uppercase tracking-widest hover:text-[var(--gold)] transition-colors flex items-center gap-4"
            >
              Chat
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm rounded-full min-w-[28px] h-7 flex items-center justify-center font-bold px-2">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/chat/rooms"
              onClick={() => setIsMenuOpen(false)}
              className="font-display text-4xl text-[var(--cream)] uppercase tracking-widest hover:text-[var(--gold)] transition-colors flex items-center gap-3"
            >
              <Hash size={28} />
              Rooms
            </Link>
          </nav>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--cream)] h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--gold)]/20">
              <h2 className="font-display text-xl uppercase tracking-widest text-[var(--charcoal)]">Your Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[var(--charcoal)]">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={40} strokeWidth={1} className="text-[var(--charcoal)]/30" />
                  <p className="font-serif italic text-[var(--charcoal)]/50">Your bag is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-[10px] font-bold tracking-widest uppercase text-[var(--gold)] border border-[var(--gold)] px-6 py-2 hover:bg-[var(--gold)] hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.image && (
                      <div className="relative w-20 h-24 flex-shrink-0 bg-[var(--charcoal)]/5">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-serif text-sm font-medium text-[var(--charcoal)]">{item.name}</p>
                      <p className="font-serif text-xs text-[var(--charcoal)]/50 mb-2">
                        R{item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => removeFromCart(item.id)} className="text-[var(--charcoal)]/60 hover:text-[var(--charcoal)]">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="text-[var(--charcoal)]/60 hover:text-[var(--charcoal)]">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="font-serif text-sm font-semibold text-[var(--charcoal)]">
                      R{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-6 py-6 border-t border-[var(--gold)]/20 space-y-4">
                <div className="flex justify-between font-serif text-sm">
                  <span className="text-[var(--charcoal)]/60">Subtotal</span>
                  <span className="font-semibold text-[var(--charcoal)]">R{subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-[var(--charcoal)]/40 font-serif italic">
                  Shipping & duties calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-[var(--charcoal)] text-[var(--cream)] py-4 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[var(--gold)] transition-colors"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
