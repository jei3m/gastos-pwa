import { Link } from 'react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { TypographyH3 } from '@/components/custom/typography';
import AccountSelector from './account-selector';

function Navbar() {
  const isMobile = useIsMobile();

  return (
    <div className="pb-12 md:pb-14">
      <nav className="fixed top-0 z-10 flex h-[50px] w-full items-center justify-between border-b-2 bg-white p-2">
        <Link
          to="/pages/transactions"
          className="flex items-center space-x-2"
        >
          <img
            src="/icons/favicon.ico"
            alt="Gastos Icon"
            height={32}
            width={32}
          />
          <TypographyH3>Gastos</TypographyH3>
        </Link>

        {/* Select Accounts Dropdown */}
        {isMobile && <AccountSelector />}
      </nav>
    </div>
  );
}

export default Navbar;
