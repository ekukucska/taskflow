import type { User } from "@/types";

export default function Avatar({ user, size = "sm" }: { user: User | null; size?: "sm" | "md" }) {
  if (!user) return null;
  const dim = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <img
      src={user.avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e0e7ff&color=3730a3`}
      alt={user.name}
      title={user.name}
      className={`${dim} rounded-full object-cover ring-1 ring-white`}
    />
  );
}
