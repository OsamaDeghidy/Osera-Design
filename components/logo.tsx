import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex-1 flex items-center gap-1 text-2xl">
      <span className="inline-block font-extrabold text-primary">Osara</span>
      <span className="font-semibold text-foreground">AI</span>
    </Link>
  );
};

export default Logo;
