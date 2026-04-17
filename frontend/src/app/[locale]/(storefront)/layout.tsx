import Navbar from '@/components/global/Navbar';
import Footer from '@/components/global/Footer';
import CartNotificationModal from '@/components/store/CartModal';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartNotificationModal />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
