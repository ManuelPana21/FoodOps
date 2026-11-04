import { Icon } from "./Icon";

interface BrandProps {
  dark?: boolean;
}

export function Brand({ dark = false }: BrandProps) {
  return (
    <div className="brand">
      <div className={`brand-mark ${dark ? "brand-mark-dark" : ""}`}>
        <Icon name="chef" size={24} />
      </div>
      <div className={`brand-name ${dark ? "text-white" : ""}`}>
        Food<span>Ops</span>
      </div>
    </div>
  );
}
