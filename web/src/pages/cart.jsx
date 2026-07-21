import React, { useState, useEffect, useRef } from "react";
import { getCart, removeItem, clearCart } from "../services/cart.service.js";
import { createOrder } from "../services/order.service.js";
import { isAuthenticated } from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";
import { apiFetch } from "../utils/api.js";
import { useNavigate } from "react-router-dom";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

export default function Cart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [clearing, setClearing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // AI chat states
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Bạn có thể hỏi AI Stylist về cách phối đồ hoặc lựa chọn món phù hợp hơn trong giỏ hàng.' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [navigate]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const cartData = await getCart();
      const items = cartData.items || [];
      const totalPrice = cartData.totalPrice || items.reduce((sum, item) => sum + Number(item.price || 0), 0);
      setCart({ items, totalPrice });
    } catch (err) {
      setError(err.message || 'Vui lòng kiểm tra lại kết nối');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await removeItem(id);
      showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
      await loadCart();
      window.dispatchEvent(new CustomEvent('ecocycle:cart-updated'));
    } catch (err) {
      showToast('Lỗi xóa sản phẩm: ' + (err.message || 'Xin thử lại'), 'error');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) return;
    setClearing(true);
    try {
      await clearCart();
      showToast('Đã làm trống giỏ hàng', 'info');
      await loadCart();
      window.dispatchEvent(new CustomEvent('ecocycle:cart-updated'));
    } catch (err) {
      showToast('Lỗi thao tác: ' + (err.message || 'Xin thử lại'), 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      for (const item of cart.items) {
        if (item.productId) {
          await createOrder(item.productId);
        }
      }
      await clearCart();
      showToast('Đặt hàng thành công! Đơn hàng đã được chuyển tới Tủ đồ.', 'success');
      window.dispatchEvent(new CustomEvent('ecocycle:cart-updated'));
      setTimeout(() => {
        navigate('/profile');
      }, 600);
    } catch (err) {
      showToast('Lỗi đặt hàng: ' + (err.message || 'Xin thử lại'), 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const question = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: question }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const itemSummary = cart.items.slice(0, 6).map(item => item.productName || 'Sản phẩm').join(', ') || 'không có sản phẩm';
      const prompt = `Bạn là AI Stylist của EcoCycle. Hãy tư vấn cách phối đồ hoặc chọn món phù hợp hơn cho các sản phẩm trong giỏ hàng hiện tại: ${itemSummary}. Câu hỏi của người dùng: ${question}. Trả lời bằng tiếng Việt, ngắn gọn, hữu ích và chỉ dùng văn bản, không tạo ảnh hoặc ảnh giả.`;
      const answer = await apiFetch(`/api/chat/ask?question=${encodeURIComponent(prompt)}`);
      setChatMessages(prev => [...prev, { role: 'assistant', content: typeof answer === 'string' ? answer : 'AI chưa có câu trả lời phù hợp lúc này.' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Không thể kết nối AI Stylist lúc này. ${err.message || ''}`.trim() }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-[104px] pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-on-surface-variant font-medium">Đang tải giỏ hàng của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-[104px] pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-error">
          <span className="material-symbols-outlined text-5xl mb-3 block mx-auto">error_outline</span>
          <p className="font-bold text-lg">Lỗi khi tải dữ liệu giỏ hàng</p>
          <p className="text-sm mt-1 text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-surface pt-[104px] pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-surface-variant/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-body-lg text-on-surface-variant mb-8">Hãy khám phá các sản phẩm quần áo thời trang tái sinh tuyệt vời ngay hôm nay.</p>
          <a href="#/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }} className="px-8 py-3 bg-primary text-on-primary rounded-xl font-semibold shadow hover:bg-primary/90 transition-all inline-flex items-center gap-2">
            <span className="material-symbols-outlined">explore</span> Khám phá cửa hàng
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-[104px] pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">Giỏ hàng của bạn</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Quản lý và thanh toán các món đồ bạn muốn mua hoặc trao đổi</p>
          </div>
          <button 
            onClick={handleClearCart} 
            disabled={clearing}
            className="px-4 py-2 rounded-xl border border-error/40 text-error hover:bg-error/10 font-semibold text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">delete_sweep</span> 
            {clearing ? 'Đang xóa...' : 'Xóa tất cả'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.cartItemId || item.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="w-20 h-20 bg-surface-variant rounded-xl overflow-hidden shrink-0 border border-outline-variant/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-outline">checkroom</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-on-surface text-lg truncate" title={item.productName || 'Sản phẩm thời trang'}>
                      {item.productName || 'Sản phẩm thời trang'}
                    </h4>
                    <p className="text-primary font-bold text-base mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a href={`#/product/${item.productId}`} onClick={(e) => { e.preventDefault(); navigate(`/product/${item.productId}`); }} className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Xem chi tiết">
                    <span className="material-symbols-outlined">visibility</span>
                  </a>
                  <button onClick={() => handleRemoveItem(item.cartItemId || item.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Xóa khỏi giỏ">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-title-lg font-bold text-on-surface mb-6 pb-3 border-b border-outline-variant/30">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-3 mb-6 text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Số lượng món đồ:</span>
                <span className="font-bold text-on-surface">{cart.items.length} món</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Phí vận chuyển dự kiến:</span>
                <span className="text-emerald-600 font-semibold">Miễn phí</span>
              </div>
              <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center text-title-md font-bold text-on-surface">
                <span>Tổng thanh toán:</span>
                <span className="text-primary text-xl">{formatPrice(cart.totalPrice)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/30 bg-surface/70 p-4 mb-4">
              <div className="flex items-start gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">AI Stylist trong giỏ hàng</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Hỏi cách phối đồ, chọn món phù hợp hơn hoặc nhận lời khuyên nhanh.</p>
                </div>
              </div>

              <div ref={chatMessagesRef} className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3 space-y-2 max-h-56 overflow-y-auto">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={msg.role === 'assistant' ? 'text-left' : 'text-right'}>
                    <div className={`inline-block max-w-full rounded-2xl px-3 py-2 text-sm ${msg.role === 'assistant' ? 'bg-surface-variant text-on-surface' : 'bg-primary text-on-primary'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="mt-3 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ví dụ: Món này phối với gì?" 
                  className="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" 
                  autoComplete="off" 
                />
                <button type="submit" disabled={chatLoading} className="px-3 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <span className={`material-symbols-outlined text-base ${chatLoading ? 'animate-spin' : ''}`}>
                    {chatLoading ? 'progress_activity' : 'send'}
                  </span>
                </button>
              </form>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={checkingOut}
              className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span className={`material-symbols-outlined ${checkingOut ? 'animate-spin' : ''}`}>
                {checkingOut ? 'progress_activity' : 'shopping_cart_checkout'}
              </span>
              {checkingOut ? 'Đang tạo đơn hàng...' : `Đặt hàng ngay (${cart.items.length} món)`}
            </button>

            <p className="text-xs text-on-surface-variant text-center mt-4">
              Bằng việc đặt hàng, bạn đồng ý với Quy chế trao đổi & thanh toán của EcoCycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
