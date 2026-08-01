import { createFileRoute } from "@tanstack/react-router";
import { Edit2, ImagePlus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Room } from "@/types/room";
import { partnerHotel, partnerRooms, partnerSaveRoom } from "@/lib/partner.functions";
import { storeImageFiles } from "@/lib/image-storage";

export const Route = createFileRoute("/partner/rooms")({
  component: PartnerRooms,
});

function PartnerRooms() {
  const hotel = partnerHotel();
  const [rooms, setRooms] = useState(() => partnerRooms());
  const [editing, setEditing] = useState<Room | null>(null);
  const emptyRoom = useMemo<Room>(
    () => ({
      id: "",
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelCity: hotel.city,
      slug: "",
      name: "",
      description: "",
      pricePerNightCents: 0,
      pricePerNight: 0,
      maxAdults: 2,
      maxChildren: 0,
      petsAllowed: false,
      size: "",
      bedType: "King Bed",
      amenities: [],
      images: [],
      coverImage: "",
      totalUnits: 1,
      active: true,
      sortOrder: rooms.length + 1,
    }),
    [hotel, rooms.length],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Partner rooms
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">My room types</h1>
          <p className="mt-2 text-sm text-black/60">
            Only rooms for {hotel.name} are visible here.
          </p>
        </div>
        <Button onClick={() => setEditing(emptyRoom)} className="rounded-full">
          <Plus className="h-4 w-4" />
          Add room
        </Button>
      </div>

      {editing ? (
        <RoomEditor
          room={editing}
          onCancel={() => setEditing(null)}
          onSave={(room) => {
            const saved = partnerSaveRoom(room);
            setRooms(partnerRooms());
            setEditing(null);
            toast.success(`${saved.name} saved`);
          }}
        />
      ) : null}

      <div className="grid gap-4">
        {rooms.map((room) => (
          <article
            key={room.id}
            className="grid gap-4 rounded-3xl border border-black/10 bg-white p-5 md:grid-cols-[120px_1fr_auto] md:items-center"
          >
            <img
              src={room.coverImage}
              alt={room.name}
              className="h-28 w-28 rounded-2xl object-cover"
            />
            <div>
              <p className="font-display text-2xl font-semibold">{room.name}</p>
              <p className="mt-1 text-sm text-black/60">{room.description}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-black/50">
                {room.totalUnits} units · {room.active ? "Published" : "Hidden"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-display text-2xl font-semibold">
                ₹{room.pricePerNight.toLocaleString("en-IN")}
              </p>
              <Button variant="outline" className="rounded-full" onClick={() => setEditing(room)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function RoomEditor({
  room,
  onSave,
  onCancel,
}: {
  room: Room;
  onSave: (room: Room) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(room);
  const [imageBusy, setImageBusy] = useState(false);
  const set = <K extends keyof Room>(key: K, value: Room[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setImageBusy(true);
    try {
      const stored = await storeImageFiles(files, 12);
      const nextImages = [...draft.images, ...stored.urls].slice(0, 12);
      setDraft((prev) => ({
        ...prev,
        images: nextImages,
        coverImage: prev.coverImage || nextImages[0] || "",
      }));
      toast.success(
        `${stored.count} room image${stored.count !== 1 ? "s" : ""} ${
          stored.storedRemotely ? "uploaded to ImageKit" : "optimized locally"
        }`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to optimize room images");
    } finally {
      setImageBusy(false);
    }
  };

  const removeImage = (image: string) => {
    setDraft((prev) => {
      const images = prev.images.filter((item) => item !== image);
      return {
        ...prev,
        images,
        coverImage: prev.coverImage === image ? (images[0] ?? "") : prev.coverImage,
      };
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!draft.name.trim()) return toast.error("Room name is required");
        const slug =
          draft.slug.trim() ||
          draft.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        onSave({
          ...draft,
          id: draft.id || `room-${Date.now()}`,
          slug,
          pricePerNightCents: Math.round(draft.pricePerNight * 100),
          amenities: String(draft.amenities)
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
          images: draft.images.length ? draft.images : draft.coverImage ? [draft.coverImage] : [],
          coverImage: draft.coverImage || draft.images[0] || "",
        });
      }}
      className="rounded-3xl border border-black/10 bg-white p-6"
    >
      <h2 className="font-display text-2xl font-semibold">Room listing</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input label="Room name" value={draft.name} onChange={(v) => set("name", v)} />
        <Input label="Slug" value={draft.slug} onChange={(v) => set("slug", v)} />
        <Input
          label="Price per night"
          type="number"
          value={String(draft.pricePerNight)}
          onChange={(v) => set("pricePerNight", Number(v))}
        />
        <Input
          label="Total units"
          type="number"
          value={String(draft.totalUnits)}
          onChange={(v) => set("totalUnits", Number(v))}
        />
        <Input label="Bed type" value={draft.bedType ?? ""} onChange={(v) => set("bedType", v)} />
      </div>
      <section className="mt-5 rounded-2xl border border-black/10 bg-[#fafafa] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-black/55">
              Room images
            </p>
            <p className="mt-1 text-sm text-black/60">
              Upload multiple photos from device. First selected image becomes cover.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
            <ImagePlus className="h-4 w-4" />
            {imageBusy ? "Optimizing..." : "Browse images"}
            <input
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              disabled={imageBusy}
              onChange={(event) => uploadImages(event.target.files)}
            />
          </label>
        </div>
        {draft.images.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {draft.images.map((image, index) => (
              <div
                key={`${image.slice(0, 32)}-${index}`}
                className="relative overflow-hidden rounded-xl border border-black/10 bg-white"
              >
                <img src={image} alt={`Room ${index + 1}`} className="h-32 w-full object-cover" />
                <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                  {draft.coverImage === image ? "Cover" : `Image ${index + 1}`}
                </div>
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => set("coverImage", image)}
                    className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-black"
                  >
                    Cover
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white text-black"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-white p-6 text-center text-sm text-black/55">
            No room images selected yet.
          </div>
        )}
      </section>
      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/55">
          Description
        </span>
        <textarea
          value={draft.description}
          onChange={(event) => set("description", event.target.value)}
          className="min-h-24 w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
        />
      </label>
      <Input
        label="Amenities, comma separated"
        value={draft.amenities.join(", ")}
        onChange={(v) =>
          set(
            "amenities",
            v
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
          )
        }
      />
      <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(event) => set("active", event.target.checked)}
          className="accent-black"
        />
        Publish room in main application
      </label>
      <div className="mt-6 flex gap-3">
        <Button type="submit">Save room</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
      />
    </label>
  );
}
