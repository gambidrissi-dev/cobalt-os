import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <form action={loginAction} className="bg-[#141416] p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Cobalt OS</h1>
        <input name="email" type="email" placeholder="Email" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" />
        <input name="password" type="password" placeholder="Mot de passe" required className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">Se connecter</button>
      </form>
    </div>
  );
}
