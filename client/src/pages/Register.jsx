function Register() {
  return (
    <div className="max-w-md mx-auto bg-white p-6 shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form className="space-y-4">
        <input className="w-full border p-2" placeholder="Email" />
        <input className="w-full border p-2" placeholder="Password" type="password" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2">Sign Up</button>
      </form>
    </div>
  );
}
export default Register;
