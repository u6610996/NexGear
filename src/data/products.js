export const products = [
  // Peripherals
  { id: "P001", name: "Razer DeathAdder V3 Pro", category: "Mouse", price: 4290, unit: "unit" },
  { id: "P002", name: "Logitech G Pro X Superlight 2", category: "Mouse", price: 3990, unit: "unit" },
  { id: "P003", name: "SteelSeries Rival 650", category: "Mouse", price: 2590, unit: "unit" },

  // Keyboards
  { id: "K001", name: "Ducky One 3 Mini RGB", category: "Keyboard", price: 3490, unit: "unit" },
  { id: "K002", name: "Keychron Q1 Pro", category: "Keyboard", price: 5990, unit: "unit" },
  { id: "K003", name: "HyperX Alloy Origins 60", category: "Keyboard", price: 2890, unit: "unit" },

  // Headsets
  { id: "H001", name: "SteelSeries Arctis Nova Pro Wireless", category: "Headset", price: 8990, unit: "unit" },
  { id: "H002", name: "HyperX Cloud Alpha S", category: "Headset", price: 3490, unit: "unit" },
  { id: "H003", name: "Logitech G733 Lightspeed", category: "Headset", price: 4290, unit: "unit" },

  // Controllers
  { id: "C001", name: "Xbox Elite Series 2", category: "Controller", price: 6990, unit: "unit" },
  { id: "C002", name: "PlayStation DualSense Edge", category: "Controller", price: 5990, unit: "unit" },
  { id: "C003", name: "8BitDo Ultimate Controller", category: "Controller", price: 2890, unit: "unit" },

  // Monitors
  { id: "M001", name: 'ASUS ROG Swift 27" 360Hz', category: "Monitor", price: 24990, unit: "unit" },
  { id: "M002", name: 'LG UltraGear 27" 165Hz', category: "Monitor", price: 8990, unit: "unit" },
  { id: "M003", name: 'Samsung Odyssey G5 32"', category: "Monitor", price: 11990, unit: "unit" },

  // Accessories
  { id: "A001", name: "Corsair MM700 XL Mousepad", category: "Accessories", price: 1890, unit: "unit" },
  { id: "A002", name: "Elgato Stream Deck MK.2", category: "Accessories", price: 5290, unit: "unit" },
  { id: "A003", name: "Razer Leviathan V2 Soundbar", category: "Accessories", price: 7490, unit: "unit" },
];

export const categories = [...new Set(products.map((p) => p.category))];

export const STORAGE_KEY = "gaming_sales_transactions";
export const CUSTOM_PRODUCTS_KEY = "gaming_sales_custom_products";
