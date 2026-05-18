import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Star, PawPrint } from "lucide-react";
import type { Hotel } from "@/types/hotel";

export function HotelCard({ hotel, index = 0 }: { hotel: Hotel; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        to="/hotels/$hotelId"
        params={{ hotelId: hotel.slug }}
        className="group block rounded-3xl overflow-hidden border border-white/10 bg-card hover:border-gold/60 transition-all hover:shadow-gold"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={hotel.heroImage}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold glass text-white">
              {hotel.city}
            </span>
            {hotel.petsAllowed && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold glass text-white flex items-center gap-1">
                <PawPrint className="h-3 w-3" /> Pets
              </span>
            )}
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full glass text-xs font-semibold">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {hotel.rating}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-display font-semibold group-hover:text-gold transition-colors">
            {hotel.name}
          </h3>
          <p className="mt-1 text-sm text-white/65 line-clamp-1">{hotel.tagline}</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-white/55">
            <MapPin className="h-3.5 w-3.5" /> {hotel.address}
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/50">From</p>
              <p className="text-2xl font-display font-semibold gold-text">
                ₹{hotel.startingPrice.toLocaleString("en-IN")}
                <span className="text-xs font-medium text-white/55 ml-1">/ night</span>
              </p>
            </div>
            <span className="text-sm font-semibold text-gold group-hover:translate-x-1 transition-transform">
              View →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
