import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: logique de connexion (fetch API / tanstack query)
    console.log({ email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
      
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg  placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder="Nom d'utilisateur"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>


      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200"
        >
        Recevoir mon lien
      </button>
    </form>
  );
}