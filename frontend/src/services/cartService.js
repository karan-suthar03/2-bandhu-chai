import axios from '../api/axios.js';

class CartService {
    constructor() {
        this.CART_KEY = 'bandhu-cart-backup';
        this.SESSION_KEY = 'cart-session-id';
    }

    async getCart() {
        try {
            const response = await axios.get('/cart');

            if (response.data.success) {
                if (response.data.sessionId) {
                    localStorage.setItem(this.SESSION_KEY, response.data.sessionId);
                }

                this.backupToLocalStorage(response.data.cart);

                return {
                    success: true,
                    items: response.data.cart.items || [],
                    orderSummary: response.data.cart.orderSummary || {
                        subtotal: 0,
                        totalDiscount: 0,
                        shippingCost: 0,
                        tax: 0,
                        finalTotal: 0,
                        itemCount: 0
                    }
                };
            }
        } catch (error) {
            console.warn('Server cart unavailable, using local backup:', error.message);
            return this.getLocalBackup();
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            const response = await axios.post('/cart/add', {
                productId,
                quantity
            });

            if (response.data.success) {
                return await this.getCart();
            }
        } catch (error) {
            console.warn('Server add failed, using local cart:', error.message);
            return this.addToLocalCart(productId, quantity);
        }
    }

    async updateCartItem(productId, quantity) {
        try {
            const response = await axios.put(`/cart/item/${productId}`, {
                quantity
            });

            if (response.data.success) {
                return await this.getCart();
            }
        } catch (error) {
            console.warn('Server update failed, using local cart:', error.message);
            return this.updateLocalCart(productId, quantity);
        }
    }

    async removeFromCart(productId) {
        try {
            const response = await axios.delete(`/cart/item/${productId}`);

            if (response.data.success) {
                return await this.getCart();
            }
        } catch (error) {
            console.warn('Server remove failed, using local cart:', error.message);
            return this.removeFromLocalCart(productId);
        }
    }

    async clearCart() {
        try {
            const response = await axios.delete('/cart/clear');

            if (response.data.success) {
                this.clearLocalBackup();
                return { success: true, items: [], total: 0, itemCount: 0 };
            }
        } catch (error) {
            console.warn('Server clear failed, clearing local cart:', error.message);
            this.clearLocalBackup();
            return { success: true, items: [], total: 0, itemCount: 0 };
        }
    }

    async syncWithServer() {
        try {
            const localCart = this.getLocalBackup();
            if (localCart.items.length === 0) return;

            const response = await axios.post('/cart/sync', {
                items: localCart.items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            });

            if (response.data.success) {
                return await this.getCart();
            }
        } catch (error) {
            console.warn('Cart sync failed:', error.message);
            return this.getLocalBackup();
        }
    }

    backupToLocalStorage(cart) {
        try {
            const backup = {
                items: cart.items || [],
                total: cart.total || 0,
                itemCount: cart.itemCount || 0,
                lastUpdated: Date.now()
            };
            localStorage.setItem(this.CART_KEY, JSON.stringify(backup));
        } catch (error) {
            console.error('Failed to backup cart to localStorage:', error);
        }
    }

    getLocalBackup() {
        try {
            const backup = localStorage.getItem(this.CART_KEY);
            if (backup) {
                const parsed = JSON.parse(backup);

                // Check if backup is not too old (24 hours)
                const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
                if (parsed.lastUpdated && parsed.lastUpdated > dayAgo) {
                    return {
                        success: true,
                        items: parsed.items || [],
                        total: parsed.total || 0,
                        itemCount: parsed.itemCount || 0,
                        isLocalBackup: true
                    };
                }
            }
        } catch (error) {
            console.error('Failed to load cart backup:', error);
        }

        return {
            success: true,
            items: [],
            total: 0,
            itemCount: 0,
            isLocalBackup: true
        };
    }

    addToLocalCart(productId, quantity) {
        const cart = this.getLocalBackup();
        const existingItem = cart.items.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ id: productId, quantity });
        }

        this.backupToLocalStorage(cart);
        return cart;
    }

    updateLocalCart(productId, quantity) {
        const cart = this.getLocalBackup();
        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.id !== productId);
        } else {
            const item = cart.items.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
            }
        }

        this.backupToLocalStorage(cart);
        return cart;
    }

    removeFromLocalCart(productId) {
        const cart = this.getLocalBackup();
        cart.items = cart.items.filter(item => item.id !== productId);

        this.backupToLocalStorage(cart);
        return cart;
    }

    clearLocalBackup() {
        localStorage.removeItem(this.CART_KEY);
        localStorage.removeItem(this.SESSION_KEY);
    }

    async isInCart(productId) {
        const cart = await this.getCart();
        return cart.items.some(item => item.id === productId);
    }

    async getCartCount() {
        const cart = await this.getCart();
        return cart.itemCount || 0;
    }
}

export default new CartService();
