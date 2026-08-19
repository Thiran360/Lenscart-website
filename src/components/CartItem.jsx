import { useCart } from "../context/CartContext";
import { FaTrash } from "react-icons/fa";

function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart();

  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} className="cart-item-image" />
      
      <div className="cart-item-details">
        <h3 className="cart-item-title">{item.brand} - {item.name}</h3>
        <p className="cart-item-size">Size: {item.size}</p>
        {item.lensDetails && (
          <div style={{ marginTop: 5 }}>
            <p className="cart-item-lenses">
              Lenses: {item.lensDetails.type.title} ({item.lensDetails.package.title})
            </p>
            {item.lensDetails.surcharge > 0 && (
              <p className="cart-item-surcharge">
                + High Power Surcharge
              </p>
            )}
            {item.lensDetails.prescription && (
              <p className="cart-item-prescription">
                Prescription: {item.lensDetails.prescription.method === 'later' ? 'Provide Later' : 'Provided'}
                {item.lensDetails.prescription.data?.name && ` (${item.lensDetails.prescription.data.name}`}
                {item.lensDetails.prescription.data?.birthYear && `${item.lensDetails.prescription.data?.name ? ', ' : ' ('}Birth Year: ${item.lensDetails.prescription.data.birthYear}`}
                {(item.lensDetails.prescription.data?.name || item.lensDetails.prescription.data?.birthYear) && `)`}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="cart-item-quantity">
        <button onClick={() => updateQuantity(item.cartItemId, -1)}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => updateQuantity(item.cartItemId, 1)}>+</button>
      </div>

      <div className="cart-item-price">
        ₹{item.price * item.quantity}
      </div>

      <button onClick={() => removeFromCart(item.cartItemId)} className="cart-item-delete">
        <FaTrash />
      </button>
    </div>
  );
}

export default CartItem;