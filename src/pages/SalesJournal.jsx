import { useState } from "react";
import { products as defaultProducts, categories } from "../data/products";
import { Plus, Trash2, PlusCircle, X, ChevronDown } from "lucide-react";

function formatPrice(n) {
  return "฿" + n.toLocaleString();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

const CATEGORY_OPTIONS = [...categories, "Other"];

export default function SalesJournal({ transactions, customProducts, onAddTransaction, onDeleteTransaction, onAddCustomProduct }) {
  const allProducts = [...defaultProducts, ...customProducts];

  // Form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Custom product modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Other", price: "", unit: "unit" });
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCat, setUseCustomCat] = useState(false);

  // Filter
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const selectedProduct = allProducts.find((p) => p.id === selectedProductId);
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    onAddTransaction({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      price: selectedProduct.price,
      quantity: Number(quantity),
      totalPrice: selectedProduct.price * Number(quantity),
      date,
    });
    setSubmitting(false);
    setSuccessMsg(`✓ TRANSACTION RECORDED`);
    setSelectedProductId("");
    setQuantity(1);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleAddCustomProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const finalCategory = useCustomCat && customCategory ? customCategory : newProduct.category;
    onAddCustomProduct({ ...newProduct, category: finalCategory, price: Number(newProduct.price) });
    setNewProduct({ name: "", category: "Other", price: "", unit: "unit" });
    setCustomCategory("");
    setUseCustomCat(false);
    setShowAddProduct(false);
  };

  // Filter + sort transactions
  const filteredTx = transactions
    .filter((tx) => filterCat === "All" || tx.category === filterCat)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return b.totalPrice - a.totalPrice;
      return 0;
    });

  const allCategories = ["All", ...new Set([...categories, ...customProducts.map((p) => p.category)])];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-black text-white tracking-widest">
          SALES <span className="text-neon-pink">JOURNAL</span>
        </h1>
        <p className="font-mono text-xs text-gray-500 mt-1 tracking-widest">RECORD // TRACK // ANALYZE</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Record Sale Form */}
          <div className="bg-dark-800 border border-neon-pink/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-sm font-black text-white tracking-widest">NEW TRANSACTION</h2>
              <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product selector */}
              <div>
                <label className="font-mono text-xs text-gray-500 tracking-widest block mb-1.5">PRODUCT</label>
                <div className="relative">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    className="w-full bg-dark-700 border border-neon-pink/20 rounded-lg px-3 py-2.5 text-white font-body text-sm appearance-none focus:outline-none focus:border-neon-pink/60 transition-colors cursor-pointer"
                  >
                    <option value="">— Select product —</option>
                    {CATEGORY_OPTIONS.map((cat) => {
                      const items = allProducts.filter((p) => p.category === cat);
                      if (items.length === 0) return null;
                      return (
                        <optgroup key={cat} label={`── ${cat} ──`} className="text-gray-500">
                          {items.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.isCustom ? "★" : ""}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Unit Price display */}
              {selectedProduct && (
                <div className="bg-dark-700 rounded-lg px-3 py-2 border border-neon-pink/10">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-gray-500">UNIT PRICE</span>
                    <span className="font-display text-sm text-neon-pink font-black">{formatPrice(selectedProduct.price)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono text-xs text-gray-500">CATEGORY</span>
                    <span className="font-body text-xs text-gray-400">{selectedProduct.category}</span>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="font-mono text-xs text-gray-500 tracking-widest block mb-1.5">QUANTITY</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  className="w-full bg-dark-700 border border-neon-pink/20 rounded-lg px-3 py-2.5 text-white font-display text-sm font-bold focus:outline-none focus:border-neon-pink/60 transition-colors"
                />
              </div>

              {/* Date */}
              <div>
                <label className="font-mono text-xs text-gray-500 tracking-widest block mb-1.5">DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-dark-700 border border-neon-pink/20 rounded-lg px-3 py-2.5 text-white font-body text-sm focus:outline-none focus:border-neon-pink/60 transition-colors"
                />
              </div>

              {/* Total */}
              <div className="bg-dark-900 rounded-lg px-4 py-3 border border-neon-pink/30">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-gray-400 tracking-widest">TOTAL PRICE</span>
                  <span className="font-display text-xl font-black text-neon-pink">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedProductId || submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-display font-black text-sm tracking-widest bg-neon-pink/10 text-neon-pink border border-neon-pink/40 hover:bg-neon-pink/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-neon-pink"
              >
                <Plus className="w-4 h-4" />
                RECORD SALE
              </button>

              {successMsg && (
                <div className="text-center font-mono text-xs text-neon-green animate-pulse">{successMsg}</div>
              )}
            </form>
          </div>

          {/* Add Custom Product */}
          <div className="bg-dark-800 border border-neon-cyan/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-sm font-black text-white tracking-widest">CUSTOM PRODUCT</h2>
                <p className="font-mono text-xs text-gray-600 mt-0.5">Add unlisted items</p>
              </div>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-body font-semibold text-xs text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/10 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showAddProduct ? "CANCEL" : "ADD"}
              </button>
            </div>

            {showAddProduct && (
              <form onSubmit={handleAddCustomProduct} className="space-y-3 mt-4 pt-4 border-t border-neon-cyan/10">
                <div>
                  <label className="font-mono text-xs text-gray-500 block mb-1">PRODUCT NAME</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Custom Mouse Pad"
                    required
                    className="w-full bg-dark-700 border border-neon-cyan/20 rounded px-3 py-2 text-white font-body text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-gray-500 block mb-1">CATEGORY</label>
                  <select
                    value={useCustomCat ? "__custom__" : newProduct.category}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setUseCustomCat(true);
                      } else {
                        setUseCustomCat(false);
                        setNewProduct({ ...newProduct, category: e.target.value });
                      }
                    }}
                    className="w-full bg-dark-700 border border-neon-cyan/20 rounded px-3 py-2 text-white font-body text-sm focus:outline-none focus:border-neon-cyan/50"
                  >
                    {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="__custom__">+ New Category...</option>
                  </select>
                </div>
                {useCustomCat && (
                  <div>
                    <label className="font-mono text-xs text-gray-500 block mb-1">NEW CATEGORY NAME</label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Gaming Chair"
                      required
                      className="w-full bg-dark-700 border border-neon-cyan/20 rounded px-3 py-2 text-white font-body text-sm focus:outline-none focus:border-neon-cyan/50"
                    />
                  </div>
                )}
                <div>
                  <label className="font-mono text-xs text-gray-500 block mb-1">PRICE (฿)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="0"
                    required
                    className="w-full bg-dark-700 border border-neon-cyan/20 rounded px-3 py-2 text-white font-body text-sm focus:outline-none focus:border-neon-cyan/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded font-display font-black text-xs tracking-widest bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-all"
                >
                  ADD PRODUCT
                </button>
              </form>
            )}

            {customProducts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neon-cyan/10">
                <p className="font-mono text-xs text-gray-600 mb-2">{customProducts.length} custom product{customProducts.length !== 1 ? "s" : ""}</p>
                <div className="space-y-1">
                  {customProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="font-body text-gray-400 truncate flex-1">{p.name}</span>
                      <span className="font-mono text-neon-cyan ml-2">{formatPrice(p.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Transactions Table */}
        <div className="lg:col-span-3">
          <div className="bg-dark-800 border border-gray-700/50 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display text-sm font-black text-white tracking-widest">TRANSACTION LOG</h2>
                <p className="font-mono text-xs text-gray-500 mt-0.5">{filteredTx.length} records</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Category filter */}
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="bg-dark-700 border border-gray-600/50 rounded px-2 py-1.5 text-gray-400 font-mono text-xs focus:outline-none focus:border-neon-cyan/40"
                >
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-dark-700 border border-gray-600/50 rounded px-2 py-1.5 text-gray-400 font-mono text-xs focus:outline-none focus:border-neon-cyan/40"
                >
                  <option value="date">Sort: Date</option>
                  <option value="amount">Sort: Amount</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {filteredTx.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-600">
                <div className="font-display text-4xl mb-3 opacity-20">∅</div>
                <p className="font-mono text-sm tracking-widest">NO TRANSACTIONS YET</p>
                <p className="font-body text-xs text-gray-700 mt-1">Record your first sale to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-900/50">
                      <th className="px-4 py-3 text-left font-mono text-xs text-gray-600 tracking-widest">DATE</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-gray-600 tracking-widest">PRODUCT</th>
                      <th className="px-4 py-3 text-left font-mono text-xs text-gray-600 tracking-widest">CAT.</th>
                      <th className="px-4 py-3 text-right font-mono text-xs text-gray-600 tracking-widest">QTY</th>
                      <th className="px-4 py-3 text-right font-mono text-xs text-gray-600 tracking-widest">UNIT</th>
                      <th className="px-4 py-3 text-right font-mono text-xs text-gray-600 tracking-widest">TOTAL</th>
                      <th className="px-4 py-3 text-center font-mono text-xs text-gray-600 tracking-widest">DEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map((tx, i) => (
                      <tr key={tx.id} className={`border-t border-gray-800/50 hover:bg-dark-700/30 transition-colors ${i % 2 === 0 ? "" : "bg-dark-900/20"}`}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                        <td className="px-4 py-3">
                          <div className="font-body text-sm font-semibold text-gray-200 max-w-[160px] truncate" title={tx.productName}>
                            {tx.productName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs px-2 py-0.5 rounded border border-neon-cyan/20 text-neon-cyan/70 bg-neon-cyan/5 whitespace-nowrap">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-display text-sm font-bold text-white">{tx.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">{formatPrice(tx.price)}</td>
                        <td className="px-4 py-3 text-right font-display text-sm font-black text-neon-pink">{formatPrice(tx.totalPrice)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 rounded text-gray-600 hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-neon-pink/20 bg-dark-900/50">
                      <td colSpan={5} className="px-4 py-3 font-mono text-xs text-gray-500 tracking-widest">TOTAL ({filteredTx.length} transactions)</td>
                      <td className="px-4 py-3 text-right font-display text-base font-black text-neon-pink">
                        {formatPrice(filteredTx.reduce((s, t) => s + t.totalPrice, 0))}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
