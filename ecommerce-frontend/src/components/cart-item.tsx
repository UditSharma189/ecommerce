import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
type CartItemProps = {
    cartItem: any
};

const CartItem = ({ cartItem }: CartItemProps) => {
  const { photo, productId, name, price, quantity, stock } = cartItem;

  return (
    <div className="cart-item">
        <img src={photo} alt=""/>
        <article>
            <Link to={`/product/${productId}`}>{name}</Link>
        </article>
        <div>
            <button>-</button>
            <p>{quantity}</p>
            <button>+</button>
        </div>
        <button>
            <FaTrash />
        </button>
    </div>
  )
}

export default CartItem