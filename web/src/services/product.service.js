/**
 * EcoCycle Web - Product Service
 * Handles API calls for products.
 */

import { getToken } from './auth.service.js';

const API_BASE = '/api/products';

/**
 * Fetch all products from the backend.
 * @returns {Promise<Array>} Array of product objects.
 */
export async function getAllProducts() {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getAllProducts failed:', error);
    throw error;
  }
}
