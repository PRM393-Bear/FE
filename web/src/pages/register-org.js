import { 
  registerApi, 
  loginApi, 
  verifyRegisterOtp, 
  uploadImageApi, 
  createOrganizationDetailApi 
} from "../services/auth.service.js";
import "../styles/register-org.css";

import { showToast } from "../utils/ui.js";

export function renderRegisterOrgPage(container) {
  container.innerHTML = `
    <main class="org-container">
        
        <!-- Stepper Progress Bar -->
        <div class="org-stepper-wrapper">
            <div class="org-stepper">
                <div id="stepIndicator1" class="org-stepper-item org-stepper-line">
                    <div class="org-stepper-circle active">1</div>
                    <span class="org-stepper-text active">Tạo tài khoản</span>
                </div>
                <div id="stepIndicator2" class="org-stepper-item org-stepper-line">
                    <div class="org-stepper-circle future">2</div>
                    <span class="org-stepper-text future">Xác thực Email</span>
                </div>
                <div id="stepIndicator3" class="org-stepper-item org-stepper-line">
                    <div class="org-stepper-circle future">3</div>
                    <span class="org-stepper-text future">Thông tin Tổ chức</span>
                </div>
                <div id="stepIndicator4" class="org-stepper-item">
                    <div class="org-stepper-circle future">4</div>
                    <span class="org-stepper-text future">Xác nhận</span>
                </div>
            </div>
        </div>

        <div class="org-grid">
            
            <!-- Left Column: Forms (60%) -->
            <section class="org-form-panel">
                
                <!-- PHASE 1: Đăng ký -->
                <div id="phase1" class="phase-section phase-active">
                    <header>
                        <h1 class="org-title">Đăng ký tài khoản Tổ chức</h1>
                        <p class="org-subtitle">Khởi tạo tài khoản đại diện cho tổ chức của bạn trên hệ thống.</p>
                    </header>
                    <form id="formPhase1">
                        <div class="org-form-row">
                            <div>
                                <label class="org-label">Tên đăng nhập</label>
                                <input type="text" id="regUsername" required class="org-input" placeholder="user_tochuc">
                            </div>
                            <div>
                                <label class="org-label">Mật khẩu</label>
                                <input type="password" id="regPassword" required class="org-input" placeholder="••••••••">
                            </div>
                            <div class="org-form-full">
                                <label class="org-label">Tên người đại diện</label>
                                <input type="text" id="regFullName" required class="org-input" placeholder="Ví dụ: Nguyễn Văn A">
                            </div>
                            <div>
                                <label class="org-label">Email liên hệ</label>
                                <input type="email" id="regEmail" required class="org-input" placeholder="email@tochuc.org">
                            </div>
                            <div>
                                <label class="org-label">SĐT liên hệ</label>
                                <input type="tel" id="regPhone" required class="org-input" placeholder="09xx xxx xxx">
                            </div>
                        </div>
                        
                        <div style="border-top: 1px solid var(--outline-variant); margin-top: 32px; padding-top: 24px; display: flex; justify-content: flex-end;">
                            <button type="submit" id="btnNext1" class="org-btn-primary">
                                Tiếp theo
                                <span class="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- PHASE 2: Xác thực OTP -->
                <div id="phase2" class="phase-section phase-hidden">
                    <header>
                        <h1 class="org-title">Xác thực Email</h1>
                        <p class="org-subtitle">Chúng tôi đã gửi mã OTP đến email <strong id="lblEmailSent" style="color: var(--primary);"></strong>. Vui lòng kiểm tra hộp thư.</p>
                    </header>
                    <form id="formPhase2" style="margin-top: 40px;">
                        <div>
                            <label class="org-label" style="display: block; text-align: center; margin-bottom: 8px;">Nhập mã OTP</label>
                            <input type="text" id="otpCode" required maxlength="6" class="org-input" style="text-align: center; font-size: 24px; letter-spacing: 0.5em; padding: 16px; font-family: monospace;" placeholder="------">
                        </div>

                        <div style="border-top: 1px solid var(--outline-variant); margin-top: 32px; padding-top: 24px; display: flex; justify-content: space-between; align-items: center;">
                            <button type="button" style="color: var(--primary); font-weight: 600; background: none; border: none; cursor: pointer; text-decoration: underline;">Gửi lại mã</button>
                            <button type="submit" id="btnNext2" class="org-btn-primary">
                                Xác thực & Đăng nhập
                                <span class="material-symbols-outlined">check_circle</span>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- PHASE 3: Thông tin Tổ chức -->
                <div id="phase3" class="phase-section phase-hidden">
                    <header>
                        <h1 class="org-title">Thông tin Tổ chức</h1>
                        <p class="org-subtitle">Vui lòng cung cấp thông tin chính xác để xây dựng niềm tin với cộng đồng.</p>
                    </header>
                    <form id="formPhase3">
                        <!-- Logo Upload -->
                        <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px;">
                            <div class="org-logo-upload" id="logoUploadBtn">
                                <span class="material-symbols-outlined" style="color: var(--outline);" id="logoPlaceholder">add_a_photo</span>
                                <img id="logoPreview" style="display: none; position: absolute; inset: 0;" src=""/>
                            </div>
                            <input type="file" id="logoInput" accept="image/jpeg, image/png, image/webp" style="display: none;">
                            <div>
                                <p class="org-label">Logo Tổ chức</p>
                                <p style="font-size: 14px; color: var(--on-surface-variant);">Định dạng JPG, PNG, WEBP. Tối đa 5MB.</p>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <label class="org-label">Tên tổ chức</label>
                            <input type="text" id="inputName" required class="org-input" placeholder="Ví dụ: Mái ấm Hoa Hồng">
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label class="org-label">Mô tả hoạt động</label>
                            <textarea id="inputDesc" required rows="4" class="org-textarea" placeholder="Chia sẻ về mục tiêu và các hoạt động thiện nguyện của tổ chức..."></textarea>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <label class="org-label" style="display:block; margin-bottom: 8px;">Loại đồ dùng cần nhận</label>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;" id="chipContainer">
                                <button type="button" class="org-chip">Quần áo</button>
                                <button type="button" class="org-chip">Giày dép</button>
                                <button type="button" class="org-chip">Sách vở</button>
                                <button type="button" class="org-chip">Đồ dùng học tập</button>
                                <button type="button" class="org-chip">Thực phẩm khô</button>
                                <button type="button" class="org-chip">Khác</button>
                            </div>
                        </div>

                        <div style="margin-bottom: 24px;">
                            <label class="org-label">Địa chỉ hoạt động</label>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <input type="text" id="inputAddress" required class="org-input" style="margin-top: 0;" placeholder="Số nhà, tên đường, phường/xã...">
                                <button type="button" id="btnGeocode" class="org-btn-secondary">
                                    <span class="material-symbols-outlined" style="font-size: 18px;">location_searching</span>
                                    Tìm tọa độ
                                </button>
                            </div>
                            <p id="geocodeResult" style="display: none; align-items: center; gap: 4px; color: #10B981; font-size: 12px; margin-top: 8px; font-weight: 500;">
                                <span class="material-symbols-outlined" style="font-size: 14px;">check_circle</span> 
                                Đã lấy tọa độ: <span id="lblCoords"></span>
                            </p>
                        </div>

                        <!-- Giấy tờ xác minh Upload -->
                        <div style="margin-bottom: 24px; margin-top: 24px; border-top: 1px solid var(--outline-variant); padding-top: 24px;">
                            <div style="margin-bottom: 16px;">
                                <h1 style="font-size: 20px; font-weight: 600; color: var(--on-surface); margin-bottom: 4px;">Giấy tờ xác minh</h1>
                                <p style="font-size: 14px; color: var(--on-surface-variant);">Vui lòng cung cấp các giấy tờ cần thiết để đảm bảo tính minh bạch và tin cậy trên nền tảng của chúng tôi.</p>
                            </div>

                            <!-- Information Banner -->
                            <div style="background: rgba(0, 107, 44, 0.1); padding: 16px; border-radius: 12px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 24px;">
                                <span class="material-symbols-outlined" style="color: var(--primary); font-variation-settings: 'FILL' 1;">verified_user</span>
                                <p style="font-size: 14px; color: var(--on-surface); margin: 0; line-height: 1.5;">Thông tin của bạn được mã hóa, bảo mật tuyệt đối và chỉ sử dụng cho mục đích xác thực danh tính tổ chức.</p>
                            </div>

                            <div class="org-verification-grid">
                                <!-- CCCD -->
                                <div class="org-verify-box-wrapper">
                                    <label class="org-verify-label">CCCD Người đại diện <span style="color:var(--error)">*</span></label>
                                    <div class="org-verify-box">
                                        <span class="material-symbols-outlined org-verify-icon">add_a_photo</span>
                                        <span class="org-verify-desc">Tải lên mặt trước & mặt sau</span>
                                        <span class="org-verify-box-count" style="display:none">0 ảnh</span>
                                        <input type="file" class="org-verify-input" accept="image/jpeg, image/png, image/webp" multiple>
                                    </div>
                                </div>
                                <!-- Giấy phép -->
                                <div class="org-verify-box-wrapper">
                                    <label class="org-verify-label">Giấy phép hoạt động <span style="color:var(--error)">*</span></label>
                                    <div class="org-verify-box">
                                        <span class="material-symbols-outlined org-verify-icon">description</span>
                                        <span class="org-verify-desc">File PDF hoặc ảnh chụp rõ nét</span>
                                        <span class="org-verify-box-count" style="display:none">0 ảnh</span>
                                        <input type="file" class="org-verify-input" accept="image/jpeg, image/png, image/webp" multiple>
                                    </div>
                                </div>
                                <!-- Trụ sở -->
                                <div class="org-verify-box-wrapper">
                                    <label class="org-verify-label">Ảnh trụ sở <span style="color:var(--on-surface-variant); font-weight:normal">(Tùy chọn)</span></label>
                                    <div class="org-verify-box">
                                        <span class="material-symbols-outlined org-verify-icon">home_work</span>
                                        <span class="org-verify-desc">Ảnh bảng hiệu, mặt tiền</span>
                                        <span class="org-verify-box-count" style="display:none">0 ảnh</span>
                                        <input type="file" class="org-verify-input" accept="image/jpeg, image/png, image/webp" multiple>
                                    </div>
                                </div>
                                <!-- Hoạt động -->
                                <div class="org-verify-box-wrapper">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                        <label class="org-verify-label" style="margin-bottom: 0;">Ảnh hoạt động <span style="color:var(--on-surface-variant); font-weight:normal">(Tùy chọn)</span></label>
                                        <span style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; font-size: 10px; padding: 2px 6px; border-radius: 9999px; font-weight: bold; text-transform: uppercase;">Khuyến nghị</span>
                                    </div>
                                    <div class="org-verify-box">
                                        <span class="material-symbols-outlined org-verify-icon">volunteer_activism</span>
                                        <span class="org-verify-desc">Ảnh các chương trình đã thực hiện</span>
                                        <span class="org-verify-box-count" style="display:none">0 ảnh</span>
                                        <input type="file" class="org-verify-input" accept="image/jpeg, image/png, image/webp" multiple>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Preview Container -->
                            <div id="previewContainer" style="display: none; margin-top: 24px; padding: 16px; background: var(--surface-container-lowest); border: 1px solid var(--outline-variant); border-radius: 12px;">
                                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--on-surface);">Đã tải lên</h3>
                                <div class="org-docs-grid" id="docsGrid"></div>
                            </div>
                        </div>

                        <div style="border-top: 1px solid var(--outline-variant); margin-top: 32px; padding-top: 24px; display: flex; justify-content: flex-end;">
                            <button type="submit" id="btnNext3" class="org-btn-primary">
                                Tiếp theo
                                <span class="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- PHASE 4: Xác nhận nộp hồ sơ -->
                <div id="phase4" class="phase-section phase-hidden">
                    <header style="margin-bottom: 24px;">
                        <h2 style="font-size: 24px; font-weight: 700; color: var(--on-surface);">Xác nhận nộp hồ sơ</h2>
                        <p style="color: var(--on-surface-variant); font-size: 14px; margin-top: 4px;">Vui lòng kiểm tra lại thông tin và xác nhận trước khi gửi yêu cầu xét duyệt.</p>
                    </header>
                    
                    <form id="formPhase4">
                        <div style="display: flex; flex-direction: column; gap: 24px; margin-bottom: 32px;">
                            
                            <!-- Bảng tóm tắt thông tin -->
                            <div style="background: var(--surface-container-lowest); padding: 24px; border-radius: 12px; border: 1px solid var(--outline-variant);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                                    <h3 style="font-size: 18px; font-weight: 600; color: var(--on-surface);">Kiểm tra thông tin</h3>
                                    <button type="button" onclick="document.querySelectorAll('.phase-section').forEach((el, index) => { if(index+1===3) { el.classList.remove('phase-hidden'); el.classList.add('phase-active'); } else { el.classList.add('phase-hidden'); el.classList.remove('phase-active'); } });" style="display: flex; align-items: center; gap: 4px; color: var(--primary); font-size: 14px; font-weight: 600; background: none; border: none; cursor: pointer;">
                                        <span class="material-symbols-outlined" style="font-size: 18px;">edit</span> Chỉnh sửa
                                    </button>
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
                                    <div style="display: flex; gap: 16px;">
                                        <div style="width: 64px; height: 64px; border-radius: 8px; overflow: hidden; background: var(--surface-container); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                                            <img id="confirmLogoMain" style="width: 100%; height: 100%; object-fit: cover; display: none;" src="" />
                                            <span id="confirmLogoInitials" style="font-size: 20px; color: var(--primary); font-weight: bold;">LC</span>
                                        </div>
                                        <div>
                                            <h4 id="confirmName" style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Hợp tác xã Tái chế Xanh</h4>
                                            <div id="confirmChips" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
                                        </div>
                                    </div>
                                    
                                    <div style="background: var(--surface-container-low); padding: 16px; border-radius: 8px; display: flex; flex-direction: column; gap: 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px; color: var(--on-surface);">
                                            <span class="material-symbols-outlined text-primary" style="font-size: 20px;">location_on</span>
                                            <span id="confirmAddress" style="font-size: 14px;"></span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px; color: var(--on-surface);">
                                            <span class="material-symbols-outlined text-primary" style="font-size: 20px;">mail</span>
                                            <span id="confirmEmail" style="font-size: 14px;"></span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px; color: var(--on-surface);">
                                            <span class="material-symbols-outlined text-primary" style="font-size: 20px;">phone</span>
                                            <span id="confirmPhone" style="font-size: 14px;"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Verification Docs -->
                            <div style="background: var(--surface-container-lowest); padding: 24px; border-radius: 12px; border: 1px solid var(--outline-variant);">
                                <h3 style="font-size: 18px; font-weight: 600; color: var(--on-surface); margin-bottom: 16px;">Giấy tờ xác minh</h3>
                                <div id="confirmDocsGrid" style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>
                            
                            <!-- Submit Card -->
                            <div style="background: var(--surface-container-highest); padding: 24px; border-radius: 12px; border-top: 4px solid var(--primary); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                                <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer; margin-bottom: 24px;">
                                    <input type="checkbox" id="commitmentCheckbox" style="margin-top: 4px; width: 20px; height: 20px; accent-color: var(--primary);">
                                    <span style="font-size: 14px; color: var(--on-surface-variant); line-height: 1.5;">Tôi cam kết thông tin cung cấp là chính xác và tổ chức hoạt động hợp pháp theo quy định của pháp luật Việt Nam.</span>
                                </label>
                                
                                <button type="submit" id="btnSubmitFinal" disabled class="org-btn-primary" style="width: 100%; justify-content: center; opacity: 0.5; transition: all 0.3s;">
                                    Gửi yêu cầu xét duyệt
                                    <span class="material-symbols-outlined">send</span>
                                </button>
                                <p style="text-align: center; font-size: 12px; color: var(--on-surface-variant); margin-top: 16px;">Thời gian xét duyệt dự kiến: 24h - 48h làm việc.</p>
                            </div>

                            <!-- Guidance -->
                            <div style="background: var(--surface-container-low); padding: 16px; border-radius: 12px; border: 1px solid rgba(121, 116, 126, 0.3);">
                                <div style="display: flex; align-items: center; gap: 8px; color: #D97706; margin-bottom: 8px;">
                                    <span class="material-symbols-outlined" style="font-size: 20px;">info</span>
                                    <h4 style="font-size: 14px; font-weight: 600;">Lưu ý quan trọng</h4>
                                </div>
                                <ul style="font-size: 14px; color: var(--on-surface-variant); padding-left: 20px; list-style-type: disc; display: flex; flex-direction: column; gap: 8px;">
                                    <li>Hồ sơ sau khi gửi sẽ không thể chỉnh sửa cho đến khi có kết quả xét duyệt.</li>
                                    <li>Thông tin sẽ được bảo mật theo Chính sách Quyền riêng tư của hệ thống.</li>
                                </ul>
                            </div>
                        </div>
                    </form>
                </div>

            </section>

            <!-- Right Column: Live Preview (40%) -->
            <aside class="org-preview-panel">
                <div class="org-preview-wrapper">
                    <h2 style="font-size: 14px; font-weight: 600; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>
                        Xem trước hồ sơ
                    </h2>
                    
                    <div class="org-preview-card">
                        <div style="height: 128px; background: rgba(0, 107, 44, 0.1); display: flex; align-items: center; justify-content: center;">
                            <span class="material-symbols-outlined" style="color: rgba(0, 107, 44, 0.3); font-size: 40px;">volunteer_activism</span>
                        </div>
                        <div style="padding: 24px; margin-top: -48px; position: relative;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid white; background: var(--surface); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
                                <img id="previewLogoMain" style="width: 100%; height: 100%; object-fit: cover; display: none;" src=""/>
                                <span id="previewLogoInitials" style="font-size: 24px; color: var(--primary); font-weight: bold;">LC</span>
                            </div>
                            <h3 id="previewName" style="font-size: 20px; font-weight: 600; margin-bottom: 4px; color: var(--on-surface);">Tên tổ chức của bạn</h3>
                            <div style="display: flex; align-items: center; gap: 4px; color: var(--on-surface-variant); margin-bottom: 16px;">
                                <span class="material-symbols-outlined" style="font-size: 16px;">location_on</span>
                                <span style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="previewAddress">Địa chỉ của tổ chức</span>
                            </div>
                            <p id="previewDesc" style="font-size: 16px; color: var(--on-surface-variant); margin-bottom: 24px; font-style: italic; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                "Phần mô tả về mục tiêu và sứ mệnh cao cả của tổ chức bạn sẽ xuất hiện tại đây..."
                            </p>
                            
                            <div style="margin-bottom: 8px;">
                                <h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--on-surface); margin-bottom: 8px;">Đồ dùng nhận hỗ trợ</h4>
                                <div id="previewChips" style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    <span style="background: var(--surface-container); color: var(--on-surface-variant); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">Chưa chọn</span>
                                </div>
                            </div>
                            
                            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--outline-variant); display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; margin-left: 8px;">
                                    <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; background: var(--primary-fixed); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; margin-left: -8px;">JD</div>
                                    <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; background: var(--secondary-fixed); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; margin-left: -8px;">MT</div>
                                    <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; background: var(--tertiary-fixed); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; margin-left: -8px;">3+</div>
                                </div>
                                <button type="button" style="color: var(--primary); font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 4px; background: none; border: none; cursor: pointer;">
                                    Xem chi tiết
                                    <span class="material-symbols-outlined" style="font-size: 16px;">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </main>
  `;

  // --- Logic state ---
  let currentStep = 1;
  let selectedChips = new Set();
  let currentLat = null;
  let currentLon = null;
  let selectedLogoFile = null;
  let uploadedDocs = [];

  // --- Elements ---
  const inputName = document.getElementById('inputName');
  const inputDesc = document.getElementById('inputDesc');
  const inputAddress = document.getElementById('inputAddress');
  const previewName = document.getElementById('previewName');
  const previewDesc = document.getElementById('previewDesc');
  const previewAddress = document.getElementById('previewAddress');
  const logoInput = document.getElementById('logoInput');
  const logoPreview = document.getElementById('logoPreview');
  const previewLogoMain = document.getElementById('previewLogoMain');
  const previewLogoInitials = document.getElementById('previewLogoInitials');
  const logoPlaceholder = document.getElementById('logoPlaceholder');
  const btnGeocode = document.getElementById('btnGeocode');
  const docsGrid = document.getElementById('docsGrid');

  // --- UI Navigation ---
  function showPhase(stepNumber) {
    document.querySelectorAll('.phase-section').forEach((el, index) => {
        if (index + 1 === stepNumber) {
            el.classList.remove('phase-hidden');
            el.classList.add('phase-active');
        } else {
            el.classList.add('phase-hidden');
            el.classList.remove('phase-active');
        }
    });

    for (let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`stepIndicator${i}`);
        const circle = indicator.querySelector('.org-stepper-circle');
        const text = indicator.querySelector('.org-stepper-text');
        
        // Reset classes
        circle.className = "org-stepper-circle";
        text.className = "org-stepper-text";
        
        if (i < stepNumber) {
            circle.classList.add('completed');
            circle.innerHTML = `<span class="material-symbols-outlined">check</span>`;
            text.classList.add('completed');
        } else if (i === stepNumber) {
            circle.classList.add('active');
            circle.innerHTML = i;
            text.classList.add('active');
        } else {
            circle.classList.add('future');
            circle.innerHTML = i;
            text.classList.add('future');
        }
    }
    currentStep = stepNumber;
  }

  // --- Event Listeners ---

  // Phase 1
  document.getElementById('formPhase1').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnNext1');
      const payload = {
          username: document.getElementById('regUsername').value,
          password: document.getElementById('regPassword').value,
          fullName: document.getElementById('regFullName').value,
          email: document.getElementById('regEmail').value,
          phone: document.getElementById('regPhone').value,
          roleName: 'ORGANIZATION'
      };

      try {
          btn.innerHTML = `Đang xử lý...`;
          btn.disabled = true;

          await registerApi(payload);
          document.getElementById('lblEmailSent').innerText = payload.email;
          showToast("Đăng ký thành công, vui lòng kiểm tra email!", "success");
          showPhase(2);
      } catch (error) {
          showToast(error.message || "Đăng ký thất bại", "error");
      } finally {
          btn.innerHTML = `Tiếp theo <span class="material-symbols-outlined">arrow_forward</span>`;
          btn.disabled = false;
      }
  });

  // Phase 2
  document.getElementById('formPhase2').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btnNext2');
      const email = document.getElementById('regEmail').value;
      const otp = document.getElementById('otpCode').value;

      try {
          btn.innerHTML = `Đang xử lý...`;
          btn.disabled = true;

          // 1. Verify OTP
          await verifyRegisterOtp(email, otp);

          // 2. Login to get token
          await loginApi({
              username: document.getElementById('regUsername').value,
              password: document.getElementById('regPassword').value
          });

          // Pre-fill organization name
          inputName.value = document.getElementById('regFullName').value;
          inputName.dispatchEvent(new Event('input'));
          showToast("Xác thực và đăng nhập thành công!", "success");
          showPhase(3);

      } catch (error) {
          showToast(error.message || "Xác thực OTP thất bại", "error");
      } finally {
          btn.innerHTML = `Xác thực & Đăng nhập <span class="material-symbols-outlined">check_circle</span>`;
          btn.disabled = false;
      }
  });

  // Phase 3 Submit
  document.getElementById('formPhase3').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!currentLat || !currentLon) {
          showToast('Vui lòng nhấn "Tìm tọa độ" để xác định vị trí.', 'error');
          return;
      }

      if (uploadedDocs.length === 0) {
          showToast('Vui lòng tải lên ít nhất 1 giấy tờ xác minh (Hình ảnh).', 'error');
          return;
      }
      
      // Populate Phase 4 UI
      document.getElementById('confirmName').innerText = inputName.value;
      if (selectedLogoFile) {
          const reader = new FileReader();
          reader.onload = function(evt) {
              document.getElementById('confirmLogoMain').src = evt.target.result;
              document.getElementById('confirmLogoMain').style.display = 'block';
              document.getElementById('confirmLogoInitials').style.display = 'none';
          };
          reader.readAsDataURL(selectedLogoFile);
      } else {
          document.getElementById('confirmLogoInitials').innerText = previewLogoInitials.innerText;
          document.getElementById('confirmLogoMain').style.display = 'none';
          document.getElementById('confirmLogoInitials').style.display = 'flex';
      }
      
      document.getElementById('confirmChips').innerHTML = Array.from(selectedChips).map(chip => `
          <span style="background: var(--primary-fixed); color: var(--on-primary-fixed); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500;">${chip}</span>
      `).join('');
      
      document.getElementById('confirmAddress').innerText = inputAddress.value;
      document.getElementById('confirmEmail').innerText = document.getElementById('regEmail').value;
      document.getElementById('confirmPhone').innerText = document.getElementById('regPhone').value;
      
      const confirmDocsGrid = document.getElementById('confirmDocsGrid');
      confirmDocsGrid.innerHTML = uploadedDocs.map(doc => {
          let label = doc.box ? doc.box.querySelector('.org-verify-desc').innerText : 'Tài liệu';
          return `
          <div style="flex-shrink: 0; position: relative; width: 120px; aspect-ratio: 3/4; border-radius: 8px; overflow: hidden; border: 1px solid var(--outline-variant); background: var(--surface-container-high);">
              <img src="${doc.url}" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 4px 8px; background: rgba(0,0,0,0.6); color: white; font-size: 10px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                  ${label}
              </div>
          </div>
          `;
      }).join('');

      showPhase(4);
  });
  
  // Phase 4 Checkbox
  const commitmentCheckbox = document.getElementById('commitmentCheckbox');
  const btnSubmitFinal = document.getElementById('btnSubmitFinal');
  commitmentCheckbox.addEventListener('change', (e) => {
      btnSubmitFinal.disabled = !e.target.checked;
      btnSubmitFinal.style.opacity = e.target.checked ? '1' : '0.5';
  });

  // Phase 4 Submit
  document.getElementById('formPhase4').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
          btnSubmitFinal.innerHTML = `Đang xử lý...`;
          btnSubmitFinal.disabled = true;

          let logoUrl = "";
          if (selectedLogoFile) {
              logoUrl = await uploadImageApi(selectedLogoFile);
          }

          const orgPayload = {
              orgName: inputName.value,
              avtOrg: logoUrl,
              description: inputDesc.value,
              address: inputAddress.value,
              latitude: currentLat,
              longitude: currentLon,
              acceptedTypes: Array.from(selectedChips),
              verificationDocs: uploadedDocs.map(d => d.url), 
              isVerified: false
          };

          await createOrganizationDetailApi(orgPayload);
          
          showToast("Đăng ký hồ sơ Tổ chức thành công!", "success");
          setTimeout(() => {
              window.location.hash = "#/pending-approval";
          }, 1500);

      } catch (error) {
          showToast(error.message || "Lỗi tạo hồ sơ Tổ chức.", "error");
      } finally {
          btnSubmitFinal.innerHTML = `Gửi yêu cầu xét duyệt <span class="material-symbols-outlined">send</span>`;
          btnSubmitFinal.disabled = false;
      }
  });

  // Geocoding
  btnGeocode.addEventListener('click', async () => {
      const addr = inputAddress.value.trim();
      if (!addr) {
          showToast('Vui lòng nhập địa chỉ trước khi tìm tọa độ.', 'error');
          return;
      }
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`);
          const data = await res.json();
          if (data && data.length > 0) {
              currentLat = parseFloat(data[0].lat);
              currentLon = parseFloat(data[0].lon);
              document.getElementById('lblCoords').innerText = `${currentLat.toFixed(5)}, ${currentLon.toFixed(5)}`;
              document.getElementById('geocodeResult').style.display = 'flex';
          } else {
              showToast('Không tìm thấy tọa độ. Vui lòng thử địa chỉ khác.', 'error');
              document.getElementById('geocodeResult').style.display = 'none';
              currentLat = null;
              currentLon = null;
          }
      } catch (err) {
          showToast('Lỗi khi gọi API bản đồ.', 'error');
      }
  });

  // --- Live Preview Logic ---
  inputName.addEventListener('input', (e) => {
      const val = e.target.value;
      previewName.innerText = val || "Tên tổ chức của bạn";
      if (val) {
          const initials = val.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          previewLogoInitials.innerText = initials;
      } else {
          previewLogoInitials.innerText = "LC";
      }
  });

  inputDesc.addEventListener('input', (e) => {
      previewDesc.innerText = e.target.value || '"Phần mô tả về mục tiêu và sứ mệnh cao cả của tổ chức bạn sẽ xuất hiện tại đây..."';
  });

  inputAddress.addEventListener('input', (e) => {
      previewAddress.innerText = e.target.value || "Địa chỉ của tổ chức";
      document.getElementById('geocodeResult').style.display = 'none';
      currentLat = null;
      currentLon = null;
  });

  // Chips Logic
  function updatePreviewChips() {
      const container = document.getElementById('previewChips');
      if (selectedChips.size === 0) {
          container.innerHTML = `<span style="background: var(--surface-container); color: var(--on-surface-variant); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">Chưa chọn</span>`;
          return;
      }
      container.innerHTML = Array.from(selectedChips).map(chip => `
          <span style="background: rgba(0, 107, 44, 0.1); color: var(--primary); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid rgba(0, 107, 44, 0.2);">${chip}</span>
      `).join('');
  }

  const chips = document.querySelectorAll('.org-chip');
  chips.forEach(btn => {
      btn.addEventListener('click', () => {
          const label = btn.innerText;
          if (selectedChips.has(label)) {
              selectedChips.delete(label);
              btn.classList.remove('active');
          } else {
              selectedChips.add(label);
              btn.classList.add('active');
          }
          updatePreviewChips();
      });
  });

  // Image Upload Logic
  document.getElementById('logoUploadBtn').addEventListener('click', () => logoInput.click());
  logoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
          selectedLogoFile = file;
          const reader = new FileReader();
          reader.onload = function(e) {
              logoPreview.src = e.target.result;
              logoPreview.style.display = 'block';
              previewLogoMain.src = e.target.result;
              previewLogoMain.style.display = 'block';
              previewLogoInitials.style.display = 'none';
              logoPlaceholder.style.display = 'none';
          }
          reader.readAsDataURL(file);
      }
  });

  // Docs Upload Logic
  const verifyInputs = document.querySelectorAll('.org-verify-input');
  verifyInputs.forEach(input => {
      input.addEventListener('change', async (e) => {
          const files = Array.from(e.target.files);
          if (!files.length) return;
          
          const box = e.target.closest('.org-verify-box');
          const previewContainer = document.getElementById('previewContainer');
          if (previewContainer) previewContainer.style.display = 'block';
          
          for (const file of files) {
              const tempId = 'doc_' + Date.now() + Math.random().toString(36).substr(2, 5);
              const itemDiv = document.createElement('div');
              itemDiv.className = 'org-doc-item';
              itemDiv.id = tempId;
              itemDiv.innerHTML = `<div class="org-doc-loading">Đang tải...</div>`;
              docsGrid.appendChild(itemDiv);
              
              try {
                  const url = await uploadImageApi(file);
                  
                  // Store box reference in uploadedDocs to update count later
                  uploadedDocs.push({ url, box });
                  
                  // Update global grid
                  itemDiv.innerHTML = `
                      <img src="${url}" alt="Doc">
                      <button type="button" class="org-doc-remove" data-url="${url}">
                          <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
                      </button>
                  `;
                  
                  // Update box UI
                  box.classList.add('has-files');
                  let previewImg = box.querySelector('.org-verify-box-preview');
                  if (!previewImg) {
                      previewImg = document.createElement('img');
                      previewImg.className = 'org-verify-box-preview';
                      box.appendChild(previewImg);
                      box.querySelector('.org-verify-icon').style.display = 'none';
                      box.querySelector('.org-verify-desc').style.display = 'none';
                  }
                  previewImg.src = url;
                  
                  // Update count badge
                  const countBadge = box.querySelector('.org-verify-box-count');
                  const count = uploadedDocs.filter(d => d.box === box).length;
                  countBadge.innerText = count + ' ảnh';
                  countBadge.style.display = 'block';
                  
              } catch (err) {
                  itemDiv.remove();
                  showToast("Lỗi tải ảnh: " + err.message, "error");
              }
          }
          e.target.value = ''; // Reset input
      });
  });
  
  docsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.org-doc-remove');
      if (btn) {
          const url = btn.getAttribute('data-url');
          
          // Find the doc to get its box
          const docItem = uploadedDocs.find(u => u.url === url);
          if (docItem && docItem.box) {
              const box = docItem.box;
              uploadedDocs = uploadedDocs.filter(u => u.url !== url);
              
              // Update count
              const count = uploadedDocs.filter(d => d.box === box).length;
              const countBadge = box.querySelector('.org-verify-box-count');
              if (count > 0) {
                  countBadge.innerText = count + ' ảnh';
                  // Update preview to the last uploaded image for this box
                  const lastImageForBox = uploadedDocs.slice().reverse().find(d => d.box === box);
                  if (lastImageForBox) {
                      box.querySelector('.org-verify-box-preview').src = lastImageForBox.url;
                  }
              } else {
                  countBadge.style.display = 'none';
                  box.classList.remove('has-files');
                  const previewImg = box.querySelector('.org-verify-box-preview');
                  if (previewImg) previewImg.remove();
                  box.querySelector('.org-verify-icon').style.display = 'block';
                  box.querySelector('.org-verify-desc').style.display = 'block';
              }
          } else {
              // Fallback if no box
              uploadedDocs = uploadedDocs.filter(u => u.url !== url);
          }
          
          btn.closest('.org-doc-item').remove();
          
          if (uploadedDocs.length === 0) {
              const previewContainer = document.getElementById('previewContainer');
              if (previewContainer) previewContainer.style.display = 'none';
          }
      }
  });
}
