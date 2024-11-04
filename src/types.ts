export interface User {
  id: string;
  userName: string;
  email: string;
  userType: 'emprendedor' | 'cliente';
  photoURL?: string;
  createdAt: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ProductDetails: { product: Product };
  Chat: { userId: string; userName: string };
  EditProfile: undefined;
  MyProducts: undefined;
};

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  sellerName: string;
  sellerId: string;
  createdAt: string;
  category?: string;
}