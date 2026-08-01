import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, BedDouble, UsersRound } from "lucide-react";
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
        <div className="premium-card relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:border-gold">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {hotel.coverImage ? (
              <img
                src={hotel.coverImage}
                alt={hotel.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

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

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {hotel.bedType && (
                  <span className="flex items-center gap-1.5 rounded-md border border-black/10 bg-surface px-2.5 py-1">
                    <BedDouble className="h-3.5 w-3.5 text-gold" />
                    {hotel.bedType}
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-md border border-black/10 bg-surface px-2.5 py-1">
                  <UsersRound className="h-3.5 w-3.5 text-gold" />
                  Up to {hotel.maxAdults} guests
                </span>
              </div>
            </div>

            <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold transition-colors group-hover:border-gold group-hover:text-gold">
              View Details
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
