import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, BedDouble, MapPin, PawPrint, UsersRound } from "lucide-react";
import type { Room } from "@/types/room";

export function RoomCard({ room, index = 0 }: { room: Room; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        to="/rooms/$slug"
        params={{ slug: room.slug }}
        className="premium-card group block overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 hover:border-gold"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {room.coverImage ? (
            <img
              src={room.coverImage}
              alt={room.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : null}
          <div className="absolute top-4 left-4 flex gap-2">
            {room.petsAllowed && (
              <span className="glass flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-foreground">
                <PawPrint className="h-3 w-3" /> Pets
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          {room.hotelName ? (
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              <MapPin className="h-3.5 w-3.5" />
              {room.hotelName}
            </p>
          ) : null}
          <h3 className="text-xl font-display font-semibold group-hover:text-gold transition-colors">
            {room.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{room.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {room.bedType && (
              <span className="flex items-center gap-1.5 rounded-md border border-black/10 bg-surface px-2.5 py-1">
                <BedDouble className="h-3.5 w-3.5 text-gold" /> {room.bedType}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-md border border-black/10 bg-surface px-2.5 py-1">
              <UsersRound className="h-3.5 w-3.5 text-gold" /> Up to {room.maxAdults}
            </span>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">From</p>
              <p className="text-2xl font-display font-semibold text-foreground">
                {"\u20B9"}
                {room.pricePerNight.toLocaleString("en-IN")}
                <span className="text-xs font-medium text-muted-foreground ml-1">/ night</span>
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white text-gold transition group-hover:border-gold group-hover:bg-gold/10">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
