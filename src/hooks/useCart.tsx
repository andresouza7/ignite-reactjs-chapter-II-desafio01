import { constants } from 'node:os';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    const data: Product[] = JSON.parse(`
    [
      {
      "id": 1,
      "title": "Tênis de Caminhada Leve Confortável",
      "price": 179.9,
      "image": "https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis1.jpg"
    },
    {
      "id": 2,
      "title": "Tênis VR Caminhada Confortável Detalhes Couro Masculino",
      "price": 139.9,
      "image": "https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis2.jpg"
    },
    {
      "id": 3,
      "title": "Tênis Adidas Duramo Lite 2.0",
      "price": 219.9,
      "image": "https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis3.jpg"
    }
      ]`)

    return data.map(p => {
      p.amount = 1
      return p
    });
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const products = (await api.get<Product[]>("/products")).data
      const selectedProduct = products.find(product => product.id === productId)

      if (selectedProduct) {
        const productIncart = cart.find(cartItem => cartItem.id === productId)

        if (!productIncart) {
          setCart([...cart, { ...selectedProduct, amount: 1 }])
        } else {
          productIncart.amount++
          const updatedCart = cart.splice(0)
          setCart(updatedCart)
        }
      }
    } catch (error) {
      // TODO
      console.log(error)
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
