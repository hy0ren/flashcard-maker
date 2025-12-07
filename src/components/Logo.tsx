import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  asLink?: boolean;
};

export function Logo({ size = 44, showWordmark = false, asLink = true }: LogoProps) {
  const logoContent = (
    <>
      <div className="relative">
        <div className="relative rounded-2xl bg-transparent flex items-center justify-center overflow-hidden group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300"
             style={{ width: size, height: size }}>
          <Image
            src="/9145760.png"
            alt="Synapse logo"
            width={size}
            height={size}
            className="relative z-10 object-contain"
            priority
          />
        </div>
      </div>
      {showWordmark && (
        <div className="hidden sm:block">
          <span className="font-black text-[1.35rem] leading-none tracking-tight">
            <span className="text-gradient drop-shadow-sm font-display tracking-tight">Synapse</span>
          </span>
          <p className="text-[10px] text-[var(--muted)] -mt-0.5 tracking-wide">
            LEARN SMARTER
          </p>
        </div>
      )}
    </>
  );

  if (asLink) {
    return (
      <Link href="/" className="flex items-center gap-3 group">
        {logoContent}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      {logoContent}
    </div>
  );
}


