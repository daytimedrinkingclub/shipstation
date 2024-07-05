import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, supabase } = useContext(AuthContext);

  const handleLoginLogout = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      // Implement login logic
    }
  };

  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">ShipStation.AI</h1>
        <button onClick={handleLoginLogout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {user ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
};

export default Header;