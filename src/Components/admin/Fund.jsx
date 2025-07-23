import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';

const categories = ['Education', 'Emergency', 'Business Development', 'Medical', 'Marriage', 'Other'];

const Fund = () => {
  const [category, setCategory] = useState('');
  const [orgAmount, setOrgAmount] = useState(0);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [funds, setFunds] = useState([]);

  const handleAddFund = async (e) => {
    e.preventDefault();
    if (!category || !purpose || !amount) {
      alert('Please fill all fields.');
      return;
    }

    const numericAmount = parseInt(amount);
    if (numericAmount > orgAmount) {
      alert('Not enough amount in organization fund.');
      return;
    }

    try {
      // 1. Add to 'funds' collection
      await addDoc(collection(db, 'funds'), {
        category,
        purpose,
        amount: numericAmount,
        date: serverTimestamp(),
        status: 'Sent',
      });

      // 2. Add to 'transaction' collection
      await addDoc(collection(db, 'transaction'), {
        type: 'Organization Fund Sent',
        name: 'Admin',
        userId: null,
        amount: numericAmount,
        message: `₹${numericAmount} sent for ${purpose}`,
        status: 'Paid',
        date: serverTimestamp(),
        remark: category
      });

      // 3. Update organization fund
      const orgRef = doc(db, 'organization', 'main');
      await updateDoc(orgRef, {
        totalAmount: increment(-numericAmount),
        totalfunds: increment(numericAmount)
      });

      // 4. Reset fields
      setPurpose('');
      setAmount('');
      setCategory('');
    } catch (err) {
      console.error('Error adding fund:', err);
      alert('Failed to add fund.');
    }
  };

  useEffect(() => {
    const orgRef = doc(db, 'organization', 'main');
    const usub = onSnapshot(orgRef, (snap) => {
      setOrgAmount(snap.data()?.totalAmount || 0);
    });

    const q = query(collection(db, 'funds'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFunds(data);
    });

    return () => {
      usub();
      unsub();
    };
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#292a62]">Fund Disbursement</h2>

      {/* Form */}
      <form onSubmit={handleAddFund} className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className='flex items-center justify-between mt-4'>
          <button
            type="submit"
            className="bg-[#292a62] text-white px-4 py-2 rounded hover:bg-[#1e1f4d]"
          >
            Add Fund
          </button>
          <h2 className='text-xl font-semibold'>Organization Amount: ₹{orgAmount}</h2>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-[#292a62] text-white text-sm">
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Purpose</th>
              <th className="px-4 py-2 border">Amount (₹)</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {funds.length > 0 ? (
              funds.map((fund, index) => (
                <tr key={fund.id} className="hover:bg-gray-100 text-center text-sm">
                  <td className="border px-2 py-2">{index + 1}</td>
                  <td className="border px-2 py-2">{fund.category}</td>
                  <td className="border px-2 py-2">{fund.purpose}</td>
                  <td className="border px-2 py-2">₹{fund.amount}</td>
                  <td className="border px-2 py-2">
                    {fund.date?.toDate().toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-2 text-green-700 font-medium">{fund.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">No fund transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fund;
