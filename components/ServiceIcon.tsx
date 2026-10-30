import {
  Building2,
  Camera,
  Cctv,
  DoorOpen,
  Flame,
  HardHat,
  HeartPulse,
  KeyRound,
  Lock,
  ShieldCheck,
  Store,
  Truck,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "security-personnel": Users,
  guarding: ShieldCheck,
  "static-guards": Building2,
  "mobile-security": Truck,
  "retail-guarding": Store,
  "site-security": HardHat,
  "personal-security": UserCheck,
  healthcare: HeartPulse,
  "key-holding": KeyRound,
  "lock-and-unlock": Lock,
  "cctv-and-alarms": Cctv,
  "standalone-cameras": Camera,
  "fire-services": Flame,
};

export default function ServiceIcon({
  slug,
  className = "size-5",
}: {
  slug: string;
  className?: string;
}) {
  const Icon = icons[slug] ?? ShieldCheck;
  return <Icon className={className} aria-hidden="true" />;
}
