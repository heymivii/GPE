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
          type="password"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={password}
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-between">
        <div className=" flex gap-2 items-center">
          <input
            type="checkbox"
            className=""
          id="scales"
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="scales">Se souvenir de moi</label>
      </div>

      <div className=" flex gap-2 items-center">
        <Link to="/auth/pwdForgot">Mot de passe oublié ?</Link>
      </div>

   

      </div>

      <Link
        type="submit"
        className="w-full flex px-4 py-4 justify-center bg-black text-white rounded-lg transition-colors duration-200" to={"/dashboard"}      >
        Se connecter
      </Link>
      <p>Vous n’avez pas encore de compte ? <Link to="/auth/register">Incrivez-vous</Link> </p>
    </form>
  );
}
