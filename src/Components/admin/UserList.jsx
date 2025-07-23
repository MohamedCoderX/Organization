import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import BorrowModal from './BorrowModal';
import ReturnList from './ReturnList';
import ExternalBorrow from './ExternalBorrow';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [limitInputs, setLimitInputs] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'users'));
    const userList = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.role !== 'admin');
    setUsers(userList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLimitChange = (id, value) => {
    
    setLimitInputs(prev => ({ ...prev, [id]: value }));
  };

  const setMonthlyLimit = async (userId, amount) => {
    setLoading(true)
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { monthlypayment: amount });
    setLoading(false)
  setLimitInputs("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loader mb-2 animate-spin border-4 border-yellow-400 border-t-transparent rounded-full w-8 h-8 mx-auto"></div>
          <p className="text-lg font-semibold text-gray-700">Please Wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">All Users</h2>

      <ul className="space-y-4">
        {users.map(user => (
          <li
            key={user.id}
            className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="text-sm text-gray-700">Due: ₹{user.totaldue || 0}</div>
              <div className="text-sm text-gray-700">Borrowed: ₹{user.totalborrowed || 0}</div>
              <div className="text-sm text-gray-700">Monthly Limit: ₹{user.monthlypayment || 0}</div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded text-sm font-medium"
                onClick={() => {
                  setSelectedUser(user);
                  setBorrowModalOpen(true);
                }}
              >
                ➕ Give Debt
              </button>

              <input
                type="number"
                placeholder="₹ Limit"
                value={limitInputs[user.id] || ''}
                onChange={(e) => handleLimitChange(user.id, e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
              />

              <button
                onClick={() => {
                  const amount = parseInt(limitInputs[user.id]);
                  if (!amount || amount <= 0) return alert('Please enter a valid amount');
                  setMonthlyLimit(user.id, amount);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium"
              >
                Save
              </button>
            </div>
          </li>
        ))}
      </ul>

      {borrowModalOpen && selectedUser && (
        <BorrowModal
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setBorrowModalOpen(false);
          }}
        />
      )}

      <div className="mt-12">
        <ReturnList />
      </div>

      <div className="mt-12">
        <ExternalBorrow />
      </div>
    </div>
  );
}
