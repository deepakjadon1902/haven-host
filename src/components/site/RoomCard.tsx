import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Bed, PawPrint } from "lucide-react";
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
        className="group block rounded-3xl overflow-hidden border border-border bg-card transition-all hover:border-gold"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {room.coverImage ? (
            <img
              src={room.coverImage}
              alt={room.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : null}
          <div className="absolute top-4 left-4 flex gap-2">
            {room.petsAllowed && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold glass text-foreground flex items-center gap-1">
                <PawPrint className="h-3 w-3" /> Pets
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-display font-semibold group-hover:text-gold transition-colors">
            {room.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{room.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {room.bedType && (
              <span className="flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5 text-gold" /> {room.bedType}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gold" /> Up to {room.maxAdults}
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
            <span className="text-sm font-semibold text-gold group-hover:translate-x-1 transition-transform">
              View {"\u2192"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
