import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: logique de connexion (fetch API / tanstack query)
    console.log({ email, password });
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
      <div>
      
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg  placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
      
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder="Mot de passe"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
     
      <input
  type="password"
  className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
  style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
  value={password}
  placeholder="Confirmation du mot de passe"
  onChange={(e) => setPassword(e.target.value)}
  required
/>
      </div>
      
            <div className=" flex gap-2 items-center">
     
      <input
  type="checkbox"
  className=""
  id="scales"
  onChange={(e) => setPassword(e.target.value)}
  required
/>
  <label htmlFor="scales">Accepter les conditions d'utilisation</label>
      </div>

      <div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200"
        >
        Rejoindre l'aventure SkyWalk
      </button>
          <p>Vous avez déjà un compte ?  <Link to="/auth/login">Connectez-vous</Link> </p>
    </form>
  );
}