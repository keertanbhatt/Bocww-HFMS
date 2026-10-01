import hfmsLogo from '../../assets/HFMS_Logo.jpeg';
import { ORG } from '../../constants/theme';

const LOGO_ALT =
  'Logo of Gujarat Building and Other Construction Workers Welfare Board';

export default function BrandEmblem({ className = 'h-10 w-10' }) {
  return (
    <img
      src={hfmsLogo}
      alt={LOGO_ALT}
      className={`shrink-0 rounded-full bg-white object-contain shadow-sm ring-2 ring-white/90 ${className}`}
      width={44}
      height={44}
      decoding="async"
    />
  );
}

export { hfmsLogo, LOGO_ALT };
