import { useMemo, useState, useEffect } from "react";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { 
  Search, Package, MapPin, Calendar, CreditCard, ChevronRight, User, 
  AlertCircle, ShoppingBag, Truck, CheckCircle, ShieldCheck, ArrowLeft, Printer, ArrowRight
} from "lucide-react";
import RentPage from "./RentPage";
import ShopPage from "./ShopPage";
import Header from "../../components/common/Header";

export default function BuyPage() {
  const location = useLocation();

  const purpose = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = String(params.get("purpose") || "buy").trim().toLowerCase();
    return value === "rent" ? "rent" : "buy";
  }, [location.search]);

  return purpose === "rent" ? <RentPage /> : <ShopPage />;
}

// Track Order Component
export const TrackOrderPage = () => {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
    setErrorMsg("");
    setOrderData(null);

    const orderId = orderIdInput.trim().toUpperCase();
    const email = emailInput.trim().toLowerCase();

    if (orderId === "FF-98213" && email === "john@example.com") {
      setOrderData({
        orderId: "FF-98213",
        email: "john@example.com",
        orderType: "Rental",
        status: "Shipped",
        estimatedDelivery: "2026-07-16",
        placedAt: "2026-07-12",
        carrier: "DHL Express",
        trackingNumber: "DHL-9831-294A",
        timeline: [
          { step: "Order Placed", date: "2026-07-12 09:14 AM", completed: true, desc: "We received your order and payment verification was successful." },
          { step: "Quality Inspection & Sanitization", date: "2026-07-12 03:30 PM", completed: true, desc: "Garments passed deep cleaning and multi-point inspection." },
          { step: "Handed over to Courier", date: "2026-07-13 10:15 AM", completed: true, desc: "Package departed warehouse and is on its way to sorting center." },
          { step: "Out for Delivery", date: "In Progress", completed: false, desc: "Carrier is delivering the package to your address." },
          { step: "Delivered & Signed", date: "Pending", completed: false, desc: "Package reaches target destination." }
        ],
        items: [
          { name: "Pro Compression Training Shorts", size: "L", type: "Rental (5 Days)", price: 15, qty: 1, image: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=200" },
          { name: "FitFlow Seamless Crop Top", size: "M", type: "Rental (5 Days)", price: 12, qty: 1, image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=200" }
        ],
        summary: { subtotal: 27, deposit: 50, shipping: 5, total: 82 },
        shippingAddress: { name: "John Doe", phone: "+84 (123) 456-789", address: "Room 402, High-Tech Tower, Cau Giay, Hanoi" }
      });
    } else {
      setErrorMsg("Order not found. Please double-check your Order ID and associated email address.");
    }
  };

  return (
    <div style={{ backgroundColor: "#09090b", color: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <Header />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "6rem 2rem 4rem" }}>
        <section style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "800", background: "linear-gradient(135deg, #fff, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1rem" }}>Track Your Shipment</h1>
          <p style={{ color: "#a1a1aa", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>Enter your order details to track shipment progress.</p>
        </section>

        <section style={{ maxWidth: "650px", margin: "0 auto 4rem", backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "2.5rem" }}>
          <form onSubmit={handleTrackSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>Order ID</label>
                <input type="text" value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)} placeholder="e.g. FF-98213" required style={{ width: "100%", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "0.75rem", color: "#fff" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "#a1a1aa", marginBottom: "0.5rem" }}>Email</label>
                <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="e.g. john@example.com" required style={{ width: "100%", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "0.75rem", color: "#fff" }} />
              </div>
            </div>
            <button type="submit" style={{ backgroundColor: "#3b82f6", border: "none", color: "#fff", padding: "0.85rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>Track</button>
          </form>
        </section>

        {hasSearched && orderData && (
          <section style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "3rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "2rem" }}>
                  <h2>Status: <span style={{ color: "#3b82f6" }}>{orderData.status}</span></h2>
                  <p>Carrier: {orderData.carrier} | Waybill: {orderData.trackingNumber}</p>
                </div>
                <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "2.5rem" }}>
                  <h3>Tracking History</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {orderData.timeline.map((step, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ color: step.completed ? "#3b82f6" : "#71717a" }}>●</div>
                        <div>
                          <strong>{step.step}</strong> - <small>{step.date}</small>
                          <p style={{ margin: 0, color: "#a1a1aa" }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

// Order History Component
export const OrderHistoryPage = () => {
  const [orders] = useState([
    { id: "FF-98213", placedAt: "2026-07-12", total: 82, status: "Shipped", type: "Rental", itemsCount: 2, previewItemName: "Pro Compression Training Shorts" }
  ]);

  return (
    <div style={{ backgroundColor: "#09090b", color: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <Header />
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "6rem 2rem 4rem" }}>
        <h1>Order History</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map(order => (
            <div key={order.id} style={{ backgroundColor: "#18181b", border: "1px solid #27272a", padding: "1.5rem", borderRadius: "12px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>{order.id}</strong> ({order.type})
                <p style={{ margin: 0, color: "#a1a1aa" }}>Placed on {order.placedAt}</p>
              </div>
              <div>
                <strong>${order.total}</strong> - <span style={{ color: "#3b82f6" }}>{order.status}</span>
              </div>
              <Link to={`/orders/${order.id}`} style={{ color: "#3b82f6" }}>View Details</Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

// Order Detail Component
export const OrderDetailPage = () => {
  const { id } = useParams();
  const order = {
    orderId: id || "FF-98213",
    placedAt: "2026-07-12",
    status: "Shipped",
    type: "Rental",
    shippingAddress: { name: "John Doe", phone: "+84 (123) 456-789", address: "Room 402, High-Tech Tower, Cau Giay, Hanoi" },
    items: [{ name: "Pro Compression Training Shorts", size: "L", price: 15, qty: 1 }],
    summary: { subtotal: 15, deposit: 50, shipping: 5, total: 70 }
  };

  return (
    <div style={{ backgroundColor: "#09090b", color: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <Header />
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "6rem 2rem 4rem" }}>
        <h2>Order Detail: {order.orderId}</h2>
        <div style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "16px", padding: "2rem" }}>
          <p>Status: {order.status}</p>
          <p>Address: {order.shippingAddress.address}</p>
          <div>
            {order.items.map((item, idx) => (
              <div key={idx}>{item.name} - Qty: {item.qty} (${item.price})</div>
            ))}
          </div>
          <hr style={{ borderColor: "#27272a", margin: "1rem 0" }} />
          <div>Total Paid: ${order.summary.total}</div>
        </div>
      </main>
    </div>
  );
};

