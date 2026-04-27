import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import CartNotificationModal from '@/components/store/CartModal';
import FavoritesModal from '@/components/store/FavoritesModal';
import BottomNav from '@/components/global/BottomNav';

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
      <div className="flex-1 pb-16 lg:pb-0">
        {children}
      </div>
      <BottomNav />
      <Footer />
    </div>
  );
}
