import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/products.css";
import { getAllProducts, filterProductsApi, searchProductsByKeywordApi } from "../services/product.service.js";
import { getAllCategories } from "../services/staff.service.js";
import { showToast } from "../utils/ui.js";

function formatPrice(price) {
  if (!price && price !== 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();

  // Data states
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]); // array of {id, name}
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [conditions, setConditions] = useState([]); // array of numbers
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [productType, setProductType] = useState(""); // "" or "Món lẻ" or "Kiện đồ"
  const [lifecycles, setLifecycles] = useState([]); // array of numbers
  const [sortBy, setSortBy] = useState("relevant"); // relevant, newest, priceAsc, priceDesc
  
  // UI states
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsData, prodsData] = await Promise.all([
          getAllCategories().catch(() => []),
          getAllProducts()
        ]);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setAllProducts(prodsData || []);
        
        // Parse initial URL params
        const params = new URLSearchParams(location.search || location.hash.split("?")[1] || "");
        const catParam = params.get("category");
        const searchParam = params.get("search");
        
        let initialSearch = "";
        let initialCats = [];

        if (catParam) {
          const matchedCat = (Array.isArray(catsData) ? catsData : []).find(c => 
            c.name?.toLowerCase().includes(catParam.toLowerCase()) || 
            catParam.toLowerCase().includes(c.name?.toLowerCase()) || 
            c.id === catParam
          );
          if (matchedCat) {
            initialCats = [{ id: matchedCat.id, name: matchedCat.name }];
          } else {
            initialCats = [{ id: catParam, name: catParam }]; // fallback
          }
        }
        
        if (searchParam) {
          initialSearch = searchParam.trim();
        }

        setSearchKeyword(initialSearch);
        setSelectedCategories(initialCats);
        
        // We will trigger applyFilters in another effect after state updates
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Only run once on mount

  // Apply filters whenever filter states or allProducts change
  useEffect(() => {
    if (loading) return; // Don't filter while loading initial data
    applyFilters();
  }, [
    loading, allProducts, searchKeyword, selectedCategories, 
    minPrice, maxPrice, conditions, sizes, colors, productType, 
    lifecycles, sortBy
  ]);

  const applyFilters = async () => {
    setLoading(true);
    let baseList = allProducts;
    
    try {
      const hasSidebarFilter = selectedCategories.length > 0 || minPrice !== "" || maxPrice !== "" || 
                               conditions.length > 0 || sizes.length > 0 || colors.length > 0 || 
                               (sortBy && sortBy !== "relevant");

      if (hasSidebarFilter) {
        const firstCat = selectedCategories[0];
        const catParamVal = firstCat ? (firstCat.id || firstCat.name || "") : "";
        const queryParams = {
          category: catParamVal,
          minPrice: minPrice !== "" ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
          condition: conditions[0] !== undefined ? conditions[0] : undefined,
          size: sizes[0] || "",
          color: colors[0] || "",
          sortBy: sortBy !== "relevant" ? sortBy : "newest"
        };
        baseList = await filterProductsApi(queryParams);
      } else if (searchKeyword) {
        baseList = await searchProductsByKeywordApi(searchKeyword);
      }
    } catch (err) {
      console.warn("Backend filter API fallback to local:", err);
      baseList = allProducts;
    }

    // Local filtering
    let filtered = baseList.filter(p => {
      // Category
      if (selectedCategories.length > 0) {
        if (!p.category && !p.categoryId) return false;
        const matchCat = selectedCategories.some(selected => {
          if (!selected) return false;
          const pCatId = String(p.categoryId || "").trim();
          const pCatName = (p.category || "").toLowerCase().trim();
          const selId = String(selected.id || "").trim();
          const selName = (selected.name || "").toLowerCase().trim();
          return (selId && pCatId && selId === pCatId) || 
                 (selName && pCatName && (pCatName.includes(selName) || selName.includes(pCatName)));
        });
        if (!matchCat) return false;
      }

      // Keyword
      if (searchKeyword) {
        const q = searchKeyword.toLowerCase().trim();
        const matchKeyword = (p.title || "").toLowerCase().includes(q) ||
                             (p.description || "").toLowerCase().includes(q) ||
                             (p.brand || "").toLowerCase().includes(q);
        if (!matchKeyword) return false;
      }

      // Price
      const pPrice = p.price || 0;
      if (minPrice !== "" && pPrice < Number(minPrice)) return false;
      if (maxPrice !== "" && pPrice > Number(maxPrice)) return false;

      // Condition
      if (conditions.length > 0 && (!p.condition || !conditions.includes(p.condition))) return false;

      // Size
      if (sizes.length > 0 && (!p.size || !sizes.includes(p.size))) return false;

      // Color
      if (colors.length > 0 && (!p.color || !colors.includes(p.color))) return false;

      // Type
      if (productType && p.type !== productType) return false;

      // Lifecycle
      if (lifecycles.length > 0 && (!p.lifecycle_generation || !lifecycles.includes(p.lifecycle_generation))) return false;

      return true;
    });

    // Sorting
    if (sortBy === "priceAsc") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "priceDesc") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setFilteredProducts(filtered);
    setLoading(false);
  };

  const handleClearAll = () => {
    setSearchKeyword("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setConditions([]);
    setSizes([]);
    setColors([]);
    setProductType("");
    setLifecycles([]);
    if (location.search || location.hash.includes("?")) {
      navigate("/products", { replace: true });
    }
  };

  const removeFilter = (type, val) => {
    switch(type) {
      case 'keyword': 
        setSearchKeyword("");
        if (location.search || location.hash.includes("?")) navigate("/products", { replace: true });
        break;
      case 'category':
        setSelectedCategories(prev => prev.filter(c => c.id !== val && c.name !== val));
        break;
      case 'price':
        setMinPrice("");
        setMaxPrice("");
        break;
      case 'condition':
        setConditions(prev => prev.filter(c => c !== val));
        break;
      case 'size':
        setSizes(prev => prev.filter(s => s !== val));
        break;
      case 'color':
        setColors(prev => prev.filter(c => c !== val));
        break;
      case 'type':
        setProductType("");
        break;
      case 'lifecycle':
        setLifecycles(prev => prev.filter(l => l !== val));
        break;
      default: break;
    }
  };

  const toggleArrayItem = (setter, item) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      const exists = prev.some(c => c.id === cat.id || c.name === cat.name);
      if (exists) return prev.filter(c => c.id !== cat.id && c.name !== cat.name);
      return [...prev, { id: cat.id, name: cat.name }];
    });
  };

  const renderActiveTags = () => {
    const tags = [];
    if (searchKeyword) {
      tags.push({ type: 'keyword', val: searchKeyword, label: `Từ khóa: "${searchKeyword}"` });
    }
    selectedCategories.forEach(c => {
      tags.push({ type: 'category', val: c.id || c.name, label: `Danh mục: ${c.name || c.id}` });
    });
    if (minPrice !== "" || maxPrice !== "") {
      const min = minPrice || 0;
      const max = maxPrice ? formatPrice(maxPrice) : 'Trở lên';
      tags.push({ type: 'price', val: 'price', label: `Giá: ${formatPrice(min)} - ${max}` });
    }
    conditions.forEach(c => tags.push({ type: 'condition', val: c, label: `Tình trạng: ${c} sao` }));
    sizes.forEach(s => tags.push({ type: 'size', val: s, label: `Size: ${s}` }));
    colors.forEach(c => tags.push({ type: 'color', val: c, label: `Màu: ${c}` }));
    if (productType) tags.push({ type: 'type', val: productType, label: `Loại: ${productType}` });
    lifecycles.forEach(l => tags.push({ type: 'lifecycle', val: l, label: `Thế hệ: F${l}` }));

    return tags.map((t, idx) => (
      <div key={idx} className="filter-tag">
        {t.label} 
        <span className="material-symbols-outlined tag-close" onClick={() => removeFilter(t.type, t.val)}>close</span>
      </div>
    ));
  };

  const renderProductCard = (product) => {
    const imageUrl = product.images && product.images.length > 0
      ? product.images[0]
      : "https://placehold.co/400x533/E4EBE4/6E7B6C?text=No+Image";
    const price = product.price || 0;
    const originalPrice = price ? price * 1.3 : null;
    const sellerInitial = (product.sellerName || "S")[0].toUpperCase();
    const category = product.category || "Khác";
    const size = product.size || "Free Size";
    const isPremium = product.lifecycle_generation === 1 || product.condition === 5;

    return (
      <Link to={`/product/${product.id}`} key={product.id} className="product-card group">
        <div className="product-card__image-container">
          <img src={imageUrl} alt={product.title} className="product-card__image" loading="lazy" />
          <button className="product-card__favorite" aria-label="Add to favorites" onClick={(e) => { e.preventDefault(); showToast('Tính năng yêu thích đang được phát triển', 'info'); }}>
            <span className="material-symbols-outlined">favorite</span>
          </button>
          {isPremium && <div className="product-card__premium-badge">Đồ tuyển</div>}
        </div>
        <div className="product-card__content">
          <span className="product-card__category-size">{category} • Size {size}</span>
          <h3 className="product-card__title">{product.title || "Sản phẩm không có tên"}</h3>
          <div className="product-card__price-wrapper">
            <span className="product-card__price">{formatPrice(price)}</span>
            {originalPrice && <span className="product-card__price-original">{formatPrice(originalPrice)}</span>}
          </div>
          <div className="product-card__seller">
            <div className="product-card__seller-avatar">{sellerInitial}</div>
            <span className="product-card__seller-name">{product.sellerName || "Người bán ẩn danh"}</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="products-layout">
      {/* Sidebar Filter */}
      <aside className="products-sidebar">
        <div className="sidebar-header">
          <h2>Bộ lọc</h2>
          <button className="btn-clear-all" onClick={handleClearAll}>Xóa tất cả</button>
        </div>

        {/* Category Tree */}
        <div className="filter-section">
          <span className="filter-title">Danh mục Sản phẩm</span>
          <ul className="category-list">
            <li className={`category-item category-parent ${selectedCategories.length === 0 ? 'active' : ''}`} onClick={() => setSelectedCategories([])}>
              <span>Tất cả danh mục</span>
              <span className="material-symbols-outlined icon-sm">expand_more</span>
            </li>
            {categories.map(cat => {
              const isActive = selectedCategories.some(c => c.id === cat.id || c.name === cat.name);
              return (
                <li 
                  key={cat.id || cat.name} 
                  className="category-item category-child" 
                  style={isActive ? { fontWeight: '600', color: 'var(--primary)' } : {}}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat.name || 'Không tên'}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Price Range */}
        <div className="filter-section">
          <span className="filter-title">Khoảng giá (VNĐ)</span>
          <div className="price-slider-container">
            <input 
              type="range" 
              className="price-range" 
              min="0" max="5000000" step="50000" 
              value={minPrice || 0}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <div className="price-labels">
              <span>0đ</span>
              <span>5.000.000đ+</span>
            </div>
          </div>
          <div className="price-inputs">
            <input type="number" placeholder="Từ" className="input-price input-price-min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <span className="price-separator">—</span>
            <input type="number" placeholder="Đến" className="input-price input-price-max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
        </div>

        {/* Condition Rating */}
        <div className="filter-section">
          <span className="filter-title">Tình trạng đồ</span>
          <div className="condition-list">
            {[
              { val: 5, label: "Mới tinh (5 sao)", stars: 5 },
              { val: 4, label: "Rất tốt (4 sao)", stars: 4 },
              { val: 3, label: "Tốt (3 sao)", stars: 3 }
            ].map(c => (
              <label key={c.val} className="checkbox-label">
                <input 
                  type="checkbox" 
                  className="checkbox-input" 
                  checked={conditions.includes(c.val)}
                  onChange={() => toggleArrayItem(setConditions, c.val)}
                />
                <div className="star-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined ${i < c.stars ? 'filled' : 'unfilled'}`}>star</span>
                  ))}
                </div>
                <span className="checkbox-text">{c.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Size Chips */}
        <div className="filter-section">
          <span className="filter-title">Kích cỡ</span>
          <div className="size-chips">
            {["S", "M", "L", "XL", "XXL"].map(size => (
              <button 
                key={size} 
                className={`chip-size ${sizes.includes(size) ? 'active' : ''}`}
                onClick={() => toggleArrayItem(setSizes, size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="filter-section">
          <span className="filter-title">Màu sắc</span>
          <div className="color-chips">
            {[
              { name: 'Đen', cls: 'color-black' },
              { name: 'Trắng', cls: 'color-white' },
              { name: 'Xanh dương', cls: 'color-blue' },
              { name: 'Đỏ', cls: 'color-red' },
              { name: 'Cam', cls: 'color-amber' },
              { name: 'Xanh lá', cls: 'color-emerald' }
            ].map(color => (
              <button 
                key={color.name}
                className={`chip-color ${color.cls} ${colors.includes(color.name) ? 'active' : ''}`}
                onClick={() => toggleArrayItem(setColors, color.name)}
                title={color.name}
              ></button>
            ))}
          </div>
        </div>

        {/* Type Selection */}
        <div className="filter-section">
          <span className="filter-title">Hình thức</span>
          <div className="type-list">
            <label className="radio-label">
              <input type="radio" name="product_type" className="radio-input" value="Món lẻ" checked={productType === "Món lẻ"} onChange={() => setProductType("Món lẻ")} />
              <span className="radio-text">Món lẻ</span>
            </label>
            <label className="radio-label">
              <input type="radio" name="product_type" className="radio-input" value="Kiện đồ" checked={productType === "Kiện đồ"} onChange={() => setProductType("Kiện đồ")} />
              <span className="radio-text">Kiện đồ (Bundle)</span>
            </label>
          </div>
        </div>

        {/* Lifecycle Generation Selection */}
        <div className="filter-section">
          <span className="filter-title">Thế hệ vòng đời</span>
          <div className="lifecycle-list">
            {[
              { val: 1, label: "Thế hệ 1 (F1)" },
              { val: 2, label: "Thế hệ 2 (F2)" },
              { val: 3, label: "Thế hệ 3+ (F3+)" }
            ].map(l => (
              <label key={l.val} className="checkbox-label">
                <input 
                  type="checkbox" 
                  className="checkbox-input lifecycle-input" 
                  checked={lifecycles.includes(l.val)}
                  onChange={() => toggleArrayItem(setLifecycles, l.val)}
                />
                <span className="checkbox-text">{l.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="filter-actions">
          <button className="btn-primary btn-apply-filters" onClick={applyFilters}>Áp dụng bộ lọc</button>
          <button className="btn-outline btn-clear-all" onClick={handleClearAll}>Thiết lập lại</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="products-main">
        {/* Sort & View Controls */}
        <div className="products-controls">
          <div className="controls-header">
            <div className="controls-info">
              <h1>Sản phẩm</h1>
              <p className="results-count">
                {error ? "Lỗi kết nối" : (loading ? "Đang tải..." : `Tìm thấy ${filteredProducts.length} sản phẩm`)}
              </p>
            </div>
            <div className="controls-actions">
              <div className="sort-control">
                <span>Sắp xếp:</span>
                <select className="select-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="relevant">Phù hợp nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá thấp đến cao</option>
                  <option value="priceDesc">Giá cao đến thấp</option>
                </select>
              </div>
              <div className="view-toggles">
                <button className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button className={`btn-view ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                  <span className="material-symbols-outlined">view_list</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Active Filter Chips */}
          <div className="active-filters">
            {renderActiveTags()}
          </div>
        </div>

        {/* Product Grid */}
        <div className={`products-grid ${error ? 'products-grid-error' : ''}`} style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : {}}>
          {error ? (
            <div className="products-error">
              <h3>Đã xảy ra lỗi</h3>
              <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
            </div>
          ) : loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image-container"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line price"></div>
                </div>
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(renderProductCard)
          ) : (
            <div className="products-empty">
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Hãy thử thay đổi hoặc xóa bớt các tiêu chí lọc nhé!</p>
            </div>
          )}
        </div>
        
        {/* Pagination (placeholder like original) */}
        <nav className="pagination" id="products-pagination">
        </nav>
      </section>
      
      {/* FAB for adding items */}
      <Link to="/create-listing" className="fab-add">
        <span className="material-symbols-outlined">add</span>
        <span className="fab-tooltip">Đăng tin mới</span>
      </Link>
    </div>
  );
}
