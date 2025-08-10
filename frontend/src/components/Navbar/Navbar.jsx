import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';

const Navbar = () => {
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  return (
    <header className='navbar'>
      <div className='navbar-inner'>

        {/* Group 1: Logo */}
        <Link to='/' className='brand group'>
          <img className='logo' src={assets.logo} alt="Quickbite" />
        </Link>

        {/* Group 2: Menu */}
        <nav className='navbar-menu group'>
          <Link to='/'>Home</Link>
          <a href='#explore-menu'>Menu</a>
          <a href='#app-download'>Mobile app</a>
          <a href='#footer'>Contact us</a>
        </nav>

        {/* Group 3: Search */}
        <form className='nav-search group' onSubmit={onSearch}>
          <input
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder='Search food...'
            aria-label='Search food'
          />
          <button type='submit' className='search-btn'>Search</button>
        </form>

        {/* Group 4: Auth / Cart / Profile */}
        <div className="navbar-right group">
          {!token ? (
            <div className='auth-buttons'>
              <button onClick={()=>navigate('/login')} className='btn-outline'>Login</button>
              <button onClick={()=>navigate('/signup')} className='btn-solid'>Sign Up</button>
            </div>
          ) : (
            <>
              <div className='navbar-search-icon'>
                <Link to='/cart' aria-label='Cart'>
                  <img src={assets.basket_icon} alt="cart"/>
                </Link>
                <div className={getTotalCartAmount()===0 ? '' : 'dot'} />
              </div>
              <div className='navbar-profile'>
                <img src={assets.profile_icon} alt="profile" />
                <ul className='nav-profile-dropdown'>
                  <li onClick={()=>navigate('/myorders')}>
                    <img src={assets.bag_icon} alt="orders"/> <p>Orders</p>
                  </li>
                  <hr />
                  <li onClick={logout}>
                    <img src={assets.logout_icon} alt="logout"/> <p>Logout</p>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
