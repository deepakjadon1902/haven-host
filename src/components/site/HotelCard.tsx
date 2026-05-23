import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Room } from "@/types/room";

interface HotelCardProps {
  hotel: Room;
  index?: number;
}

export function HotelCard({ hotel, index = 0 }: HotelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to="/rooms/$slug" params={{ slug: hotel.slug }} className="group block">
        <div className="relative overflow-hidden rounded-3xl border-2 border-black bg-white transition-all hover:border-yellow-500">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {hotel.coverImage ? (
              <img
                src={hotel.coverImage}
                alt={hotel.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-2xl font-display font-semibold group-hover:text-gold transition-colors line-clamp-2">
              {hotel.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{hotel.description}</p>

            {/* Price and Features */}
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  From
                </span>
                <span className="text-2xl font-display font-semibold text-foreground">
                  {"\u20B9"}
                  {hotel.pricePerNight.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-muted-foreground">/night</span>
              </div>

              {/* Quick Features */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {hotel.bedType && (
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                    {hotel.bedType}
                  </span>
                )}
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                  Up to {hotel.maxAdults} guests
                </span>
              </div>
            </div>

            {/* CTA (card is already a link) */}
            <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-black/20 px-3 py-2 text-sm transition-colors group-hover:border-yellow-500 group-hover:text-yellow-600">
              View Details
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
