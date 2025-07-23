import { format, set } from "date-fns";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Loader from "./Loader";
import { useState } from "react";

const PaymentMarkCheckbox = ({ userData }) => {
  const [loading, setloading] = useState(false);
  const currentMonth = format(new Date(), "yyyy-MM");
  const markedStatus = userData.paymentMarkedByMonth?.[currentMonth];

  const markPayment = async () => {
    const userRef = doc(db, "users", userData.uid); // ✅ fixed
setloading(true);
    await updateDoc(userRef, {
      [`paymentMarkedByMonth.${currentMonth}`]: "pending"
    });
    setloading(false);
  };
if(loading)
  return (
<Loader/>
  );
  return (
    <div className="mt-6">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={markedStatus === "pending" || markedStatus === "approved"}
          disabled={markedStatus === "pending" || markedStatus === "approved"}
          onChange={markPayment}
        />
        {markedStatus === "approved" ? (
          <span className="text-green-600">✅ Already Paid for {currentMonth}</span>
        ) : markedStatus === "pending" ? (
          <span className="text-yellow-600">🕐 Awaiting Approval</span>
        ) : (
          <span>Mark ₹{userData.monthlypayment} as paid for <strong>{currentMonth}</strong></span>
        )}
      </label>
    </div>
  );
};

export default PaymentMarkCheckbox;
