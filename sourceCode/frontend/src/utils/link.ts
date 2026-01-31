import { GoHomeFill } from "react-icons/go";
import { FaStar, FaWallet, FaStore } from "react-icons/fa";
import { FaClipboardList, FaBoxArchive } from "react-icons/fa6";
import { MdReviews } from "react-icons/md";

export const SCTNavlink = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: GoHomeFill },
    { href: '/seller/shop', label: 'ร้านค้า', icon: FaStore },
    { href: '/seller/order', label: 'คำสั่งซื้อ', icon: FaClipboardList },
    { href: '/seller/products', label: 'สินค้า', icon: FaBoxArchive },
    { href: '/seller/reviews', label: 'รีวิว', icon: MdReviews },
    { href: '/seller/balance', label: 'การเงิน', icon: FaWallet },
];
