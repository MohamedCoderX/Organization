import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import {
  doc, updateDoc, increment, serverTimestamp, addDoc, getDoc
} from 'firebase/firestore';
import { collection } from 'firebase/firestore';

export default function BorrowModal({ user, onClose }) {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');
  const [orgAmount, setOrgAmount] = useState(0);

  useEffect(() => {
    const fetchOrg = async () => {
      const snap = await getDoc(doc(db, 'organization', 'main'));
      setOrgAmount(snap.data()?.totalAmount || 0);
    };
    fetchOrg();
  }, []);

  const handleBorrow = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !dueDate) {
      alert('Enter valid amount and due date');
      return;
    }

    if (amt > orgAmount) {
      alert('Not enough funds in organization.');
      return;
    }

    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, {
      totalborrowed: increment(amt),
      totaldue: increment(amt),
      messages: [
        ...(user.messages || []),
        `You borrowed ₹${amt}. Return by ${dueDate}. ${message}`
      ],
    });

    await addDoc(collection(db, 'transaction'), {
      userId: user.id,
      name: user.name,
      amount: amt,
      dueDate,
      type: 'Borrow',
      status: 'pending',
      message,
      date: serverTimestamp(),
    });

    await updateDoc(doc(db, 'organization', 'main'), {
      totalAmount: increment(-amt),
    });

    alert('Borrow approved');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 sm:p-8 space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Give Amount</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 transition"
          title="Close"
        >
          ✕
        </button>
      </div>
  
      <p className="text-sm text-gray-600">Giving Amount for <span className="font-medium">{user.name}</span></p>
  
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add any note or reason..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
  
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
        >
          Cancel
        </button>
        <button
          onClick={handleBorrow}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
  
  );
}
