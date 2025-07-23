import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const CreateUserModal = ({ onClose }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    monthlypayment: "",
    phoneno: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        uid,
        email: form.email,
        phoneno: form.phoneno,
        name: form.name,
        role: "user",
        monthlypayment: Number(form.monthlypayment),
        totalpaid: 0,
        totalborrowed: 0,
        totalreturn: 0,
        totaldue: form.monthlypayment,
        joinedAt: new Date()
      });

      setMessage("User created successfully ✅");
      setForm({
        email: "",
        password: "",
        name: "",
        monthlypayment: "",
        phoneno: ""
      });
      onClose(); // Close modal
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to create user. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Create New User
        </h2>

        {message && (
          <p className="text-center text-sm mb-4 text-green-600">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            placeholder="Full Name"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email Address"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <input
            name="phoneno"
            value={form.phoneno}
            onChange={handleChange}
            type="text"
            placeholder="Phone Number"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <input
            name="monthlypayment"
            value={form.monthlypayment}
            onChange={handleChange}
            type="number"
            placeholder="Monthly Payment Limit (₹)"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
