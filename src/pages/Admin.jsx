import React, { useEffect, useState } from 'react'
import CreateUser from './CreateUser'
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getDocs, collection } from "firebase/firestore";
import UserList from '../Components/admin/UserList'
import { useNavigate } from 'react-router'
import PaymentApprovals from '../Components/admin/PaymentApprovals'
import AddMonthlyDues from '../Components/admin/AddMontlyDues'
import Loader from '../Components/Loader';

const Admin = () => {
  const [amount, setAmount] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const[load,setload] = useState(true)
  const navigate = useNavigate();

  // Navigate to users page
  const handle = () => {
    navigate("/admin/users");
  };

  // Get organization amount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgRef = doc(db, "organization", "main");
        const orgSnap = await getDoc(orgRef);

        if (orgSnap.exists()) {
          setAmount(orgSnap.data());
        }

        const snapshot = await getDocs(collection(db, 'users'));
        const userList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role !== 'admin');
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching admin data: ", error);
      } finally {
        setload(false);
      }
    };

    fetchData();
  }, []);
  if(load) return <Loader/>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#292a62]">Admin Dashboard</h1>
        <button
          onClick={() => setShowCreateUserModal(true)}
          className="bg-[#292a62] text-white px-4 py-2 rounded-md hover:bg-[#1f1f47]"
        >
          + Create New User
        </button>
      </div>

      <div className="bg-white shadow-md rounded-md p-4">
        <div>
        <h2 className="text-lg font-semibold">Organization Balance:</h2>
        <p className="text-2xl font-bold text-green-700">₹{amount.totalAmount}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mt-4">Total Users:</h2>
          <p className="text-2xl font-bold text-blue-700">{users.length}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mt-4">Total Funds Given:</h2>
          <p className="text-2xl font-bold text-red-700">{amount.totalfunds}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={handle} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
          View Users
        </button>
        <button onClick={() => navigate("/admin/funds")} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
          Manage Funds
        </button>
        <button onClick={()=>navigate("/admin/transactions")} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
          View Transactions
        </button>
      </div>

      {/* Components */}
      <PaymentApprovals />
      <AddMonthlyDues />

      {/* CreateUser Modal */}
      {showCreateUserModal && (
        <CreateUser
          onClose={() => setShowCreateUserModal(false)}
        />
      )}
    </div>
  );
}

export default Admin;
