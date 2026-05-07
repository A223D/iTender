type Size = "sm" | "md" | "lg" | "xl";
type Shape = "circle" | "rounded";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 w-9 text-xs",
  md: "h-10 w-10 text-xs",
  lg: "h-11 w-11 text-sm",
  xl: "h-12 w-12 text-sm",
};

export function CreatorAvatar({
  name,
  photoUrl,
  size = "lg",
  shape = "circle",
}: {
  name: string | null | undefined;
  photoUrl: string | null | undefined;
  size?: Size;
  shape?: Shape;
}) {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  const sizeCls = SIZE_CLASSES[size];
  const roundedCls = shape === "circle" ? "rounded-full" : "rounded-xl";

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name ?? ""}
        className={`${sizeCls} ${roundedCls} object-cover`}
      />
    );
  }

  return (
    <div className={`flex ${sizeCls} ${roundedCls} items-center justify-center bg-gradient-to-br from-coral to-violet font-bold text-white`}>
      {initial}
    </div>
  );
}
