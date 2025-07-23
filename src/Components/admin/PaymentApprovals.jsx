// components/admin/PaymentApprovals.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { increment } from "firebase/firestore";

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { format } from "date-fns";

const PaymentApprovals = () => {
  const [pending, setPending] = useState([]);
  const currentMonth = format(new Date(), "yyyy-MM");

  useEffect(() => {
    const fetchMarkedUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (user) =>
            user.paymentMarkedByMonth &&
            user.paymentMarkedByMonth[currentMonth] === "pending"
        );
      setPending(data);
    };

    fetchMarkedUsers();
    
  }, []);
  const approvePayment = async (user) => {
    const userRef = doc(db, "users", user.id);
    console.log(user);
    const paidAmount = user.monthlypayment ;
  
    await updateDoc(userRef, {
      [`paymentMarkedByMonth.${currentMonth}`]: "approved",
      totalpaid: increment(paidAmount),
      totaldue: increment(-paidAmount),
    });
  //organization amount alos increase after that
  const orgRef = doc(db, 'organization', 'main');
  await updateDoc(orgRef, {
    totalAmount: increment(paidAmount)
  });

    const transRef = doc(db, "transaction", `${user.id}_${Date.now()}`);
    await setDoc(transRef, {
      userId: user.uid,
      amount: paidAmount,
      type: "payment",
      date: Timestamp.now(),
      month: currentMonth,
      name: user.name || "",
    });
  
    setPending((prev) => prev.filter((u) => u.id !== user.id));
  };
  
  

  return (
    <div className="mt-10 mb-8">
  <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Approvals</h2>

  {pending.length === 0 ? (
    <p className="text-gray-600">No pending payments this month.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pending.map((user) => (
        <div
          key={user.id}
          className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            <p className="text-sm text-gray-600 mt-1">Monthly Due: <span className="font-medium text-gray-800">₹{user.monthlypayment}</span></p>
          </div>
          <button
            onClick={() => approvePayment(user)}
            className="mt-5 w-full bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Approve Payment
          </button>
        </div>
      ))}
    </div>
  )}
</div>

  );
};

export default PaymentApprovals;
