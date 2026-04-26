import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import CartNotificationModal from '@/components/store/CartModal';
import FavoritesModal from '@/components/store/FavoritesModal';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartNotificationModal />
      <FavoritesModal />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
