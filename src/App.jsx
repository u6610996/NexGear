import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SalesJournal from "./pages/SalesJournal";
import { useSales } from "./hooks/useSales";

export default function App() {
  const { transactions, customProducts, addTransaction, deleteTransaction, addCustomProduct } = useSales();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900 font-body">
        {/* Background grid effect */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,245,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow center */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,245,255,0.06) 0%, transparent 70%)",
          }}
        />

        <Navbar />

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard transactions={transactions} />} />
            <Route
              path="/journal"
              element={
                <SalesJournal
                  transactions={transactions}
                  customProducts={customProducts}
                  onAddTransaction={addTransaction}
                  onDeleteTransaction={deleteTransaction}
                  onAddCustomProduct={addCustomProduct}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
