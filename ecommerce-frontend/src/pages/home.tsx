import { Link } from 'react-router-dom';
import ProductCard from '../components/product-card';

const Home = () => {
  const addToCartHandler = () => {

  }
  return (
    <div className='home'>
      <section></section>
      <h1>
        Latest Produts
        <Link to="/search" className='findmore'>MORE</Link>
      </h1>

      <main>
        <ProductCard 
          productId='aaaaaa'
          name='MacBook'
          price={2222}
          stock={23}
          handler={addToCartHandler}
          photo='https://m.media-amazon.com/images/I/71ItMeqpN3L._SX679_.jpg'
        />
      </main>
    </div>
  )
}

export default Home