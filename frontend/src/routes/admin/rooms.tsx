import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Edit2, Eye, EyeOff, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Room } from "@/types/room";
import { Button } from "@/components/ui/button";
import {
  adminCreateRoom,
  adminDeleteRoom,
  adminListRooms,
  adminUpdateRoom,
} from "@/lib/admin.functions";
import { storeImageFiles } from "@/lib/image-storage";

export const Route = createFileRoute("/admin/rooms")({
  head: () => ({
    meta: [{ title: "Rooms Management — Admin Panel" }],
  }),
  component: AdminRooms,
});

type RoomFormState = { mode: "create" } | { mode: "edit"; room: Room } | null;

function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<RoomFormState>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await adminListRooms();
        setRooms(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const upsertRoomInList = (room: Room) => {
    setRooms((prev) => {
      const idx = prev.findIndex((r) => r.id === room.id);
      if (idx === -1) return [room, ...prev];
      const next = prev.slice();
      next[idx] = room;
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      await adminDeleteRoom({ id });
      setRooms((prev) => prev.filter((r) => r.id !== id));
      toast.success("Room deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete room");
    }
  };

  const handleToggleActive = async (room: Room) => {
    try {
      const updated = await adminUpdateRoom({ id: room.id, patch: { active: !room.active } });
      upsertRoomInList(updated);
      toast.success(updated.active ? "Room activated" : "Room deactivated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update room");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
        <p className="text-gray-700">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-black">Rooms Management</h1>
          <Button
            onClick={() => setFormState({ mode: "create" })}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
          >
            <Plus size={20} />
            Add New Room
          </Button>
        </div>

        {formState && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-lg border-2 border-black bg-gray-50 p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-black">
                {formState.mode === "create"
                  ? "Create New Room"
                  : `Edit Room: ${formState.room.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setFormState(null)}
                className="rounded border border-black/20 p-2 text-black hover:bg-white"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <RoomForm
              mode={formState.mode}
              room={formState.mode === "edit" ? formState.room : undefined}
              onCancel={() => setFormState(null)}
              onSaved={(room) => {
                upsertRoomInList(room);
                setFormState(null);
              }}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="px-4 py-3 text-left font-bold text-black">Room Name</th>
                <th className="px-4 py-3 text-left font-bold text-black">Slug</th>
                <th className="px-4 py-3 text-left font-bold text-black">Price/Night</th>
                <th className="px-4 py-3 text-left font-bold text-black">Max Guests</th>
                <th className="px-4 py-3 text-left font-bold text-black">Units</th>
                <th className="px-4 py-3 text-left font-bold text-black">Status</th>
                <th className="px-4 py-3 text-left font-bold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => (
                <motion.tr
                  key={room.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-gray-300 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-black">{room.name}</td>
                  <td className="px-4 py-3 text-gray-700">{room.slug}</td>
                  <td className="px-4 py-3 font-semibold text-black">
                    {"\u20B9"}
                    {room.pricePerNight.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-black">{room.maxAdults + room.maxChildren}</td>
                  <td className="px-4 py-3 text-black">{room.totalUnits}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        room.active ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"
                      }`}
                    >
                      {room.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="flex gap-2 px-4 py-3">
                    <button
                      onClick={() => setFormState({ mode: "edit", room })}
                      className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                      title="Edit room"
                      type="button"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(room)}
                      className="rounded bg-gray-900 p-2 text-white hover:bg-black"
                      title={room.active ? "Deactivate room" : "Activate room"}
                      type="button"
                    >
                      {room.active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="rounded bg-red-600 p-2 text-white hover:bg-red-700"
                      title="Delete room"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {rooms.length === 0 && (
          <div className="py-16 text-center text-gray-700">
            <p className="mb-4 text-lg">No rooms found</p>
            <Button
              onClick={() => setFormState({ mode: "create" })}
              className="bg-black text-white hover:bg-gray-800"
            >
              Create First Room
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

type RoomFormMode = "create" | "edit";

function RoomForm({
  mode,
  room,
  onSaved,
  onCancel,
}: {
  mode: RoomFormMode;
  room?: Room;
  onSaved: (room: Room) => void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(room?.name ?? "");
  const [slug, setSlug] = useState(room?.slug ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const [pricePerNight, setPricePerNight] = useState<number>(room?.pricePerNight ?? 0);
  const [maxAdults, setMaxAdults] = useState<number>(room?.maxAdults ?? 2);
  const [maxChildren, setMaxChildren] = useState<number>(room?.maxChildren ?? 0);
  const [totalUnits, setTotalUnits] = useState<number>(room?.totalUnits ?? 1);
  const [petsAllowed, setPetsAllowed] = useState<boolean>(room?.petsAllowed ?? false);
  const [size, setSize] = useState<string>(room?.size ?? "");
  const [bedType, setBedType] = useState<string>(room?.bedType ?? "");
  const [amenities, setAmenities] = useState<string>((room?.amenities ?? []).join(", "));
  const [coverImage, setCoverImage] = useState<string>(room?.coverImage ?? "");
  const [images, setImages] = useState<string[]>(room?.images ?? []);
  const [sortOrder, setSortOrder] = useState<number>(room?.sortOrder ?? 0);
  const [active, setActive] = useState<boolean>(room?.active ?? true);
  const [imageBusy, setImageBusy] = useState(false);

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setImageBusy(true);
    try {
      const stored = await storeImageFiles(files, 12);
      const nextImages = [...images, ...stored.urls].slice(0, 12);
      setImages(nextImages);
      setCoverImage((prev) => prev || nextImages[0] || "");
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
    const nextImages = images.filter((item) => item !== image);
    setImages(nextImages);
    if (coverImage === image) setCoverImage(nextImages[0] ?? "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim(),
        price_per_night_cents: Math.round(Number(pricePerNight || 0) * 100),
        max_adults: Number(maxAdults || 1),
        max_children: Number(maxChildren || 0),
        pets_allowed: petsAllowed,
        size: size.trim() ? size.trim() : null,
        bed_type: bedType.trim() ? bedType.trim() : null,
        amenities: amenities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images,
        cover_image: coverImage || images[0] || null,
        total_units: Number(totalUnits || 1),
        active,
        sort_order: Number(sortOrder || 0),
      };

      const saved =
        mode === "create"
          ? await adminCreateRoom(payload)
          : await adminUpdateRoom({ id: room!.id, patch: payload });

      toast.success(mode === "create" ? "Room created successfully" : "Room updated successfully");
      onSaved(saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save room");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Room Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="e.g., Deluxe Suite"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Slug *</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="e.g., deluxe-suite"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-black">Description</label>
        <textarea
          className="w-full rounded border-2 border-black px-3 py-2 text-black"
          placeholder="Room description..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Price/Night (₹) *</label>
          <input
            type="number"
            required
            min={0}
            step={1}
            value={pricePerNight}
            onChange={(e) => setPricePerNight(Number(e.target.value))}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Max Adults *</label>
          <input
            type="number"
            required
            min={1}
            value={maxAdults}
            onChange={(e) => setMaxAdults(Number(e.target.value))}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="2"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Max Children</label>
          <input
            type="number"
            min={0}
            value={maxChildren}
            onChange={(e) => setMaxChildren(Number(e.target.value))}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="1"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Total Units *</label>
          <input
            type="number"
            required
            min={1}
            value={totalUnits}
            onChange={(e) => setTotalUnits(Number(e.target.value))}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="e.g., 38 m²"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Bed Type</label>
          <input
            type="text"
            value={bedType}
            onChange={(e) => setBedType(e.target.value)}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
            placeholder="e.g., 1 King bed"
          />
        </div>
      </div>

      <section className="rounded-lg border-2 border-black bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-black">Room Images</p>
            <p className="mt-1 text-xs text-gray-700">
              Browse images from this device. Images are resized, compressed and stored with the
              listing.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded bg-black px-4 py-2 text-sm font-bold text-white hover:bg-gray-800">
            <ImagePlus className="h-4 w-4" />
            {imageBusy ? "Optimizing..." : "Browse Images"}
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
        {images.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={`${image.slice(0, 32)}-${index}`}
                className="relative overflow-hidden rounded border border-black/10 bg-gray-50"
              >
                <img src={image} alt={`Room ${index + 1}`} className="h-32 w-full object-cover" />
                <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-bold text-white">
                  {coverImage === image ? "Cover" : `Image ${index + 1}`}
                </div>
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCoverImage(image)}
                    className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-black"
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
          <div className="mt-4 rounded border border-dashed border-black/20 bg-gray-50 p-6 text-center text-sm text-gray-700">
            No room images uploaded yet.
          </div>
        )}
      </section>

      <div>
        <label className="mb-2 block text-sm font-bold text-black">
          Amenities (comma-separated)
        </label>
        <input
          type="text"
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          className="w-full rounded border-2 border-black px-3 py-2 text-black"
          placeholder="WiFi, Smart TV, Rain shower"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-black">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded border-2 border-black px-3 py-2 text-black"
          />
        </div>
        <div className="flex items-center gap-3 pt-8">
          <input
            id="petsAllowed"
            type="checkbox"
            checked={petsAllowed}
            onChange={(e) => setPetsAllowed(e.target.checked)}
            className="h-4 w-4 accent-black"
          />
          <label htmlFor="petsAllowed" className="text-sm font-bold text-black">
            Pets allowed
          </label>
        </div>
        <div className="flex items-center gap-3 pt-8">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-black"
          />
          <label htmlFor="active" className="text-sm font-bold text-black">
            Active
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-black px-6 py-2 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Room" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-200 px-6 py-2 font-bold text-black hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
