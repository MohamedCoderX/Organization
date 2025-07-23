import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase/config";

const PAGE_SIZE = 10;

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchTransactions = async (reset = false) => {
    setLoading(true);
    const q = query(
      collection(db, "transaction"),
      orderBy("date", "desc"),
      ...(reset ? [limit(PAGE_SIZE)] : [startAfter(lastDoc), limit(PAGE_SIZE)])
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setTransactions((prev) => (reset ? data : [...prev, ...data]));
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions(true);
  }, []);

  const handleLoadMore = () => {
    setPage(page + 1);
    fetchTransactions();
  };

  const latestTxn = transactions.length ? transactions[0] : null;

  return (
    <div className="p-4">
      {latestTxn && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📌 Latest Transaction</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p><strong>Type:</strong> {latestTxn.type}</p>
            <p><strong>User:</strong> {latestTxn.name}</p>
            <p><strong>Amount:</strong> ₹{latestTxn.amount}</p>
            <p>
              <strong>Date:</strong>{" "}
              {latestTxn.date?.toDate
                ? latestTxn.date.toDate().toLocaleString()
                : new Date(latestTxn.date).toLocaleString()}
            </p>
            {latestTxn.dueDate && <p><strong>Due Date:</strong> {latestTxn.dueDate}</p>}
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4 text-gray-800">All Transactions</h3>

      <div className="grid gap-4">
        {transactions.map((txn, index) => (
          <div
            key={txn.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-medium text-gray-800">
                {txn.type || "—"}
              </h4>
              <span className="text-sm text-gray-500">
                {txn.date?.toDate
                  ? txn.date.toDate().toLocaleString()
                  : new Date(txn.date).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>User:</strong> {txn.name || "Unknown"}</p>
              <p><strong>Amount:</strong> ₹{txn.amount || 0}</p>
              <p><strong>Reason : </strong>{txn.remark || txn.message || `Monthly`}</p>
              {txn.dueDate && <p><strong>Due Date:</strong> {txn.dueDate}</p>}
              {txn.message && <p className="text-green-600"><strong>Note:</strong> {txn.message}</p>}
            </div>
          </div>
        ))}
      </div>

      {!loading && lastDoc && (
        <button
          onClick={handleLoadMore}
          className="mt-6 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Load More
        </button>
      )}

      {loading && <p className="text-center text-sm mt-6 text-gray-500">Loading...</p>}
    </div>
  );
};

export default TransactionHistory;
