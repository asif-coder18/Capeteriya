"use client";
import { createContext, useContext, useEffect, useRef, useState, useReducer } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

type Role = "admin" | "user";
type Page = "home" | "cart" | "checkout" | "login-choice" | "user-auth" | "admin-auth";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  photo: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

interface UserAccount {
  name: string;
  batch: string;
  studentId: string;
  password: string;
}

type CartAction =
  | { type: "ADD"; item: MenuItem }
  | { type: "REMOVE"; id: number }
  | { type: "INC"; id: number }
  | { type: "DEC"; id: number }
  | { type: "CLEAR" };

interface CartContextValue {
  cart: CartItem[];
  dispatch: Dispatch<CartAction>;
}

// ─── data/menu.js ────────────────────────────────────────────────────────────
const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Chicken Biryani", price: 120, category: "Rice", available: true, photo: "https://picsum.photos/seed/chicken-biryani/320/180" },
  { id: 2, name: "Beef Burger", price: 95, category: "Snacks", available: true, photo: "https://picsum.photos/seed/beef-burger/320/180" },
  { id: 3, name: "Veg Fried Rice", price: 80, category: "Rice", available: true, photo: "https://picsum.photos/seed/veg-fried-rice/320/180" },
  { id: 4, name: "Masala Dosa", price: 70, category: "Breakfast", available: false, photo: "https://picsum.photos/seed/masala-dosa/320/180" },
  { id: 5, name: "Chicken Sandwich", price: 65, category: "Snacks", available: true, photo: "https://picsum.photos/seed/chicken-sandwich/320/180" },
  { id: 6, name: "Mango Lassi", price: 45, category: "Drinks", available: true, photo: "https://picsum.photos/seed/mango-lassi/320/180" },
  { id: 7, name: "Egg Roll", price: 50, category: "Snacks", available: false, photo: "https://picsum.photos/seed/egg-roll/320/180" },
  { id: 8, name: "Dal Khichdi", price: 75, category: "Rice", available: true, photo: "https://picsum.photos/seed/dal-khichdi/320/180" },
  { id: 9, name: "Cold Coffee", price: 55, category: "Drinks", available: true, photo: "https://picsum.photos/seed/cold-coffee/320/180" },
  { id: 10, name: "Paneer Curry", price: 90, category: "Curry", available: true, photo: "https://picsum.photos/seed/paneer-curry/320/180" },
  { id: 11, name: "Chocolate Cake", price: 60, category: "Desserts", available: false, photo: "https://picsum.photos/seed/chocolate-cake/320/180" },
  { id: 12, name: "Lemonade", price: 35, category: "Drinks", available: true, photo: "https://picsum.photos/seed/lemonade/320/180" },
];

const CATEGORY_OPTIONS = ["Rice", "Snacks", "Breakfast", "Lunch", "Dinner", "Drinks", "Curry", "Desserts"];

// ─── context/CartContext.js ───────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | undefined>(undefined);

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.id === action.item.id);
      if (exists) return state.map((i) => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "INC":
      return state.map((i) => i.id === action.id ? { ...i, qty: i.qty + 1 } : i);
    case "DEC":
      return state.map((i) => i.id === action.id ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  return <CartContext.Provider value={{ cart, dispatch }}>{children}</CartContext.Provider>;
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

const ADMIN_ACCOUNT = { name: "admin", password: "admin123" };

// ─── components/Navbar.js ────────────────────────────────────────────────────
function Navbar({ setPage, role, currentUser, onLogout }: { setPage: Dispatch<SetStateAction<Page>>; role: Role; currentUser: string; onLogout: () => void }) {
  const { cart } = useCart();
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const canBuy = role === "user";

  return (
    <nav style={{ background: "rgba(7, 10, 31, 0.78)", borderBottom: "1px solid rgba(255, 78, 158, 0.45)", backdropFilter: "blur(10px)", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <span style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, letterSpacing: 0.4, lineHeight: 1 }}>Campus Café</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setPage("home")}
            className="nav-pill"
          >
            Menu
          </button>
          {canBuy && (
            <button
              onClick={() => setPage("cart")}
              className="nav-pill"
            >
              Cart
              {totalItems > 0 && (
                <span style={{ background: "#ff3f86", color: "#fff", borderRadius: "50%", width: 22, height: 22, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {totalItems}
                </span>
              )}
            </button>
          )}
          {role === "admin" ? (
            <span className="nav-pill" style={{ cursor: "default" }}>Admin</span>
          ) : (
            <span style={{ color: "#e2e8ff", fontSize: 13, fontWeight: 600, marginLeft: 8 }}>
              {currentUser}
            </span>
          )}
          <button
            onClick={onLogout}
            className="nav-pill"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── components/MenuCard.js ──────────────────────────────────────────────────
function MenuCard({ item, onDelete, onBuy, canManageItems, canBuy, onToggleAvailability, onEditPrice }: { item: MenuItem; onDelete: (id: number) => void; onBuy: (item: MenuItem) => void; canManageItems: boolean; canBuy: boolean; onToggleAvailability: (id: number, available: boolean) => void; onEditPrice: (id: number, currentPrice: number) => void }) {
  const { cart, dispatch } = useCart();
  const inCart = cart.find((i) => i.id === item.id);
  const fallbackPhoto = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23060d2a'/%3E%3Cstop offset='1' stop-color='%23192650'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23g)'/%3E%3Ccircle cx='520' cy='70' r='90' fill='%23ff4b9d' fill-opacity='0.22'/%3E%3Ccircle cx='160' cy='300' r='140' fill='%236e7dff' fill-opacity='0.22'/%3E%3C/svg%3E";

  return (
    <div style={{
      background: "#f8f9fc",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 14px 34px rgba(10, 16, 46, 0.35)",
      display: "flex",
      flexDirection: "column",
      border: "1px solid rgba(255, 255, 255, 0.55)",
      opacity: item.available ? 1 : 0.9,
      minHeight: 286,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div style={{ height: 118, background: "#0e1333" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photo || fallbackPhoto}
          alt={item.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackPhoto;
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div style={{ padding: "18px 16px 0", display: "flex", flexDirection: "column", gap: 12, flex: 1, background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.95) 100%)" }}>
        <div style={{ minHeight: 44 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#182242", lineHeight: 1.2, fontFamily: "'Playfair Display', serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</span>
        </div>

        {canManageItems && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "nowrap" }}>
            <button
              onClick={() => onToggleAvailability(item.id, true)}
              style={{ border: item.available ? "1px solid #bde8cc" : "1px solid #e4e8ef", background: item.available ? "#ddf4e5" : "#eef1f7", color: item.available ? "#169c4f" : "#66708a", borderRadius: 12, fontSize: 13, fontWeight: 700, padding: "8px 10px", cursor: "pointer", whiteSpace: "nowrap", flex: 1, textAlign: "center" }}
            >
              Available
            </button>
            <button
              onClick={() => onToggleAvailability(item.id, false)}
              style={{ border: !item.available ? "1px solid #f0cfd6" : "1px solid #e4e8ef", background: !item.available ? "#fff1f3" : "#eef1f7", color: !item.available ? "#c73a52" : "#25314f", borderRadius: 12, fontSize: 13, fontWeight: 700, padding: "8px 10px", cursor: "pointer", whiteSpace: "nowrap", flex: 1, textAlign: "center" }}
            >
              Sold Out
            </button>
            <button
              onClick={() => {
                const shouldDelete = window.confirm("Do you want to delete this item?");
                if (!shouldDelete) return;
                dispatch({ type: "REMOVE", id: item.id });
                onDelete(item.id);
              }}
              style={{ border: "1px solid #f3c6cd", background: "#fff0f3", color: "#ed3d57", borderRadius: 12, fontSize: 13, fontWeight: 700, padding: "8px 10px", cursor: "pointer", whiteSpace: "nowrap", flex: 1, textAlign: "center" }}
            >
              Delete
            </button>
          </div>
        )}

        <div style={{ borderTop: "1px dashed #d5dcea", marginTop: 2, paddingTop: 12 }}>
          <span style={{ color: "#5f6f93", fontSize: 15, fontWeight: 600 }}>{item.category}</span>
        </div>

        <div style={{ marginTop: "auto", padding: "10px 12px", marginLeft: -16, marginRight: -16, background: "#f3f5fa", borderTop: "1px solid #d7dcea", display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#e94560" }}>৳{item.price}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {canManageItems && (
                <button
                  onClick={() => onEditPrice(item.id, item.price)}
                  title="Edit price"
                  style={{ border: "1px solid #23346a", background: "linear-gradient(135deg, #172453 0%, #1f3f8d 100%)", color: "#fff", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "7px 10px", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Edit Price
                </button>
              )}
            </div>

            {item.available ? (
              canBuy ? (
                inCart ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => dispatch({ type: "DEC", id: item.id })} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #e94560", background: "#fff", color: "#e94560", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center", color: "#1a1a2e", fontSize: 16, lineHeight: 1 }}>
                      {inCart.qty}
                    </span>
                    <button onClick={() => dispatch({ type: "INC", id: item.id })} style={{ width: 28, height: 28, borderRadius: "50%", background: "#e94560", border: "none", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                ) : (
                  <button onClick={() => onBuy(item)} style={{ background: "#e94560", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Buy
                  </button>
                )
              ) : (
                <span style={{ color: "#df7b25", background: "#fbeede", border: "1px solid #f0d6b8", borderRadius: 10, fontSize: 11, fontWeight: 700, textAlign: "center", padding: "7px 9px", whiteSpace: "nowrap", flexShrink: 1 }}>
                  Admin cannot buy
                </span>
              )
            ) : (
              <button disabled style={{ background: "#ddd", color: "#999", border: "none", borderRadius: 12, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "not-allowed" }}>
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── app/page.js ─────────────────────────────────────────────────────────────
function HomePage({ onBuy, canManageItems, canBuy, menuItems, setMenuItems }: { onBuy: (item: MenuItem) => void; canManageItems: boolean; canBuy: boolean; menuItems: MenuItem[]; setMenuItems: Dispatch<SetStateAction<MenuItem[]>> }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    photo: "",
    available: true,
  });
  const [formError, setFormError] = useState("");
  const importPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const takePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraError("");
    setFormError("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        takePhotoInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });

      cameraStreamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          void cameraVideoRef.current.play();
        }
      }, 0);
    } catch {
      setCameraError("Camera access denied or unavailable. Please allow camera permission.");
      takePhotoInputRef.current?.click();
    }
  };

  const captureFromCamera = () => {
    const video = cameraVideoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError("Camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("Could not capture photo. Try again.");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedPhoto = canvas.toDataURL("image/jpeg", 0.92);
    setNewItem((prev) => ({ ...prev, photo: capturedPhoto }));
    stopCamera();
  };

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please choose a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewItem((prev) => ({ ...prev, photo: String(reader.result || "") }));
      if (formError) setFormError("");
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    const name = newItem.name.trim();
    const category = newItem.category.trim();
    const price = Number(newItem.price);

    if (!name || !Number.isFinite(price) || price <= 0) {
      setFormError("Please fill item name and valid price.");
      return;
    }

    setFormError("");
    setMenuItems((prevItems) => {
      const nextId = prevItems.length > 0 ? Math.max(...prevItems.map((item) => item.id)) + 1 : 1;
      return [
        {
          id: nextId,
          name,
          price,
          category: category || "General",
          available: newItem.available,
          photo: newItem.photo.trim() || `https://picsum.photos/seed/${encodeURIComponent(name)}/320/180`,
        },
        ...prevItems,
      ];
    });

    setNewItem({
      name: "",
      price: "",
      category: "",
      photo: "",
      available: true,
    });
    setFilter("all");
    setSearch("");
    setShowAddForm(false);
    stopCamera();
  };

  const handleDeleteItem = (id: number) => {
    setMenuItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleToggleAvailability = (id: number, available: boolean) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, available } : item,
      ),
    );
  };

  const handleEditPrice = (id: number, currentPrice: number) => {
    const input = window.prompt("Enter new price:", String(currentPrice));
    if (input === null) return;

    const nextPrice = Number(input.trim());
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      window.alert("Please enter a valid positive price.");
      return;
    }

    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, price: nextPrice } : item,
      ),
    );
  };

  const filtered = menuItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "available" && item.available);
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "42px 24px 54px" }}>
      {/* Cafeteria Info */}
      <div style={{ background: "linear-gradient(135deg, rgba(12, 17, 48, 0.94) 0%, rgba(29, 26, 64, 0.9) 42%, rgba(42, 24, 64, 0.88) 100%)", borderRadius: 22, padding: "30px 34px", marginBottom: 34, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, border: "1px solid rgba(255, 130, 188, 0.45)", boxShadow: "0 0 26px rgba(84, 145, 255, 0.25), 0 0 26px rgba(255, 100, 171, 0.25)" }}>
        <div>
          <h1 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Campus Central Cafeteria</h1>
          <p style={{ color: "#b7bfd6", margin: "8px 0 0", fontSize: 14 }}>Fresh meals, served daily for students & staff</p>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ff4d8f", fontWeight: 800, fontSize: 18 }}>7:30 AM</div>
            <div style={{ color: "#9ba5c7", fontSize: 12 }}>Opens</div>
          </div>
          <div style={{ width: 1, background: "rgba(183, 191, 214, 0.38)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ff4d8f", fontWeight: 800, fontSize: 18 }}>9:00 PM</div>
            <div style={{ color: "#9ba5c7", fontSize: 12 }}>Closes</div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {!showAddForm && (
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <input
              className="search-input"
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 42px 12px 16px", borderRadius: 14, border: "1px solid rgba(191, 206, 255, 0.26)", fontSize: 14, outline: "none", fontFamily: "inherit", background: "rgba(17, 22, 53, 0.78)", color: "#f4f7ff", backdropFilter: "blur(2px)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#aab4d4", fontSize: 16, cursor: "pointer", padding: 4, lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "available"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                if (showAddForm) {
                  setShowAddForm(false);
                  setCameraError("");
                  stopCamera();
                }
              }}
              className={`toolbar-btn ${!showAddForm && filter === f ? "active" : ""}`}
            >
              {f === "all" ? "All Items" : "Available"}
            </button>
          ))}
          {canManageItems && (
            <button
              onClick={() => {
                setShowAddForm(true);
              }}
              className={`toolbar-btn ${showAddForm ? "active" : ""}`}
            >
              Add Item
            </button>
          )}
        </div>
      </div>

      {canManageItems && showAddForm && (
        <div style={{ background: "rgba(16, 22, 53, 0.76)", border: "1px solid rgba(164, 181, 234, 0.3)", borderRadius: 16, padding: 16, marginBottom: 20, display: "grid", gap: 10, boxShadow: "0 14px 30px rgba(3, 8, 33, 0.35)" }}>
          <input
            className="add-item-input"
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => {
              setNewItem({ ...newItem, name: e.target.value });
              if (formError) setFormError("");
            }}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(183, 196, 236, 0.34)", fontSize: 14, color: "#eef2ff", background: "rgba(12, 18, 45, 0.86)" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              className="add-item-input"
              type="number"
              min="1"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => {
                setNewItem({ ...newItem, price: e.target.value });
                if (formError) setFormError("");
              }}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(183, 196, 236, 0.34)", fontSize: 14, color: "#eef2ff", background: "rgba(12, 18, 45, 0.86)" }}
            />
            <select
              className="add-item-input"
              value={newItem.category}
              onChange={(e) => {
                setNewItem({ ...newItem, category: e.target.value });
                if (formError) setFormError("");
              }}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(183, 196, 236, 0.34)", fontSize: 14, color: "#eef2ff", background: "rgba(12, 18, 45, 0.86)" }}
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
            <div style={{ display: "grid", gap: 8 }}>
              <input
                ref={importPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                style={{ display: "none" }}
              />
              <input
                ref={takePhotoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoFileChange}
                style={{ display: "none" }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => importPhotoInputRef.current?.click()}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(183, 196, 236, 0.4)", background: "rgba(22, 29, 66, 0.9)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Import Photo
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(183, 196, 236, 0.4)", background: "rgba(22, 29, 66, 0.9)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Take Photo
                </button>
              </div>
              {cameraOpen && (
                <div style={{ display: "grid", gap: 8 }}>
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "100%", maxWidth: 320, borderRadius: 8, border: "1px solid #e5e7eb", background: "#000" }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={captureFromCamera}
                      style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #ff3f86 0%, #ea5fb0 100%)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(183, 196, 236, 0.4)", background: "rgba(22, 29, 66, 0.9)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      Close Camera
                    </button>
                  </div>
                </div>
              )}
              {cameraError && <p style={{ color: "#b45309", fontSize: 12 }}>{cameraError}</p>}
              {newItem.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={newItem.photo} alt="Selected" style={{ width: 84, height: 56, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb" }} />
              )}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#dfe6ff" }}>
              <input
                type="checkbox"
                checked={newItem.available}
                onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
              />
              Available
            </label>
          </div>
          {formError && <p style={{ color: "#ff8a93", fontSize: 13 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setShowAddForm(false);
                setFormError("");
                setCameraError("");
                stopCamera();
              }}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(183, 196, 236, 0.4)", background: "rgba(22, 29, 66, 0.9)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #ff3f86 0%, #ea5fb0 100%)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Save Item
            </button>
          </div>
        </div>
      )}

      {!showAddForm && (
        <>
          {/* Results count */}
          <p style={{ color: "#e2e8ff", fontSize: 18, marginBottom: 20 }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""} found</p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
              <p style={{ marginTop: 12, fontSize: 16 }}>No items match your search.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 18 }}>
              {filtered.map((item) => <MenuCard key={item.id} item={item} onDelete={handleDeleteItem} onBuy={onBuy} canManageItems={canManageItems} canBuy={canBuy} onToggleAvailability={handleToggleAvailability} onEditPrice={handleEditPrice} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LoginChoicePage({ setPage }: { setPage: Dispatch<SetStateAction<Page>> }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a2e", fontSize: 32, marginBottom: 8 }}>Login</h1>
        <p style={{ color: "#666", marginBottom: 18 }}>Choose your role to continue</p>
        <div style={{ display: "grid", gap: 10 }}>
          <button onClick={() => setPage("user-auth")} style={{ background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, cursor: "pointer" }}>
            User Login
          </button>
          <button onClick={() => setPage("admin-auth")} style={{ background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, cursor: "pointer" }}>
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

function UserAuthPage({ setPage, userAccounts, setUserAccounts, onLoginSuccess }: { setPage: Dispatch<SetStateAction<Page>>; userAccounts: UserAccount[]; setUserAccounts: Dispatch<SetStateAction<UserAccount[]>>; onLoginSuccess: (name: string, nextRole: Role) => void }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [batch, setBatch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const account = userAccounts.find((user) => user.name === name.trim() && user.password === password);
    if (!account) {
      setError("Account not found. Please create a new account.");
      return;
    }
    onLoginSuccess(account.name, "user");
  };

  const handleRegister = () => {
    const trimmedName = name.trim();
    const trimmedBatch = batch.trim();
    const trimmedId = studentId.trim();

    if (!trimmedName || !trimmedBatch || !trimmedId || !password) {
      setError("Name, batch, ID and password are required.");
      return;
    }

    const exists = userAccounts.some((user) => user.studentId === trimmedId);
    if (exists) {
      setError("This ID already exists. Please login instead.");
      return;
    }

    const nextUser = { name: trimmedName, batch: trimmedBatch, studentId: trimmedId, password };
    setUserAccounts((prev) => [...prev, nextUser]);
    onLoginSuccess(nextUser.name, "user");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
        <button onClick={() => setPage("login-choice")} style={{ border: "none", background: "none", color: "#1a1a2e", fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>← Back</button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a2e", fontSize: 28, marginBottom: 4 }}>{mode === "login" ? "User Login" : "Create Account"}</h2>
        <p style={{ color: "#666", marginBottom: 14 }}>{mode === "login" ? "Enter name and password" : "Fill required fields to create account"}</p>

        <div style={{ display: "grid", gap: 10 }}>
          <input className="auth-input" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }} placeholder="Name" style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827", background: "#fff" }} />

          {mode === "register" && (
            <>
              <input className="auth-input" value={batch} onChange={(e) => { setBatch(e.target.value); if (error) setError(""); }} placeholder="Batch" style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827", background: "#fff" }} />
              <input className="auth-input" value={studentId} onChange={(e) => { setStudentId(e.target.value); if (error) setError(""); }} placeholder="ID" style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827", background: "#fff" }} />
            </>
          )}

          <input className="auth-input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }} placeholder="Password" style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827", background: "#fff" }} />

          {error && <p style={{ color: "#b91c1c", fontSize: 13 }}>{error}</p>}

          {mode === "login" ? (
            <button onClick={handleLogin} style={{ background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
              Login
            </button>
          ) : (
            <button onClick={handleRegister} style={{ background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
              Create Account
            </button>
          )}

          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ border: "none", background: "none", color: "#1a1a2e", fontWeight: 700, cursor: "pointer" }}
          >
            {mode === "login" ? "No account? Create new" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminAuthPage({ setPage, onLoginSuccess }: { setPage: Dispatch<SetStateAction<Page>>; onLoginSuccess: (name: string, nextRole: Role) => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = () => {
    if (name.trim() === ADMIN_ACCOUNT.name && password === ADMIN_ACCOUNT.password) {
      onLoginSuccess("Admin", "admin");
      return;
    }
    setError("Invalid admin credentials.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
        <button onClick={() => setPage("login-choice")} style={{ border: "none", background: "none", color: "#1a1a2e", fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>← Back</button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a2e", fontSize: 28, marginBottom: 10 }}>Admin Login</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <input className="auth-input" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }} placeholder="Admin Name" style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827", background: "#fff" }} />
          <input className="auth-input" type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }} placeholder="Password" style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827", background: "#fff" }} />
          {error && <p style={{ color: "#b91c1c", fontSize: 13 }}>{error}</p>}
          <button onClick={handleAdminLogin} style={{ background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, cursor: "pointer" }}>
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ item, setPage }: { item: MenuItem | null; setPage: Dispatch<SetStateAction<Page>> }) {
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!item) {
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ color: "#1a1a2e", fontFamily: "'Playfair Display', serif", fontSize: 26 }}>No item selected</h2>
        <p style={{ color: "#666", marginTop: 10 }}>Please select an item from menu to continue checkout.</p>
        <button onClick={() => setPage("home")} style={{ marginTop: 20, background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, cursor: "pointer" }}>
          Back to Menu
        </button>
      </div>
    );
  }

  const qty = Number(quantity);
  const isPhoneValid = /^\d{11}$/.test(phone);
  const isLocationValid = location.trim().length > 0;
  const isQtyValid = Number.isFinite(qty) && qty > 0;
  const canShowPayment = isPhoneValid && isLocationValid;
  const canPay = canShowPayment && isQtyValid;
  const total = isQtyValid ? item.price * qty : item.price;

  if (orderPlaced) {
    return (
      <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ color: "#1a1a2e", fontFamily: "'Playfair Display', serif", fontSize: 28, marginTop: 10 }}>Payment Successful</h2>
        <p style={{ color: "#666", marginTop: 8 }}>Your order for {item.name} has been placed via bKash.</p>
        <button onClick={() => setPage("home")} style={{ marginTop: 24, background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={() => setPage("home")} style={{ border: "none", background: "none", color: "#1a1a2e", fontWeight: 700, cursor: "pointer", marginBottom: 14 }}>
        ← Back
      </button>

      <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #ececec", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h2 style={{ color: "#1a1a2e", fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 14 }}>Buy {item.name}</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="01XXXXXXXXX"
            maxLength={11}
            style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827" }}
          />
          {phone.length > 0 && !isPhoneValid && (
            <p style={{ color: "#b45309", fontSize: 12 }}>Phone number must be exactly 11 digits.</p>
          )}

          <label style={{ fontSize: 13, color: "#555", fontWeight: 600, marginTop: 4 }}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Delivery / pickup location"
            style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827" }}
          />

          <label style={{ fontSize: 13, color: "#555", fontWeight: 600, marginTop: 4 }}>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #d8d8d8", fontSize: 14, color: "#111827", maxWidth: 200 }}
          />

          <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: 8, background: "#f9fafb", border: "1px solid #eceff3", color: "#1a1a2e", fontWeight: 700 }}>
            Total: ৳{total}
          </div>

          {canShowPayment ? (
            <div style={{ marginTop: 8, border: "1px solid #f3c8cf", background: "#fff7f8", borderRadius: 10, padding: 12 }}>
              <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>Payment Option</div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#444", fontSize: 14 }}>
                <input type="radio" checked readOnly />
                bKash
              </label>
            </div>
          ) : (
            <p style={{ color: "#a16207", fontSize: 13, marginTop: 6 }}>Fill phone number and location to unlock payment option.</p>
          )}

          <button
            onClick={() => setOrderPlaced(true)}
            disabled={!canPay}
            style={{ marginTop: 10, background: canPay ? "#e94560" : "#d1d5db", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, cursor: canPay ? "pointer" : "not-allowed" }}
          >
            Pay with bKash
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── app/cart/page.js ─────────────────────────────────────────────────────────
function CartPage({ setPage }: { setPage: Dispatch<SetStateAction<Page>> }) {
  const { cart, dispatch } = useCart();
  const [ordered, setOrdered] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (ordered) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a2e", fontSize: 28, marginTop: 16 }}>Order Placed!</h2>
        <p style={{ color: "#666", marginTop: 8 }}>Your food will be ready shortly. Please collect from the counter.</p>
        <button onClick={() => { dispatch({ type: "CLEAR" }); setOrdered(false); setPage("home"); }} style={{ marginTop: 28, background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "12px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Back to Menu
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a2e", fontSize: 24, marginTop: 16 }}>Your cart is empty</h2>
        <p style={{ color: "#888", marginTop: 8 }}>Add some delicious items from the menu!</p>
        <button onClick={() => setPage("home")} style={{ marginTop: 24, background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a2e", fontSize: 26, marginBottom: 24 }}>Your Cart</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cart.map((item) => (
          <div key={item.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.photo} alt={item.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#1a1a2e", fontFamily: "'Playfair Display', serif" }}>{item.name}</div>
              <div style={{ color: "#e94560", fontWeight: 700, fontSize: 15, marginTop: 2 }}>৳{item.price} × {item.qty} = ৳{item.price * item.qty}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => dispatch({ type: "DEC", id: item.id })} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #e94560", background: "#fff", color: "#e94560", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>−</button>
              <span style={{ fontWeight: 800, minWidth: 24, textAlign: "center", color: "#1a1a2e", fontSize: 16, lineHeight: 1 }}>
                {item.qty}
              </span>
              <button onClick={() => dispatch({ type: "INC", id: item.id })} style={{ width: 28, height: 28, borderRadius: "50%", background: "#e94560", border: "none", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>+</button>
            </div>
            <button onClick={() => dispatch({ type: "REMOVE", id: item.id })} style={{ background: "none", border: "none", color: "#ccc", fontSize: 18, cursor: "pointer", padding: "0 4px" }}>✕</button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", marginTop: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 10, fontSize: 14 }}>
          <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
          <span>৳{total}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 16, fontSize: 14 }}>
          <span>Service charge</span>
          <span>৳0</span>
        </div>
        <div style={{ borderTop: "2px dashed #eee", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#1a1a2e", fontFamily: "'Playfair Display', serif" }}>Total</span>
          <span style={{ fontWeight: 800, fontSize: 22, color: "#e94560" }}>৳{total}</span>
        </div>
        <button
          onClick={() => setOrdered(true)}
          style={{ width: "100%", marginTop: 18, background: "#e94560", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}
        >
          Place Order →
        </button>
      </div>
    </div>
  );
}

// ─── app/layout + root ───────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("login-choice");
  const [checkoutItem, setCheckoutItem] = useState<MenuItem | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState("");
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);

  const handleBuyNow = (item: MenuItem) => {
    if (role !== "user") return;
    setCheckoutItem(item);
    setPage("checkout");
  };

  const handleLoginSuccess = (name: string, nextRole: Role) => {
    setCurrentUser(name);
    setRole(nextRole);
    setPage("home");
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm("Do you want to logout?\n\nYes = Logout\nNo = Stay");
    if (!shouldLogout) return;

    setRole(null);
    setCurrentUser("");
    setCheckoutItem(null);
    setPage("login-choice");
  };

  return (
    <CartProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background:
            radial-gradient(1200px 500px at 70% 22%, rgba(245, 84, 168, 0.26), rgba(0, 0, 0, 0)),
            radial-gradient(1000px 450px at 22% 56%, rgba(84, 151, 255, 0.28), rgba(0, 0, 0, 0)),
            radial-gradient(900px 400px at 82% 78%, rgba(150, 82, 255, 0.2), rgba(0, 0, 0, 0)),
            #070b1e;
          color: #eaf0ff;
          min-height: 100vh;
        }
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.18) 0.7px, transparent 0.7px);
          background-size: 3px 3px;
          opacity: 0.22;
        }
        button:hover { filter: brightness(0.97); }
        .toolbar-btn {
          padding: 11px 20px;
          border-radius: 14px;
          border: 1px solid rgba(185, 199, 243, 0.35);
          background: rgba(17, 22, 53, 0.68);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          text-transform: capitalize;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .toolbar-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(204, 215, 255, 0.75);
          box-shadow: 0 0 16px rgba(120, 160, 255, 0.24);
        }
        .toolbar-btn.active {
          border-color: rgba(255, 155, 210, 0.95);
          background: linear-gradient(135deg, #ff3f86 0%, #ea5fb0 100%);
          box-shadow: 0 0 22px rgba(255, 90, 166, 0.42);
        }
        .nav-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.28);
          background: rgba(17, 22, 53, 0.68);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .nav-pill:hover {
          transform: translateY(-1px);
          border-color: rgba(204, 215, 255, 0.75);
          box-shadow: 0 0 16px rgba(120, 160, 255, 0.24);
        }
        .search-input::placeholder { color: #aeb6d7; opacity: 1; }
        .add-item-input::placeholder { color: #9ca6cd; opacity: 1; }
        .auth-input::placeholder { color: #6b7280; opacity: 1; }
      `}</style>
      {role && <Navbar setPage={setPage} role={role} currentUser={currentUser} onLogout={handleLogout} />}

      {!role && page === "login-choice" && <LoginChoicePage setPage={setPage} />}
      {!role && page === "user-auth" && <UserAuthPage setPage={setPage} userAccounts={userAccounts} setUserAccounts={setUserAccounts} onLoginSuccess={handleLoginSuccess} />}
      {!role && page === "admin-auth" && <AdminAuthPage setPage={setPage} onLoginSuccess={handleLoginSuccess} />}

      {role && page === "home" && <HomePage onBuy={handleBuyNow} canManageItems={role === "admin"} canBuy={role === "user"} menuItems={menuItems} setMenuItems={setMenuItems} />}
      {role === "user" && page === "cart" && <CartPage setPage={setPage} />}
      {role === "user" && page === "checkout" && <CheckoutPage item={checkoutItem} setPage={setPage} />}
    </CartProvider>
  );
}