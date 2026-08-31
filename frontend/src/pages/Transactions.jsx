import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ShoppingCart, IndianRupee, User, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { transactionsAPI, customersAPI, productsAPI } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchTransactions();
    fetchDropdowns();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll();
      setTransactions(res.data);
    } catch (err) {
      console.error("Transactions fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        customersAPI.getAll(),
        productsAPI.getAll()
      ]);
      setCustomers(cRes.data);
      setProducts(pRes.data);

      if (cRes.data.length > 0) setSelectedCustomerId(cRes.data[0].id);
      if (pRes.data.length > 0) setSelectedProductId(pRes.data[0].id);
    } catch (err) {
      console.error("Dropdown fetch error:", err);
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
  const calculatedTotal = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId || quantity <= 0) {
      setToastMessage("Please select customer, product, and valid quantity");
      setToastType("error");
      return;
    }

    if (selectedProduct && selectedProduct.stock_quantity < quantity) {
      setToastMessage(`Insufficient stock! Available: ${selectedProduct.stock_quantity}`);
      setToastType("error");
      return;
    }

    try {
      await transactionsAPI.create({
        customer_id: parseInt(selectedCustomerId),
        items: [
          {
            product_id: parseInt(selectedProductId),
            quantity: parseInt(quantity)
          }
        ],
        payment_method: paymentMethod
      });

      setIsModalOpen(false);
      setToastMessage(`Transaction recorded! Stock updated.`);
      setToastType('success');
      
      // Refresh transactions and products list
      fetchTransactions();
      fetchDropdowns();
    } catch (err) {
      setToastMessage(err.response?.data?.detail || 'Error processing transaction');
      setToastType('error');
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      <Navbar title="Sales & POS Transactions" />
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      <main className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Transaction History</h1>
            <p className="text-xs text-slate-500">Record counter sales, deduct stock automatically, and generate invoice records</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Sale / Transaction</span>
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Tx ID & Date</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Items Purchased</th>
                  <th className="py-3.5 px-4 text-right">Total Amount (₹)</th>
                  <th className="py-3.5 px-4 text-center">Payment Mode</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">Loading transactions log...</td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        <p className="text-sm font-extrabold text-blue-600">#TX-{tx.id}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{new Date(tx.created_at).toLocaleString()}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{tx.customer_name}</td>
                      <td className="py-3.5 px-4">
                        {tx.items && tx.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-700">
                            <span className="font-semibold text-slate-900">{item.product_name}</span> × {item.quantity} units
                          </div>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">
                        ₹{tx.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase">
                          {tx.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">No transactions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Record Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Sale Transaction">
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone || c.email || 'Retail Customer'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₹{p.price} (In Stock: {p.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Credit / Debit Card</option>
              </select>
            </div>
          </div>

          {/* Auto Calculated Summary Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Auto Calculated Total</p>
              <p className="text-xs text-slate-300">₹{selectedProduct?.price || 0} × {quantity} units</p>
            </div>
            <div className="text-right">
              <h4 className="text-xl font-extrabold text-emerald-400">₹{calculatedTotal.toLocaleString('en-IN')}</h4>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20"
            >
              Submit & Deduct Inventory
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Transactions;
