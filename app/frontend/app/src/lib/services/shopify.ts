'use client';

export async function fetchProducts(limit: number = 8) {
  try {
    const response = await fetch(`/api/products?first=${limit}`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des produits');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchProducts:', error);
    return { products: { edges: [] } };
  }
}

export async function fetchCollections(limit: number = 6) {
  try {
    const response = await fetch(`/api/collections?first=${limit}`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des collections');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchCollections:', error);
    return { collections: { edges: [] } };
  }
}
