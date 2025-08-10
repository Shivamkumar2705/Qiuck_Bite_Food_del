import React, { useContext } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import { useLocation } from 'react-router-dom';

const FoodDisplay = ({category}) => {
  const {food_list} = useContext(StoreContext);
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const q = (params.get('q') || '').toLowerCase();

  const matches = (item) => {
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  };

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>
      <div className='food-display-list'>
        {food_list.map((item)=>{
          if ((category==="All" || category===item.category) && matches(item)) {
            return <FoodItem key={item._id} image={item.image} name={item.name} desc={item.description} price={item.price} id={item._id}/>
          }
          return null;
        })}
      </div>
    </div>
  )
}

export default FoodDisplay