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

  async function checkStockAvailability(productId: number, amount: number): Promise<boolean> {
    const productStock = (await api.get<Stock>(`/stock/${productId}`)).data

    const isAvailable = amount <= productStock.amount
    console.log(isAvailable)

    return isAvailable
  }

  const addProduct = async (productId: number) => {
    try {
      // TODO
      // Para não lidar com a referencia de memoria errada, eu crio uma variável tempCart e uso ela no find abaixo
      const tempCart = [...cart];
      const productAlreadyInCart = tempCart.find(product => product.id === productId);

      //Trouxe o estoque aqui pra cima do if, para validar antes
      const { data: stock } = await api.get<Stock>(`stock/${productId}`);

      //Pega o valor atual do estoque que queremos, se já tiver em estoque pega o estoque atual, se não tiver, fica como 0
      const currentAmount = productAlreadyInCart ? productAlreadyInCart.amount : 0;

      //Crio uma varíavel com o total final, que vai ser o que vamos adicionar no carrinho:
      const amount = currentAmount + 1;

      //Valido o estoque
      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      //Se já tiver em estoque, só altera o estoque
      if (productAlreadyInCart) {
        productAlreadyInCart.amount = amount;
      } else {
        //Se não tiver em estoque, busca o produto e adiciona em carrinho temporário
        const product = await api.get<Product>(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1,
        };

        tempCart.push(newProduct);
      }

      //Faço o set no estado e crio no localStorage
      setCart(tempCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(tempCart));

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
      if (amount < 1) {
        throw new Error("Erro na alteração de quantidade do produto")
      }
      const productInCart = cart.find(product => product.id === productId)

      if (!productInCart) {
        throw new Error("Erro na alteração de quantidade do produto")
      }

      const stockAvailable = await checkStockAvailability(productId, amount)

      if (stockAvailable) {
        const updatedCart = cart.map(e => e.id === productId ? { ...e, amount } : e)

        setCart(updatedCart)
        localStorage.setItem(LOCAL_STORAGE_REF, JSON.stringify(updatedCart))
      } else {
        throw new Error("Quantidade solicitada fora de estoque")
      }
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
