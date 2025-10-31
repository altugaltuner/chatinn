"use client";
export default function SearchInput({ placeholder }: { placeholder?: string }) {
  return (
    <input
      className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/40"
      placeholder={placeholder}
    />
  );
}
