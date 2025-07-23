import { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import {
  collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc, increment, serverTimestamp
} from 'firebase/firestore';
import Loader from '../Loader';

export default function ReturnList() {
  const [transactions, setTransactions] = useState([]);
  const [load,setload] = useState(false);

  const loadTransactions = async () => {
    const snap = await getDocs(
      query(
        collection(db, 'transaction'),
        where('type', '==', 'Borrow'),
        where('status', '==', 'pending')
      )
    );
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // You already include both internal and external users, just show 'name' in UI accordingly
    setTransactions(list);
    console.log(transactions)
  };


const handleReturn = async (txn) => {
  const confirm = window.confirm(`Mark ₹${txn.amount} from ${txn.name} as returned?`);
  if (!confirm) return;

  try {
    setload(true);
    const timestamp = new Date().toISOString();

    // 1. Update transaction status
    await updateDoc(doc(db, 'transaction', txn.id), {
      status: 'returned',
      returnDate: timestamp,
    });

    // 2. If internal user: decrement user's borrowed amount
    if (!txn.externalUser && txn.userId) {
      const userRef = doc(db, 'users', txn.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      await updateDoc(userRef, {
        totalborrowed: increment(-txn.amount),
        totaldue: increment(-txn.amount),
        totalreturn: increment(txn.amount),
        messages: [
            ...(userData?.messages || []),
            `You Have Returned the ${txn.amount}. Thank you! ${timestamp}`,
          ],
      });
    }

    // 3. Add amount back to organization
    const orgRef = doc(db, 'organization', 'main');
    await updateDoc(orgRef, {
      totalAmount: increment(txn.amount)
    });

    // 4. Log the return as a new transaction
    await addDoc(collection(db, 'transaction'), {
      type: 'Returned Borrow Amount',
      name: txn.name,
      amount: txn.amount,
      userId: txn.userId || null,
      externalUser: txn.externalUser || false,
      status: 'completed',
      date: timestamp,
      remark: 'Returned amount',
    });

    loadTransactions();
    alert('Marked as returned and logged successfully.');
  } catch (error) {
    console.error('Error updating return:', error);
    alert('Something went wrong!');
  }
  finally{
    setload(false);
  }
};

  

  useEffect(() => {
    loadTransactions();
  }, []);
if(load){
    return <Loader/>;
}
  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Pending Returns</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No pending borrows</p>
      ) : (
        <ul className="space-y-3">
          {transactions.map(txn => (
            <li key={txn.id} className="border p-4 rounded flex justify-between">
              <div>
                <p><strong>User:</strong> {txn.name}</p>
                <p><strong>Amount:</strong> ₹{txn.amount}</p>
                <p><strong>Due:</strong> {txn.dueDate}</p>
              </div>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => handleReturn(txn)}
              >
                ✅ Mark as Returned
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
