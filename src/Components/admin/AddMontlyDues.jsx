import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase/config";
import { format } from "date-fns";

const AddMonthlyDues = () => {
  const currentMonth = format(new Date(), "yyyy-MM");

  const handleAddDues = async () => {
    const snapshot = await getDocs(collection(db, "users"));
  
    for (const docSnap of snapshot.docs) {
      const user = docSnap.data();
      const userRef = doc(db, "users", docSnap.id);
  
      // ✅ Skip admin users
      if (user.role === "admin") continue;
  
      const monthlyAmount = user.monthlypayment || 0;
      const existingDue = user.dueAmount || 0;
      const paymentStatus = user.paymentMarkedByMonth?.[currentMonth];
  
      if (!paymentStatus) {
        await updateDoc(userRef, {
          totaldue: increment(monthlyAmount),
          [`paymentMarkedByMonth.${currentMonth}`]: "",
        });

      }
    }
  
    alert("Monthly dues and pending status set for unpaid users.");
  };
  
  return (
    <div className="mb-6">
      <button
        onClick={handleAddDues}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        ➕ Add Dues for Unpaid Users (New Month)
      </button>
    </div>
  );
};

export default AddMonthlyDues;
