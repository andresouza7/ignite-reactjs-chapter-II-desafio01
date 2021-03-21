import { constants } from 'node:os';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

const LOCAL_STORAGE_REF = "@RocketShoes:cart"

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
    const storedCart = localStorage.getItem(LOCAL_STORAGE_REF)

    if (storedCart) {
      return JSON.parse(storedCart);
    }

    return []
  });

  async function getProductById(productId: number): Promise<Product | void> {
    return (await api.get<Product>(`/products/${productId}`)).data
  }

  async function checkStockAvailability(productId: number, amount: number): Promise<boolean> {
    const stockProducts = (await api.get<Stock[]>("/stock")).data
    const productStock = stockProducts.find(stock => stock.id === productId)

    if (!productStock) {
      return false
    }

    return productStock.amount >= amount
  }

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const selectedProduct = await getProductById(productId)

      if (selectedProduct) {
        // ** check if product is available

        let updatedCart = []
        const productIncart = cart.find(cartItem => cartItem.id === productId)
        let amount = productIncart?.amount ?? 1

        if (!productIncart) {
          updatedCart = [...cart, { ...selectedProduct, amount }]
        } else {
          amount++
          productIncart.amount = amount
          updatedCart = cart.splice(0)
        }

        setCart(updatedCart)
        localStorage.setItem(LOCAL_STORAGE_REF, JSON.stringify(updatedCart))
      } else {
        throw new Error()
      }
    } catch (error) {
      // TODO
      toast.error("Erro na adição do produto")
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productInCart = cart.find(product => product.id === productId)

      if (!productInCart) {
        throw new Error("Erro na remoção do produto")
      }

      const updatedCart = cart.filter(product => product.id !== productId)

      setCart(updatedCart)
      localStorage.setItem(LOCAL_STORAGE_REF, JSON.stringify(updatedCart))
    } catch (error) {
      // TODO
      toast.error(error.message)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount < 1) return
      const productInCart = cart.find(product => product.id === productId)

      if (!productInCart) {
        throw new Error("Erro na alteração de quantidade do produto")
      }

      const updatedCart = cart.map(e => e.id === productId ? { ...e, amount } : e)

      setCart(updatedCart)
      localStorage.setItem(LOCAL_STORAGE_REF, JSON.stringify(updatedCart))
    } catch (error) {
      // TODO
      toast.error(error.message)
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
