import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import {
  collection, addDoc, updateDoc, getDoc, serverTimestamp, increment, doc
} from 'firebase/firestore';
import Loader from '../Loader';

export default function ExternalBorrow() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');
  const[load,setload] = useState(false);
  const [orgAmount, setOrgAmount] = useState(0);

  useEffect(() => {
    const fetchOrg = async () => {
      const snap = await getDoc(doc(db, 'organization', 'main'));
      setOrgAmount(snap.data()?.totalAmount || 0);
    };
    fetchOrg();
  }, []);

  const handleExternalBorrow = async () => {
    setload(true);
    const amt = parseFloat(amount);
    if (!name || !amt || !dueDate) {
      alert('Fill all fields');
      return;
    }

    if (amt > orgAmount) {
      alert('Not enough funds');
      return;
    }

    await addDoc(collection(db, 'transaction'), {
      name:`${name}External User`,
      externalUser: true,
      type: 'Borrow',
      amount: amt,
      dueDate,
      message,
      date: serverTimestamp(),
      status: 'pending',
    });

    await updateDoc(doc(db, 'organization', 'main'), {
      totalAmount: increment(-amt),
    });

    alert('External borrow recorded');
    setName('');
    setAmount('');
    setDueDate('');
    setMessage('');
    setload(false);
  };
if(load){
    <Loader/>;
}
  return (
    <div className="bg-white shadow-md border mt-10 p-6 rounded-xl max-w-md mx-auto space-y-5">
  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">External Borrow Entry</h3>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Name</label>
    <input
      type="text"
      placeholder="Enter name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
    <input
      type="number"
      placeholder="Enter amount"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Due Date</label>
    <input
      type="date"
      value={dueDate}
      onChange={(e) => setDueDate(e.target.value)}
      className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
    <textarea
      rows={3}
      placeholder="Add an optional message"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="border rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
    />
  </div>

  <div className="pt-4">
    <button
      onClick={handleExternalBorrow}
      disabled={load}
      className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
        load
          ? 'bg-purple-400 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700'
      }`}
    >
      {load ? 'Submitting...' : 'Submit External Borrow'}
    </button>
  </div>
</div>

  );
}
