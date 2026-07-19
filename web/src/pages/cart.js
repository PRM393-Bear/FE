/**
 * EcoCycle Web - Cart Page
 * Displays shopping cart items, allows removing single items or clearing cart, and handling checkout.
 */

import { getCart, removeItem, clearCart } from "../services/cart.service.js";
import { createOrder } from "../services/order.service.js";
import { isAuthenticated } from "../services/auth.service.js";
import { showToast } from "../utils/ui.js";
import { apiFetch } from "../utils/api.js";

function formatPrice(num) {
  if (num === undefined || num === null || isNaN(num)) return "0đ";
  return Number(num).toLocaleString("vi-VN") + "đ";
}

export function renderCartPage(container) {
  if (!isAuthenticated()) {
    window.location.hash = "#/login";
    return;
  }

  const renderLoading = () => {
    container.innerHTML = `
      <div class="min-h-screen bg-surface pt-[104px] pb-16">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
          <p class="text-on-surface-variant font-medium">Đang tải giỏ hàng của bạn...</p>
        </div>
      </div>
    `;
  };

  const loadAndRender = async () => {
    renderLoading();
    try {
      const cart = await getCart();
      const items = cart.items || [];
      const totalPrice = cart.totalPrice || items.reduce((sum, item) => sum + Number(item.price || 0), 0);

      if (items.length === 0) {
        container.innerHTML = `
          <div class="min-h-screen bg-surface pt-[104px] pb-16">
            <div class="max-w-4xl mx-auto px-4 text-center">
              <div class="w-24 h-24 bg-surface-variant/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
              </div>
              <h2 class="text-headline-sm font-bold text-on-surface mb-2">Giỏ hàng của bạn đang trống</h2>
              <p class="text-body-lg text-on-surface-variant mb-8">Hãy khám phá các sản phẩm quần áo thời trang tái sinh tuyệt vời ngay hôm nay.</p>
              <a href="#/products" class="px-8 py-3 bg-primary text-on-primary rounded-xl font-semibold shadow hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                <span class="material-symbols-outlined">explore</span> Khám phá cửa hàng
              </a>
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="min-h-screen bg-surface pt-[104px] pb-16">
          <div class="max-w-5xl mx-auto px-4">
          <div class="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
            <div>
              <h1 class="text-headline-md font-bold text-on-surface">Giỏ hàng của bạn</h1>
              <p class="text-body-md text-on-surface-variant mt-1">Quản lý và thanh toán các món đồ bạn muốn mua hoặc trao đổi</p>
            </div>
            <button id="btn-clear-cart" class="px-4 py-2 rounded-xl border border-error/40 text-error hover:bg-error/10 font-semibold text-sm transition-colors flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">delete_sweep</span> Xóa tất cả
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <!-- Items List -->
            <div class="lg:col-span-2 space-y-4">
              ${items.map(item => `
                <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 hover:border-primary/40 transition-colors">
                  <div class="flex items-center gap-4 flex-1 overflow-hidden">
                    <div class="w-20 h-20 bg-surface-variant rounded-xl overflow-hidden shrink-0 border border-outline-variant/20 flex items-center justify-center">
                      <span class="material-symbols-outlined text-3xl text-outline">checkroom</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-bold text-on-surface text-lg truncate" title="${item.productName || 'Sản phẩm thời trang'}">
                        ${item.productName || 'Sản phẩm thời trang'}
                      </h4>
                      <p class="text-primary font-bold text-base mt-1">${formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <a href="#/product/${item.productId}" class="p-2 text-on-surface-variant hover:text-primary transition-colors" title="Xem chi tiết">
                      <span class="material-symbols-outlined">visibility</span>
                    </a>
                    <button class="btn-remove-item p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" data-id="${item.cartItemId || item.id}" title="Xóa khỏi giỏ">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Order Summary -->
            <div class="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 class="text-title-lg font-bold text-on-surface mb-6 pb-3 border-b border-outline-variant/30">Tóm tắt đơn hàng</h3>
              
              <div class="space-y-3 mb-6 text-body-md">
                <div class="flex justify-between text-on-surface-variant">
                  <span>Số lượng món đồ:</span>
                  <span class="font-bold text-on-surface">${items.length} món</span>
                </div>
                <div class="flex justify-between text-on-surface-variant">
                  <span>Phí vận chuyển dự kiến:</span>
                  <span class="text-emerald-600 font-semibold">Miễn phí</span>
                </div>
                <div class="pt-3 border-t border-outline-variant/30 flex justify-between items-center text-title-md font-bold text-on-surface">
                  <span>Tổng thanh toán:</span>
                  <span class="text-primary text-xl">${formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div class="rounded-2xl border border-outline-variant/30 bg-surface/70 p-4 mb-4">
                <div class="flex items-start gap-2 mb-3">
                  <span class="material-symbols-outlined text-primary">auto_awesome</span>
                  <div>
                    <h4 class="text-sm font-bold text-on-surface">AI Stylist trong giỏ hàng</h4>
                    <p class="text-xs text-on-surface-variant mt-0.5">Hỏi cách phối đồ, chọn món phù hợp hơn hoặc nhận lời khuyên nhanh.</p>
                  </div>
                </div>

                <div id="ai-fit-chat-messages" class="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3 space-y-2 max-h-56 overflow-y-auto"></div>

                <form id="ai-fit-chat-form" class="mt-3 flex gap-2">
                  <input id="ai-fit-chat-input" type="text" placeholder="Ví dụ: Món này phối với gì?" class="flex-1 bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary" autocomplete="off" />
                  <button id="ai-fit-chat-submit" type="submit" class="px-3 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors">
                    <span class="material-symbols-outlined text-base">send</span>
                  </button>
                </form>
              </div>

              <button id="btn-checkout-all" class="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">shopping_cart_checkout</span>
                Đặt hàng ngay (${items.length} món)
              </button>

              <p class="text-xs text-on-surface-variant text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với Quy chế trao đổi & thanh toán của EcoCycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

      const aiChatMessages = container.querySelector('#ai-fit-chat-messages');
      const aiChatForm = container.querySelector('#ai-fit-chat-form');
      const aiChatInput = container.querySelector('#ai-fit-chat-input');
      const aiChatSubmitBtn = container.querySelector('#ai-fit-chat-submit');

      if (aiChatMessages && aiChatForm && aiChatInput && aiChatSubmitBtn) {
        const chatMessages = [
          {
            role: 'assistant',
            content: 'Bạn có thể hỏi AI Stylist về cách phối đồ hoặc lựa chọn món phù hợp hơn trong giỏ hàng.'
          }
        ];

        const renderAiChatMessages = () => {
          aiChatMessages.innerHTML = chatMessages.map(msg => `
            <div class="${msg.role === 'assistant' ? 'text-left' : 'text-right'}">
              <div class="inline-block max-w-full rounded-2xl px-3 py-2 text-sm ${msg.role === 'assistant' ? 'bg-surface-variant text-on-surface' : 'bg-primary text-on-primary'}">
                ${msg.content}
              </div>
            </div>
          `).join('');
          aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        };

        renderAiChatMessages();

        aiChatForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const question = aiChatInput.value.trim();
          if (!question) return;

          chatMessages.push({ role: 'user', content: question });
          renderAiChatMessages();
          aiChatInput.value = '';
          aiChatSubmitBtn.disabled = true;
          aiChatSubmitBtn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">progress_activity</span>';

          try {
            const itemSummary = items.slice(0, 6).map(item => item.productName || 'Sản phẩm').join(', ') || 'không có sản phẩm';
            const prompt = `Bạn là AI Stylist của EcoCycle. Hãy tư vấn cách phối đồ hoặc chọn món phù hợp hơn cho các sản phẩm trong giỏ hàng hiện tại: ${itemSummary}. Câu hỏi của người dùng: ${question}. Trả lời bằng tiếng Việt, ngắn gọn, hữu ích và chỉ dùng văn bản, không tạo ảnh hoặc ảnh giả.`;
            const answer = await apiFetch(`/api/chat/ask?question=${encodeURIComponent(prompt)}`);
            chatMessages.push({ role: 'assistant', content: typeof answer === 'string' ? answer : 'AI chưa có câu trả lời phù hợp lúc này.' });
          } catch (err) {
            chatMessages.push({ role: 'assistant', content: `Không thể kết nối AI Stylist lúc này. ${err.message || ''}`.trim() });
          } finally {
            renderAiChatMessages();
            aiChatSubmitBtn.disabled = false;
            aiChatSubmitBtn.innerHTML = '<span class="material-symbols-outlined text-base">send</span>';
          }
        });
      }

      // Attach event listeners
      container.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (!id) return;
          btn.disabled = true;
          try {
            await removeItem(id);
            showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
            loadAndRender();
            window.dispatchEvent(new CustomEvent('ecocycle:cart-updated'));
          } catch (err) {
            showToast('Lỗi xóa sản phẩm: ' + (err.message || 'Xin thử lại'), 'error');
            btn.disabled = false;
          }
        });
      });

      const clearBtn = container.querySelector('#btn-clear-cart');
      clearBtn?.addEventListener('click', async () => {
        if (!confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) return;
        clearBtn.disabled = true;
        try {
          await clearCart();
          showToast('Đã làm trống giỏ hàng', 'info');
          loadAndRender();
          window.dispatchEvent(new CustomEvent('ecocycle:cart-updated'));
        } catch (err) {
          showToast('Lỗi thao tác: ' + (err.message || 'Xin thử lại'), 'error');
          clearBtn.disabled = false;
        }
      });

      const checkoutBtn = container.querySelector('#btn-checkout-all');
      checkoutBtn?.addEventListener('click', async () => {
        checkoutBtn.disabled = true;
        const origHtml = checkoutBtn.innerHTML;
        checkoutBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Đang tạo đơn hàng...';

        try {
          // Process order creation for each product in the cart
          for (const item of items) {
            if (item.productId) {
              await createOrder(item.productId);
            }
          }
          await clearCart();
          showToast('Đặt hàng thành công! Đơn hàng đã được chuyển tới Tủ đồ.', 'success');
          window.dispatchEvent(new CustomEvent('ecocycle:cart-updated'));
          setTimeout(() => {
            window.location.hash = '#/profile';
          }, 600);
        } catch (err) {
          showToast('Lỗi đặt hàng: ' + (err.message || 'Xin thử lại'), 'error');
          checkoutBtn.disabled = false;
          checkoutBtn.innerHTML = origHtml;
        }
      });

    } catch (err) {
      container.innerHTML = `
        <div class="min-h-screen bg-surface pt-[104px] pb-16">
          <div class="max-w-4xl mx-auto px-4 text-center text-error">
            <span class="material-symbols-outlined text-5xl mb-3 block mx-auto">error_outline</span>
            <p class="font-bold text-lg">Lỗi khi tải dữ liệu giỏ hàng</p>
            <p class="text-sm mt-1 text-on-surface-variant">${err.message || 'Vui lòng kiểm tra lại kết nối'}</p>
          </div>
        </div>
      `;
    }
  };

  loadAndRender();
}
