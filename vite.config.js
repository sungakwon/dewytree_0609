import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        index1: './index1.html',
        index2: './index2.html',
        product: './product.html',
        product2: './product2.html',
        best: './best.html',
        best2: './best2.html',
        brand: './brand.html',
        brand2: './brand2.html',
        cart: './cart.html',
        cart2: './cart2.html',
        order: './order.html',
        'ac-product': './ac-product.html',
        'ac-ampoule-detail': './ac-ampoule-detail.html',
        'ac-cream-detail': './ac-cream-detail.html',
        'ac-mask-detail': './ac-mask-detail.html',
        'amino-product': './amino-product.html',
        'amino-powder-detail': './amino-powder-detail.html',
        'cleansing-balm-detail': './cleansing-balm-detail.html',
        'cleansing-milk-detail': './cleansing-milk-detail.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
});
