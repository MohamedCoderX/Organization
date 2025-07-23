import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  setDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import TransactionHistory from "../Components/TransactionHistory";
import PaymentMarkCheckbox from "../Components/PaymentMarkCheckbox";

const UserDashboard = () => {
  const[amount,setamount] = useState(0);
  const currentDate = new Date();
const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [orgBalance, setOrgBalance] = useState(null);
  const [messages, setMessages] = useState([]);
  const [borrowedTxns, setBorrowedTxns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // User data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        setMessages(userDoc.data().messages || []);
      }

      // Admin messages
    
 

      // Org balance
      const orgDoc = await getDoc(doc(db, "organization", "summary"));
      if (orgDoc.exists()) {
        setOrgBalance(orgDoc.data().totalBalance);
      }

      // Borrow transactions for this user
      const borrowQuery = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("type", "in", ["borrowed", "returned"]),
        orderBy("date", "desc")
      );
      const borrowSnap = await getDocs(borrowQuery);
      setBorrowedTxns(borrowSnap.docs.map(doc => doc.data()));
    };
    const org = async()=>{
      const orgref = doc(db,"organization" , "main");
       const orgsnap = await getDoc(orgref);
       if(orgsnap.exists()){
         setOrgBalance(orgsnap.data().totalAmount);
       }
     }
     org();
    fetchData();
  }, [user]);

  if (!userData) return <p className="text-center mt-8">Loading dashboard...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4">
    <h2 className="text-3xl font-bold mb-10 border-b-2 pb-4 text-gray-800">Welcome, {userData.name}</h2>
  
    {/* Overview Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {[
        { label: "Monthly Payment", value: `₹${userData.monthlypayment}`, color: "text-gray-800" },
        { label: "Total Paid", value: `₹${userData.totalpaid}`, color: "text-green-600" },
        { label: "Total Due", value: `₹${userData.totaldue}`, color: "text-red-600" },
        { label: "Total Borrowed", value: `₹${userData.totalborrowed}`, color: "text-orange-600" },
        { label: "Total Returned", value: `₹${userData.totalreturn}`, color: "text-blue-700" },
        { label: "Available Organization Fund", value: orgBalance !== null ? `₹${orgBalance}` : "-", color: "text-black" },
      ].map((item, i) => (
        <div key={i} className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <p className="text-sm text-gray-500 tracking-wide mb-2">{item.label}</p>
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
        </div>
      ))}
    </div>
  
    {/* Mark Payment */}
    <div className="mb-12">
      <PaymentMarkCheckbox userData={userData} />
    </div>
  
    {/* Messages from Admin */}
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-12">
      <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Admin Messages</h3>
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500">No messages yet.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((msg, i) => (
            <li key={i} className="bg-gray-100 border rounded-xl p-3 text-sm text-gray-800">{msg}</li>
          ))}
        </ul>
      )}
    </div>
  
    {/* Transactions */}
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Transaction History</h3>
      <TransactionHistory userId="all" />
    </div>
  </div>
  
  
  );
};

export default UserDashboard;
