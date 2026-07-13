import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { 
  Shirt, PackageCheck, CalendarDays, ShieldCheck,
  Search, Calendar, User, Clock, ChevronRight, Tag, BookOpen, ArrowRight, 
  Share2, Heart, MessageSquare, ArrowLeft, Send, Facebook, Twitter, Link2, 
  CheckCircle, Plus, Edit2, Trash2, Eye, ThumbsUp, X, Filter, BarChart2, 
  Users, AlertCircle, RefreshCw, LayoutGrid, List, Package, CreditCard, ShoppingBag, Truck
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/common/Header";
import { getPublishedBlogsApi } from "../../services/blog.service";
import { API_BASE_URL } from "../../config/env";
import "../../style/pages/HomePage.css";
import "../../style/pages/BlogPage.css";
import logo from "../../assets/logo/logo.png";
import banner1 from "../../assets/banner/banner 1.png";
import banner2 from "../../assets/banner/banner2 (1).png";
import banner3 from "../../assets/banner/banner3.png";
import { CONTACT_LINKS, UI_IMAGE_FALLBACKS } from "../../constants/ui";
import { normalizeImageUrl } from "../../utils/imageUrl";
const I18N = {
  vi: {
    "brand.name": "FITFLOW",
    "meta.title": "FITFLOW – Thuê & Mua Dụng cụ thể thao",
    "meta.desc":
      "FITFLOW chuyên thuê & mua đồ thể thao: đồ thể thao, Vợt Tennis, Vợt Pickleball, phụ kiện thể thao, combo chụp ảnh, đặt lịch thử vợt/sân.",
    "header.hotline": "Hotline",
    "header.cart": "Gi\u1ecf h\u00e0ng",
    "header.login": "\u0110\u0103ng nh\u1eadp",

    "nav.rent": "Thuê sản phẩm",
    "nav.buy": "Mua sản phẩm",
    "nav.booking": "Đặt lịch thuê",
    "nav.packages": "Combo thể thao",
    "nav.blog": "Blog / Cẩm nang",
    "nav.contact": "Liên hệ",

    "search.placeholder": "Tìm sản phẩm...",
    "cta.bookNow": "ĐẶT LỊCH NGAY",

    "hero.badge": "Đồ thể thao",
    "hero.h1_1": "Thuê đồ thể thao – mặc đẹp trong 5 phút",
    "hero.sub_1":
      "Có sẵn phụ kiện thể thao • Hỗ trợ tư vấn size • Đặt lịch online",
    "hero.h1_2": "Combo gia đình – đủ size, đủ phụ kiện thể thao",
    "hero.sub_2":
      "Tư vấn dụng cụ theo nhóm • Vận động thoải mái • Phù hợp mọi lứa tuổi",
    "hero.h1_3": "Mua sản phẩm – có sẵn & may theo số đo",
    "hero.sub_3": "Chất liệu thoải mái • Form tôn dáng • Giao hàng nhanh",
    "hero.btn_rent": "Thuê ngay",
    "hero.btn_view": "Xem danh mục",
    "hero.btn_packages": "Xem combo",
    "hero.btn_booking": "Đặt lịch",
    "hero.btn_buy": "Mua ngay",
    "hero.btn_contact": "Liên hệ tư vấn",
    "hero.panel_title": "Điểm nổi bật",
    "hero.panel_1": "Set đồ sẵn – đến là mặc",
    "hero.panel_2": "Nhiều size – hỗ trợ đổi size",
    "hero.panel_3": "Combo thể thao – dụng cụ & phụ kiện đầy đủ",

    "policy.title": "Nguyên tắc thuê & mua tại FITFLOW",
    "policy.sub": "Minh bạch – rõ ràng – thân thiện với du khách",
    "policy.c1.t": "Đặt cọc 50% để giữ đồ",
    "policy.c1.d": "Đặt online để giữ lịch & set sản phẩm theo yêu cầu.",
    "policy.c2.t": "Nhận đồ thanh toán phần còn lại",
    "policy.c2.d": "Thanh toán 50% còn lại khi pick-up.",
    "policy.c3.t": "Thế chân linh hoạt",
    "policy.c3.d": "CCCD/GPLX/Cavet hoặc tiền thế chân theo quy định.",
    "policy.c4.t": "Trễ hạn có phụ thu",
    "policy.c4.d": "Trễ ≥ 3 ngày tính phí theo quy định.",
    "policy.c5.t": "Hư/mất cần bồi thường",
    "policy.c5.d": "Theo mức độ & giá trị sản phẩm.",
    "policy.c6.t": "Hỗ trợ đổi size",
    "policy.c6.d": "Đổi theo kho còn, ưu tiên khách đặt lịch.",

    "cat.title": "Danh mục nổi bật",
    "cat.sub":
      "Chọn nhanh dụng cụ phù hợp để chơi thể thao – đơn giản & chất lượng.",
    "cat.t1": "Đồ thể thao nữ",
    "cat.t2": "Vợt Tennis / Vợt Pickleball",
    "cat.t3": "Combo đôi / gia đình",
    "cat.cta": "Xem thêm",

    "rent.title": "Đồ thể thao được yêu thích",
    "rent.more": "Xem tất cả",
    "rent.p1.n": "Đồ thể thao cao cấp (Full set)",
    "rent.p1.m": "Giá thuê theo ngày • Size S–XL",
    "rent.p2.n": "Vợt Tennis (Kèm phụ kiện thể thao)",
    "rent.p2.m": "Set chơi thể thao • Tư vấn dụng cụ",
    "rent.p3.n": "Vợt Pickleball (Sang trọng)",
    "rent.p3.m": "Phù hợp thi đấu chuyên nghiệp",
    "rent.p4.n": "Đồ thể thao nam",
    "rent.p4.m": "Gọn gàng • Thoáng mát • Dễ vận động",

    "buy.title": "DỤNG CỤ THỂ THAO CHO THUÊ & BÁN",
    "buy.more": "Xem tất cả",
    "buy.p1.n": "Đồ thể thao may sẵn",
    "buy.p1.m": "Chất liệu nhẹ • Form tôn dáng",
    "buy.p2.n": "Vợt Tennis may đo",
    "buy.p2.m": "Tư vấn số đo • Hoàn thiện chuẩn",
    "buy.p3.n": "Phụ kiện thể thao",
    "buy.p3.m": "Balo • Băng đô • Vớ • Băng gối",
    "buy.p4.n": "Set đôi / gia đình",
    "buy.p4.m": "Nhiều lựa chọn màu sắc",

    "btn.rent": "Thuê",
    "btn.buy": "Mua",
    "btn.detail": "Xem chi tiết",

    "booking.title": "Đặt lịch thuê trước khi đến cửa hàng",
    "booking.sub":
      "Chọn khung giờ – chọn dụng cụ – đến là chơi ngay. Nhân viên hỗ trợ tư vấn phụ kiện thể thao.",
    "booking.guests": "Số người",
    "booking.btn": "Đặt lịch",

    "packages.title": "Combo thể thao",
    "packages.sub":
      "Chọn combo phù hợp để tiết kiệm chi phí & sẵn sàng thi đấu.",
    "packages.c1.t": "Thuê vợt + phụ kiện",
    "packages.c1.b1": "Đầy đủ dụng cụ cơ bản",
    "packages.c1.b2": "Tư vấn trang bị chuyên dụng",
    "packages.c1.b3": "Nhận đồ nhanh – gọn",
    "packages.c2.t": "Thuê vợt + bóng/cầu",
    "packages.c2.b1": "Kèm bóng/cầu thi đấu chuẩn",
    "packages.c2.b2": "Phù hợp tập luyện & thi đấu",
    "packages.c2.b3": "Tiết kiệm thời gian chuẩn bị",
    "packages.c3.t": "Gói tập luyện nhóm",
    "packages.c3.b1": "Trang bị đầy đủ cho nhiều người",
    "packages.c3.b2": "Hỗ trợ thay thế linh hoạt",
    "packages.c3.b3": "Tối ưu chi phí cho đội nhóm",

    "reviews.title": "Khách hàng nói gì về FITFLOW",
    "reviews.sub": "Phản hồi tiêu biểu từ những người yêu thể thao.",
    "reviews.r1":
      "“Đến là có đủ dụng cụ, tư vấn size chuẩn xác. Đồ rất mới và chất lượng!”",
    "reviews.r2":
      "“Nhân viên nhiệt tình, hỗ trợ chọn vợt phù hợp với lối đánh.”",
    "reviews.r3": "“Gói nhóm rất tiện, tiết kiệm chi phí cho cả team.”",

    "blog.title": "Blog & Cẩm nang thể thao",
    "blog.sub": "Mẹo chọn dụng cụ thể thao, bảng size và tin tức giải đấu.",
    "blog.p1.t": "Bí quyết chọn vợt Pickleball cho người mới",
    "blog.p1.d": "Các tiêu chí trọng lượng, mặt vợt phù hợp với lối đánh.",
    "blog.p2.t": "Bảng size chuẩn – chọn đồ thể thao không lo lệch",
    "blog.p2.d": "Hướng dẫn đo cơ bản để đặt mua trang phục chuẩn form.",
    "blog.p3.t": "Luật thi đấu Pickleball & Tennis cơ bản cần biết",
    "blog.p3.d": "Những quy tắc nền tảng để bạn tự tin lên sân.",

    "contact.title": "Liên hệ",
    "contact.sub":
      "Gọi hoặc nhắn Zalo để được tư vấn dụng cụ & lịch chụp phù hợp.",

    "footer.about":
      "Bởi vì ăn mặc là một cách sống. Thuê & mua đồ thể thao – nhanh, đẹp, thân thiện.",
    "footer.col1": "Danh mục",
    "footer.col2": "Chính sách",
    "footer.col3": "Liên hệ",
    "footer.addr": "Thanh Xuân, Hà Nội",
    "footer.phone": "Hotline:",
  },
};

function t(lang, key) {
  return I18N[lang] && I18N[lang][key] ? I18N[lang][key] : key;
}

const year = new Date().getFullYear();
const AUTO_SLIDE_MS = 5000;
const CATEGORY_SLIDE_MS = 2800;
const HOMEPAGE_PRODUCT_LIMIT = 8;
const SHOW_LEGACY_HEADER = false;
const CONTACT_INFO = {
  phoneDisplay: "0936295902",
  phoneHref: "tel:0936295902",
  zaloHref: CONTACT_LINKS.zaloHref,
  addressDisplay: "Thanh Xuân, Hà Nội",
  mapHref: CONTACT_LINKS.mapHref,
  instagramLabel: "@fitflow_movewithmotion",
  instagramHref: CONTACT_LINKS.instagramHref,
};

const toApiUrl = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const parseJsonSafe = async (response) => {
  const contentType = String(
    response.headers.get("content-type") || "",
  ).toLowerCase();
  if (!contentType.includes("application/json")) {
    const bodyText = await response.text();
    throw new Error(
      `Expected JSON but received ${contentType || "unknown"}: ${bodyText.slice(0, 80)}`,
    );
  }
  return response.json();
};

const Homepage = ({ initialSection = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const lang = "vi";
  const setLang = () => { };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection || "home");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [topRentProducts, setTopRentProducts] = useState([]);
  const [topRentLoading, setTopRentLoading] = useState(true);
  const [buyProducts, setBuyProducts] = useState([]);
  const [buyLoading, setBuyLoading] = useState(true);
  const [fittingProducts, setFittingProducts] = useState([]);
  const [fittingLoading, setFittingLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState("");
  const [categorySlideIndex, setCategorySlideIndex] = useState(0);
  const [categoryVisibleCount, setCategoryVisibleCount] = useState(3);
  const featuredCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter((category) => Number(category?.count) > 0);
  }, [categories]);
  const slideIntervalRef = useRef(null);
  const categorySlideIntervalRef = useRef(null);
  const accountMenuRef = useRef(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Banners từ file local - dùng useMemo để cập nhật khi lang thay đổi
  const heroBanners = useMemo(
    () => [
      {
        _id: "banner1",
        title: t(lang, "hero.h1_1"),
        subtitle: t(lang, "hero.sub_1"),
        imageUrl: banner1,
        targetLink: "#rent",
      },

      {
        _id: "banner3",
        title: t(lang, "hero.h1_3"),
        subtitle: t(lang, "hero.sub_3"),
        imageUrl: banner3,
        targetLink: "#buy",
      },
    ],
    [lang],
  );

  const stopAutoSlide = useCallback(() => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (heroBanners.length === 0) return 0;
      return (prev + 1) % heroBanners.length;
    });
  }, [heroBanners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (heroBanners.length === 0) return 0;
      return (prev - 1 + heroBanners.length) % heroBanners.length;
    });
  }, [heroBanners.length]);

  const goToSlide = useCallback(
    (index) => {
      if (heroBanners.length === 0) return;
      const normalized = (index + heroBanners.length) % heroBanners.length;
      setCurrentSlide(normalized);
    },
    [heroBanners.length],
  );

  const restartAutoSlide = useCallback(() => {
    stopAutoSlide();
    if (isSliderPaused || heroBanners.length <= 1) return;
    slideIntervalRef.current = setInterval(nextSlide, AUTO_SLIDE_MS);
  }, [heroBanners.length, isSliderPaused, nextSlide, stopAutoSlide]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lang", lang);
      }

      document.title = t(lang, "meta.title");
      const desc = document.querySelector('meta[name="description"]');
      if (desc) {
        desc.setAttribute("content", t(lang, "meta.desc"));
      }
    }
  }, [lang]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [heroBanners.length, lang]);

  useEffect(() => {
    restartAutoSlide();
    return stopAutoSlide;
  }, [restartAutoSlide, stopAutoSlide]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => {
      setIsSliderPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateCategoryVisibleCount = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setCategoryVisibleCount(1);
        return;
      }
      if (width <= 1024) {
        setCategoryVisibleCount(2);
        return;
      }
      setCategoryVisibleCount(3);
    };

    updateCategoryVisibleCount();
    window.addEventListener("resize", updateCategoryVisibleCount);
    return () => {
      window.removeEventListener("resize", updateCategoryVisibleCount);
    };
  }, []);

  useEffect(() => {
    if (categorySlideIntervalRef.current) {
      clearInterval(categorySlideIntervalRef.current);
      categorySlideIntervalRef.current = null;
    }

    if (featuredCategories.length <= categoryVisibleCount) {
      setCategorySlideIndex(0);
      return;
    }

    categorySlideIntervalRef.current = setInterval(() => {
      setCategorySlideIndex((prev) => {
        if (featuredCategories.length <= categoryVisibleCount) return 0;
        const maxIndex = featuredCategories.length - categoryVisibleCount;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, CATEGORY_SLIDE_MS);

    return () => {
      if (categorySlideIntervalRef.current) {
        clearInterval(categorySlideIntervalRef.current);
        categorySlideIntervalRef.current = null;
      }
    };
  }, [featuredCategories.length, categoryVisibleCount]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const response = await fetch(toApiUrl("/categories"));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await parseJsonSafe(response);
        const apiCategories = Array.isArray(payload?.categories)
          ? payload.categories
          : [];

        if (isMounted) {
          setCategories(apiCategories);
        }
      } catch {
        if (isMounted) {
          setCategories([]);
          setCategoriesError(
            lang === "vi"
              ? "Không tải được danh mục từ API, đang dùng dữ liệu dự phòng."
              : "Failed to load categories from API, using fallback data.",
          );
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [lang]);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        setBlogsError("");
        const response = await getPublishedBlogsApi({ page: 1, limit: 3 });
        const apiBlogs = Array.isArray(response?.data) ? response.data : [];
        if (isMounted) {
          setBlogs(apiBlogs.slice(0, 3));
        }
      } catch {
        if (isMounted) {
          setBlogs([]);
          setBlogsError(
            lang === "vi"
              ? "Không tải được bài viết từ hệ thống."
              : "Failed to load blog posts from server.",
          );
        }
      } finally {
        if (isMounted) {
          setBlogsLoading(false);
        }
      }
    };

    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, [lang]);

  useEffect(() => {
    let isMounted = true;

    const fetchProductLists = async () => {
      try {
        setBuyLoading(true);
        setFittingLoading(true);

        const [buyRes, fittingRes] = await Promise.all([
          fetch(toApiUrl("/products?purpose=all&limit=200")),
          fetch(toApiUrl("/products?purpose=all&limit=200")),
        ]);

        if (buyRes.ok) {
          const buyPayload = await parseJsonSafe(buyRes);
          const buyData = Array.isArray(buyPayload?.data)
            ? buyPayload.data
            : [];
          if (isMounted) {
            setBuyProducts(buyData);
          }
        }

        if (fittingRes.ok) {
          const fittingPayload = await parseJsonSafe(fittingRes);
          const fittingData = Array.isArray(fittingPayload?.data)
            ? fittingPayload.data
            : [];
          if (isMounted) {
            setFittingProducts(fittingData);
          }
        }
      } catch (error) {
        if (isMounted) {
          setBuyProducts([]);
          setFittingProducts([]);
        }
        console.warn("product list API unavailable", error);
      } finally {
        if (isMounted) {
          setBuyLoading(false);
          setFittingLoading(false);
        }
      }
    };

    fetchProductLists();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTopRentedProducts = async () => {
      try {
        setTopRentLoading(true);

        const response = await fetch(toApiUrl("/products/top-liked?limit=24"));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = await parseJsonSafe(response);
        const apiData = Array.isArray(payload?.data) ? payload.data : [];
        if (isMounted) {
          setTopRentProducts(apiData);
        }
      } catch (error) {
        if (isMounted) {
          setTopRentProducts([]);
        }
        console.warn("top-liked API unavailable", error);
      } finally {
        if (isMounted) {
          setTopRentLoading(false);
        }
      }
    };

    fetchTopRentedProducts();
    return () => {
      isMounted = false;
    };
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    if (location.pathname === "/buy" || location.pathname === "/booking") {
      setActiveSection(location.pathname.slice(1));
      return;
    }

    const sectionIds = [
      "rent",
      "buy",
      "fitting",
      "packages",
      "blog",
      "contact",
    ];

    const handleScroll = () => {
      const offset = 130; // gần bằng chiều cao header + nav
      let current = "home";

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const scrollToId = (id) => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!initialSection) return;
    const target = `#${initialSection}`;
    const timer = setTimeout(() => {
      scrollToId(target);
      setActiveSection(initialSection);
    }, 50);
    return () => clearTimeout(timer);
  }, [initialSection]);

  const getCategoryTypeLabel = (type) => {
    if (lang === "vi") {
      if (type === "rent") return "Cho thuê";
      if (type === "sale_or_rent") return "Bán / Thuê";
      if (type === "service") return "Dịch vụ";
      return "Khác";
    }
    if (type === "rent") return "Rent";
    if (type === "sale_or_rent") return "Sale / Rent";
    if (type === "service") return "Service";
    return "Other";
  };

  const navigateToBuyCategory = (
    categoryValue,
    categoryType = "sale_or_rent",
  ) => {
    const value = String(categoryValue || "").trim();
    const normalizedType = String(categoryType || "")
      .trim()
      .toLowerCase();
    const purpose =
      normalizedType === "rent" || normalizedType === "service"
        ? "rent"
        : "buy";

    if (!value) {
      navigate(`/buy?purpose=${purpose}`);
      return;
    }
    navigate(`/buy?purpose=${purpose}&category=${encodeURIComponent(value)}`);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: lang === "vi" ? "VND" : "USD",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const hasRealImage = (imageUrl) =>
    typeof imageUrl === "string" && imageUrl.trim().length > 0;

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const hasAnyKeyword = (value, keywords) =>
    keywords.some((keyword) => value.includes(keyword));

  const isTraditionalCostume = (item) => {
    const haystack = `${item?.name || ""} ${item?.category || ""}`;
    const normalized = normalizeText(haystack);
    return hasAnyKeyword(normalized, [
      "co phuc",
      "viet phuc",
      "nhat binh",
      "ao tac",
      "ao dai",
      "truyen thong",
      "gam",
    ]);
  };

  const isDressRental = (item) => {
    const haystack = `${item?.name || ""} ${item?.category || ""}`;
    const normalized = normalizeText(haystack);
    return hasAnyKeyword(normalized, ["vay", "dam", "dress", "gown"]);
  };

  const getLikeCount = (item) => {
    const directValue = Number(
      item?.likeCount ??
      item?.likes ??
      item?.favoriteCount ??
      item?.wishlistCount ??
      item?.totalLikes,
    );
    if (Number.isFinite(directValue) && directValue >= 0) {
      return directValue;
    }

    if (Array.isArray(item?.likedBy)) {
      return item.likedBy.length;
    }

    if (Array.isArray(item?.favorites)) {
      return item.favorites.length;
    }

    return 0;
  };

  const displayedRentProducts =
    (topRentProducts.length > 0 ? topRentProducts : buyProducts).length > 0
      ? [...(topRentProducts.length > 0 ? topRentProducts : buyProducts)]
        .map((item) => ({
          ...item,
          __likeCount: getLikeCount(item),
        }))
        .filter((item) => hasRealImage(item.imageUrl))
        .filter((item) => Number(item.baseRentPrice || 0) > 0)
        .filter(
          (item) =>
            !["Apparel", "Accessories"].includes(
              String(item.category || "").trim(),
            ),
        )
        .filter((item) => item.__likeCount > 0)
        .sort((a, b) => b.__likeCount - a.__likeCount)
        .slice(0, HOMEPAGE_PRODUCT_LIMIT)
        .map((item) => ({
          id: item._id,
          name: item.name,
          meta:
            lang === "vi"
              ? `${item.category} • ${item.__likeCount} lượt yêu thích • ${formatCurrency(item.baseRentPrice)}/ngày`
              : `${item.category} • ${item.__likeCount} likes • ${formatCurrency(item.baseRentPrice)}/day`,
          imageUrl: item.imageUrl,
        }))
      : [];

  const canViewProductDetail = (productId) => Boolean(productId);

  const mapProductCard = (item) => ({
    id: item._id,
    name: item.name,
    meta:
      lang === "vi"
        ? `${item.category} • Thuê từ ${formatCurrency(item.baseRentPrice)}/ngày`
        : `${item.category} • From ${formatCurrency(item.baseRentPrice)}/day`,
    imageUrl: item.imageUrl,
  });

  const rentableWithImage = buyProducts
    .filter((item) => hasRealImage(item.imageUrl))
    .filter((item) => Number(item.baseRentPrice || 0) > 0)
    .filter(
      (item) =>
        !["Apparel", "Accessories"].includes(
          String(item.category || "").trim(),
        ),
    );
  const traditionalCandidates = rentableWithImage.filter((item) =>
    isTraditionalCostume(item),
  );
  const displayedBuyProducts = (
    traditionalCandidates.length > 0 ? traditionalCandidates : rentableWithImage
  )
    .slice(0, HOMEPAGE_PRODUCT_LIMIT)
    .map(mapProductCard);

  const fittingWithImage = fittingProducts
    .filter((item) => hasRealImage(item.imageUrl))
    .filter((item) => Number(item.baseRentPrice || 0) > 0);
  const dressCandidates = fittingWithImage.filter((item) =>
    isDressRental(item),
  );
  const dressFallback = fittingWithImage.filter(
    (item) => !displayedBuyProducts.some((chosen) => chosen.id === item._id),
  );
  const displayedFittingProducts = (
    dressCandidates.length > 0 ? dressCandidates : dressFallback
  )
    .slice(0, HOMEPAGE_PRODUCT_LIMIT)
    .map(mapProductCard);

  const fallbackBlogPosts = [
    {
      id: "blog-fallback-1",
      title: t(lang, "blog.p1.t"),
      excerpt: t(lang, "blog.p1.d"),
      thumbnail: "",
    },
    {
      id: "blog-fallback-2",
      title: t(lang, "blog.p2.t"),
      excerpt: t(lang, "blog.p2.d"),
      thumbnail: "",
    },
    {
      id: "blog-fallback-3",
      title: t(lang, "blog.p3.t"),
      excerpt: t(lang, "blog.p3.d"),
      thumbnail: "",
    },
  ];

  const displayedBlogs =
    blogs.length > 0
      ? blogs.slice(0, 3).map((item, index) => {
        const rawContent = String(item?.content || "").trim();
        const lines = rawContent
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
        const title =
          String(item?.title || "").trim() ||
          lines[0] ||
          (lang === "vi" ? `Bài viết ${index + 1}` : `Post ${index + 1}`);
        const body = lines.slice(1).join(" ") || rawContent;
        const excerpt = body.length > 180 ? `${body.slice(0, 177)}...` : body;

        return {
          id: item?._id || `blog-${index + 1}`,
          title,
          thumbnail: normalizeImageUrl(String(item?.thumbnail || "").trim()),
          excerpt:
            excerpt ||
            (lang === "vi"
              ? "Nội dung đang được cập nhật."
              : "Content is being updated."),
        };
      })
      : fallbackBlogPosts;

  const displayedCategories = useMemo(() => {
    if (!Array.isArray(featuredCategories) || featuredCategories.length === 0) {
      return [];
    }
    if (featuredCategories.length <= categoryVisibleCount) {
      return featuredCategories;
    }

    return Array.from({ length: categoryVisibleCount }, (_, offset) => {
      const index = (categorySlideIndex + offset) % featuredCategories.length;
      return featuredCategories[index];
    });
  }, [featuredCategories, categorySlideIndex, categoryVisibleCount]);

  return (
    <>
      <Header active={activeSection} />
      {SHOW_LEGACY_HEADER && (
        <>
          {/* HEADER */}
          <header className="header">
            <div className="container header-row">
              <a
                className="brand"
                href="#top"
                aria-label={t(lang, "meta.title")}
              >
                {/* Đổi src thành đường dẫn logo thực tế của bạn */}
                <img
                  src={logo}
                  alt={t(lang, "meta.title")}
                  className="brand-logo"
                />
              </a>

              <div className="header-right">
                <div className="lang" aria-label="Language switcher">
                  <button
                    className={"lang-btn" + (lang === "vi" ? " active" : "")}
                    type="button"
                    onClick={() => setLang("vi")}
                  >
                    VI
                  </button>
                  <button
                    className={"lang-btn" + (lang === "en" ? " active" : "")}
                    type="button"
                    onClick={() => setLang("en")}
                  >
                    EN
                  </button>
                </div>

                <a className="iconbtn" href="#contact">
                  <span className="dot" />
                  <span>{t(lang, "header.hotline")}</span>
                </a>
                <a className="iconbtn" href="#cart">
                  <span>Cart</span>
                  <span>{t(lang, "header.cart")}</span>
                </a>
                {isAuthenticated ? (
                  <div className="account-menu-wrap" ref={accountMenuRef}>
                    <button
                      className="iconbtn account-avatar-btn"
                      type="button"
                      onClick={() => setAccountMenuOpen((prev) => !prev)}
                      aria-label={
                        lang === "vi"
                          ? "Mở menu tài khoản"
                          : "Open account menu"
                      }
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="account-avatar-img"
                        />
                      ) : (
                        <span className="account-avatar-fallback">👤</span>
                      )}
                    </button>

                    {accountMenuOpen && (
                      <div className="account-dropdown">
                        <button
                          type="button"
                          className="account-dropdown-item"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            navigate("/profile");
                          }}
                        >
                          {lang === "vi" ? "Xem thông tin" : "View profile"}
                        </button>
                        <button
                          type="button"
                          className="account-dropdown-item danger"
                          onClick={async () => {
                            setAccountMenuOpen(false);
                            await logout();
                            navigate("/", { replace: true });
                          }}
                        >
                          {lang === "vi" ? "Đăng xuất" : "Logout"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="iconbtn login-btn"
                    type="button"
                    onClick={() => navigate("/login")}
                  >
                    <span>{t(lang, "header.login")}</span>
                  </button>
                )}
              </div>
            </div>
            {/* NAVBAR */}
            <nav className="nav" aria-label="Primary navigation">
              <div className="container nav-row">
                <div className="nav-left">
                  <a
                    className={
                      "nav-item" + (activeSection === "rent" ? " active" : "")
                    }
                    href="#rent"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId("#rent");
                      setActiveSection("rent");
                    }}
                  >
                    {t(lang, "nav.rent")}
                  </a>
                  <Link
                    className={
                      "nav-item" + (activeSection === "buy" ? " active" : "")
                    }
                    to="/buy"
                    onClick={() => {
                      setActiveSection("buy");
                    }}
                  >
                    {t(lang, "nav.buy")}
                  </Link>
                  <Link
                    className={
                      "nav-item" +
                      (activeSection === "booking" ? " active" : "")
                    }
                    to="/booking"
                    onClick={() => {
                      setActiveSection("booking");
                    }}
                  >
                    {t(lang, "nav.booking")}
                  </Link>
                  <a
                    className={
                      "nav-item" + (activeSection === "blog" ? " active" : "")
                    }
                    href="#blog"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId("#blog");
                      setActiveSection("blog");
                    }}
                  >
                    {t(lang, "nav.blog")}
                  </a>
                  <a
                    className={
                      "nav-item" +
                      (activeSection === "contact" ? " active" : "")
                    }
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId("#contact");
                      setActiveSection("contact");
                    }}
                  >
                    {t(lang, "nav.contact")}
                  </a>
                </div>

                <div className="nav-right">
                  <input
                    className="search"
                    type="search"
                    placeholder={t(lang, "search.placeholder")}
                  />
                  <button
                    className="cta"
                    type="button"
                    onClick={() => {
                      navigate("/booking");
                      setActiveSection("booking");
                    }}
                  >
                    {t(lang, "cta.bookNow")}
                  </button>
                </div>
              </div>
            </nav>
          </header>
        </>
      )}

      {/* HERO SLIDER */}
      <section className="hero" id="top">
        <div
          className="slides"
          onMouseEnter={() => setIsSliderPaused(true)}
          onMouseLeave={() => setIsSliderPaused(false)}
          onFocusCapture={() => setIsSliderPaused(true)}
          onBlurCapture={() => setIsSliderPaused(false)}
        >
          {heroBanners.length > 0 ? (
            heroBanners.map((b, idx) => {
              const bg = b.imageUrl || "";

              const handleTargetClick = () => {
                if (!b.targetLink) return;
                if (b.targetLink.startsWith("#")) {
                  scrollToId(b.targetLink);
                } else if (b.targetLink.startsWith("http")) {
                  window.open(b.targetLink, "_blank");
                } else {
                  window.location.href = b.targetLink;
                }
              };

              return (
                <div
                  key={b._id || idx}
                  className={"slide" + (currentSlide === idx ? " active" : "")}
                >
                  {bg && (
                    <div
                      className="slide-backdrop"
                      style={{ backgroundImage: `url(${bg})` }}
                    />
                  )}
                  {bg && (
                    <div className="hero-media-frame">
                      <img
                        src={bg}
                        alt=""
                        aria-hidden="true"
                        className="slide-bg-fill"
                      />
                      <img
                        src={bg}
                        alt={b.title || `Banner ${idx + 1}`}
                        className="slide-bg"
                      />
                    </div>
                  )}
                  {!bg && (
                    <div className="hero-media-frame">
                      <div
                        className="slide-bg"
                        style={{
                          backgroundColor: "#111",
                        }}
                      />
                    </div>
                  )}
                  <div className="hero-content">
                    <div className="hero-text">
                      <div className="hero-head">
                        <div className="badge">
                          <span>FITFLOW</span>
                          <span style={{ opacity: 0.8 }}>
                            {t(lang, "hero.badge")}
                          </span>
                        </div>
                      </div>

                      <h1 className="h1">{b.title || t(lang, "hero.h1_1")}</h1>
                      <p className="sub">
                        {b.subtitle || t(lang, "hero.sub_1")}
                      </p>

                      <div className="hero-actions">
                        <button
                          className="btn primary"
                          type="button"
                          onClick={handleTargetClick}
                        >
                          {lang === "vi" ? "Xem ngay" : "Explore"}
                        </button>
                        <button
                          className="btn ghost"
                          type="button"
                          onClick={() => scrollToId("#rent")}
                        >
                          {t(lang, "hero.btn_view")}
                        </button>
                      </div>

                      <div className="hero-kpis">
                        <span>
                          {lang === "vi" ? "4.9/5 đánh giá" : "4.9/5 reviews"}
                        </span>
                        <span>
                          {lang === "vi" ? "2000+ lượt thuê" : "2000+ rentals"}
                        </span>
                        <span>
                          {lang === "vi"
                            ? "Hỗ trợ 7 ngày/tuần"
                            : "Support 7 days/week"}
                        </span>
                      </div>
                    </div>

                    <aside className="hero-panel">
                      <p className="panel-title">
                        {t(lang, "hero.panel_title")}
                      </p>
                      <ul className="panel-list">
                        <li>{t(lang, "hero.panel_1")}</li>
                        <li>{t(lang, "hero.panel_2")}</li>
                        <li>{t(lang, "hero.panel_3")}</li>
                      </ul>
                      <div className="hero-progress">
                        <span
                          style={{
                            width: `${((idx + 1) / heroBanners.length) * 100}%`,
                          }}
                        />
                      </div>
                    </aside>

                    {/* ── Athlete visual (right column) ── */}
                    <div className="athlete-visual" aria-hidden="true">
                      <div className="pulse-ring" />
                      <div className="athlete-card">
                        <Shirt size={68} />
                        <span>Ready to wear</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback khi chưa có banners từ API
            <div className="slide active">
              <div
                className="slide-backdrop"
                style={{
                  backgroundImage: `url('${UI_IMAGE_FALLBACKS.heroBanner}')`,
                }}
              />
              <div className="hero-media-frame">
                <img
                  className="slide-bg-fill"
                  src={UI_IMAGE_FALLBACKS.heroBanner}
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="slide-bg"
                  src={UI_IMAGE_FALLBACKS.heroBanner}
                  alt="Fallback banner"
                />
              </div>
              <div className="hero-content">
                <div className="hero-text">
                  <div className="badge">
                    <span>FITFLOW</span>
                    <span style={{ opacity: 0.8 }}>
                      {t(lang, "hero.badge")}
                    </span>
                  </div>
                  <h1 className="h1">{t(lang, "hero.h1_1")}</h1>
                  <p className="sub">{t(lang, "hero.sub_1")}</p>
                  <div className="hero-actions">
                    <button
                      className="btn primary"
                      type="button"
                      onClick={() => scrollToId("#rent")}
                    >
                      {t(lang, "hero.btn_rent")}
                    </button>
                  </div>
                </div>

                {/* ── Athlete visual fallback (right column) ── */}
                <div className="athlete-visual" aria-hidden="true">
                  <div className="pulse-ring" />
                  <div className="athlete-card">
                    <Shirt size={68} />
                    <span>Ready to wear</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {heroBanners.length > 0 && (
            <div className="dots" aria-label="Slider dots">
              <button
                className="hero-nav prev"
                type="button"
                aria-label={lang === "vi" ? "Banner trước" : "Previous banner"}
                onClick={() => {
                  prevSlide();
                  restartAutoSlide();
                }}
              >
                ‹
              </button>
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  className={"dotbtn" + (currentSlide === i ? " active" : "")}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => {
                    goToSlide(i);
                    restartAutoSlide();
                  }}
                />
              ))}
              <button
                className="hero-nav next"
                type="button"
                aria-label={lang === "vi" ? "Banner tiếp theo" : "Next banner"}
                onClick={() => {
                  nextSlide();
                  restartAutoSlide();
                }}
              >
                ›
              </button>
            </div>
          )}
          {heroBanners.length > 0 && (
            <div className="hero-scroll-hint">
              {lang === "vi"
                ? "Cuộn để khám phá bộ sưu tập"
                : "Scroll to discover collections"}
            </div>
          )}
        </div>
      </section>

      {/* ══ STATS STRIP (FitFlow style) ══ */}
      <section aria-label="Thống kê FITFLOW" style={{ padding: "22px 0 0" }}>
        <div className="container">
          <div className="stats-strip">
            <div>
              <strong>2000+</strong>
              <span>Lượt thuê hoàn tất</span>
            </div>
            <div>
              <strong>50+</strong>
              <span>Mẫu sản phẩm</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>Đánh giá trung bình</span>
            </div>
          </div>
        </div>
      </section>

      {/* POLICIES / PRINCIPLES */}
      <section className="soft" id="policy">
        <div className="container">
          <h2 className="section-title">{t(lang, "policy.title")}</h2>
          <p className="section-sub">{t(lang, "policy.sub")}</p>

          <div className="grid-6">
            <div className="card">
              <div className="icon">50%</div>
              <h4>{t(lang, "policy.c1.t")}</h4>
              <p>{t(lang, "policy.c1.d")}</p>
            </div>
            <div className="card">
              <div className="icon">✓</div>
              <h4>{t(lang, "policy.c2.t")}</h4>
              <p>{t(lang, "policy.c2.d")}</p>
            </div>
            <div className="card">
              <div className="icon">ID</div>
              <h4>{t(lang, "policy.c3.t")}</h4>
              <p>{t(lang, "policy.c3.d")}</p>
            </div>
            <div className="card">
              <div className="icon">⏱</div>
              <h4>{t(lang, "policy.c4.t")}</h4>
              <p>{t(lang, "policy.c4.d")}</p>
            </div>
            <div className="card">
              <div className="icon">⚠</div>
              <h4>{t(lang, "policy.c5.t")}</h4>
              <p>{t(lang, "policy.c5.d")}</p>
            </div>
            <div className="card">
              <div className="icon">↔</div>
              <h4>{t(lang, "policy.c6.t")}</h4>
              <p>{t(lang, "policy.c6.d")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section id="categories">
        <div className="container">
          <h2 className="section-title">{t(lang, "cat.title")}</h2>
          <p className="section-sub">{t(lang, "cat.sub")}</p>

          {categoriesLoading && (
            <p className="category-status">
              {lang === "vi" ? "Đang tải danh mục..." : "Loading categories..."}
            </p>
          )}
          {categoriesError && (
            <p className="category-status warning">{categoriesError}</p>
          )}
          <div className="category-slider-container" style={{ overflow: "hidden", width: "100%" }}>
            <div
              className="category-track"
              style={{
                display: "flex",
                gap: "20px",
                transition: "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)",
                transform: `translateX(-${featuredCategories.length > 0 ? categorySlideIndex * (100 / featuredCategories.length) : 0}%)`,
                width: `${featuredCategories.length > 0 ? (featuredCategories.length / categoryVisibleCount) * 100 : 100}%`
              }}
            >
              {featuredCategories.map((category, index) => (
                <article
                  className="category-card category-card-clickable"
                  key={`${category.slug}-${index}`}
                  role="button"
                  tabIndex={0}
                  style={{
                    flex: `0 0 calc((100% - ${(categoryVisibleCount - 1) * 20}px) / ${categoryVisibleCount})`,
                    width: `calc((100% - ${(categoryVisibleCount - 1) * 20}px) / ${categoryVisibleCount})`,
                    boxSizing: "border-box"
                  }}
                  onClick={() =>
                    navigateToBuyCategory(
                      category.value || category.displayName,
                      category.type,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigateToBuyCategory(
                        category.value || category.displayName,
                        category.type,
                      );
                    }
                  }}
                >
                  <div className="category-image-wrap">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.displayName}
                        className="category-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="category-image placeholder">
                        {lang === "vi" ? "Chưa có ảnh" : "No image"}
                      </div>
                    )}
                  </div>
                  <div className="category-card-top">
                    <h3>{category.displayName}</h3>
                    <span className={"category-type " + category.type}>
                      {getCategoryTypeLabel(category.type)}
                    </span>
                  </div>
                  <p className="category-count">
                    {lang === "vi"
                      ? `${category.count} sản phẩm`
                      : `${category.count} items`}
                  </p>
                  {Array.isArray(category.children) &&
                    category.children.length > 0 && (
                      <ul className="category-children">
                        {category.children.map((child) => (
                          <li key={child.slug}>
                            <button
                              type="button"
                              className="category-child-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                navigateToBuyCategory(
                                  child.value || child.displayName,
                                  child.type || category.type,
                                );
                              }}
                            >
                              <span>{child.displayName}</span>
                              <strong>{child.count}</strong>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FITFLOW PROGRAM SECTION ══ */}
      <section className="program-section">
        <div className="container">
          <div className="program-section-head">
            <div>
              <span className="program-eyebrow">
                Dụng cụ &amp; Thời trang Thể thao
              </span>
              <h2>Danh mục nổi bật</h2>
            </div>
          </div>

          <div className="program-grid">
            <article
              className="program-card"
              onClick={() => navigate("/buy?purpose=rent&category=do-the-thao")}
            >
              <span className="program-card-tag">Đồ Thể Thao</span>
              <h3>Đồ thể thao &amp; Vợt Tennis</h3>
              <p>Thuê theo ngày • Size S–XL • Có phụ kiện thể thao</p>
            </article>
            <article
              className="program-card"
              onClick={() => navigate("/buy?purpose=rent&category=vot-tennis")}
            >
              <span className="program-card-tag">Vợt Pickleball</span>
              <h3>Vợt Pickleball &amp; Tennis</h3>
              <p>
                Chuyên nghiệp • Luyện tập &amp; Thi đấu • Tiêu chuẩn quốc tế
              </p>
            </article>
          </div>

          {/* ── FitFlow Booking Panel ── */}
          <div className="ff-booking-panel">
            <div>
              <span className="ff-booking-eyebrow">Đặt lịch hôm nay</span>
              <h2>Giữ sản phẩm đẹp trong 30 giây</h2>
              <p>
                Chọn sản phẩm, size, thời gian nhận trả. FITFLOW xác nhận tình
                trạng và giữ hàng cho bạn.
              </p>
            </div>
            <div className="ff-booking-list">
              <div className="ff-booking-item">
                <PackageCheck size={20} />
                <span className="ff-booking-item-status">Sẵn</span>
                <strong className="ff-booking-item-name">
                  Đồ thể thao full set
                </strong>
              </div>
              <div className="ff-booking-item">
                <CalendarDays size={20} />
                <span className="ff-booking-item-status">1–2 ngày</span>
                <strong className="ff-booking-item-name">
                  Vợt Pickleball &amp; Vợt Tennis
                </strong>
              </div>
              <div className="ff-booking-item">
                <ShieldCheck size={20} />
                <span className="ff-booking-item-status">Đã vệ sinh</span>
                <strong className="ff-booking-item-name">
                  Phụ kiện thể thao
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RENT PRODUCTS */}
      <section className="soft" id="rent">
        <div className="container">
          <div className="row-head">
            <h2>{t(lang, "rent.title")}</h2>
            <Link to="/buy?purpose=rent&sort=top_liked">
              {t(lang, "rent.more")}
            </Link>
          </div>
          {topRentLoading && (
            <p className="rent-status">
              {lang === "vi"
                ? "Đang tải top sản phẩm thuê..."
                : "Loading top rental products..."}
            </p>
          )}

          {!topRentLoading && displayedRentProducts.length === 0 && (
            <p className="rent-status warning">
              {lang === "vi"
                ? "Ch\u01b0a c\u00f3 s\u1ea3n ph\u1ea9m c\u00f3 \u1ea3nh th\u1eadt trong m\u1ee5c n\u00e0y."
                : "No products with real images are available in this section yet."}
            </p>
          )}
          <div className="products">
            {displayedRentProducts.map((product) => (
              <article className="product" key={product.id}>
                <div
                  className="pimg"
                  style={{ backgroundImage: `url('${product.imageUrl}')` }}
                />
                <div className="pbody">
                  <p className="ptitle">{product.name}</p>
                  <p className="pmeta">{product.meta}</p>
                  <div className="pactions">
                    <button
                      className="pbtn primary"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.rent")}
                    </button>
                    <button
                      className="pbtn"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.buy")}
                    </button>
                    {canViewProductDetail(product.id) ? (
                      <button
                        className="pbtn"
                        type="button"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {t(lang, "btn.detail")}
                      </button>
                    ) : (
                      <button className="pbtn" type="button" disabled>
                        {t(lang, "btn.detail")}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BUY PRODUCTS */}
      <section id="buy">
        <div className="container">
          <div className="row-head">
            <h2>{t(lang, "buy.title")}</h2>
            <Link to="/buy?purpose=rent&category=co-phuc">
              {t(lang, "buy.more")}
            </Link>
          </div>
          {buyLoading && (
            <p className="rent-status">
              {lang === "vi"
                ? "Đang tải danh sách sản phẩm mua..."
                : "Loading buy products..."}
            </p>
          )}

          {!buyLoading && displayedBuyProducts.length === 0 && (
            <p className="rent-status warning">
              {lang === "vi"
                ? "Ch\u01b0a c\u00f3 s\u1ea3n ph\u1ea9m c\u00f3 \u1ea3nh th\u1eadt trong m\u1ee5c n\u00e0y."
                : "No products with real images are available in this section yet."}
            </p>
          )}
          <div className="products">
            {displayedBuyProducts.map((product) => (
              <article className="product" key={product.id}>
                <div
                  className="pimg"
                  style={{ backgroundImage: `url('${product.imageUrl}')` }}
                />
                <div className="pbody">
                  <p className="ptitle">{product.name}</p>
                  <p className="pmeta">{product.meta}</p>
                  <div className="pactions">
                    <button
                      className="pbtn primary"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.buy")}
                    </button>
                    <button
                      className="pbtn"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.rent")}
                    </button>
                    <button
                      className="pbtn"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.detail")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FITTING PRODUCTS */}
      <section className="soft" id="fitting">
        <div className="container">
          <div className="row-head fitting-head">
            <h2>
              {lang === "vi" ? "Vợt & dụng cụ cho thuê" : "Dress Rentals"}
            </h2>
            <Link to="/buy?purpose=rent&q=vay">
              {lang === "vi" ? "Xem đồ thuê" : "View rentals"}
            </Link>
          </div>
          {fittingLoading && (
            <p className="rent-status">
              {lang === "vi"
                ? "Đang tải danh sách thử vợt/sân..."
                : "Loading fitting products..."}
            </p>
          )}
          {!fittingLoading && displayedFittingProducts.length === 0 && (
            <p className="rent-status warning">
              {lang === "vi"
                ? "Ch\u01b0a c\u00f3 s\u1ea3n ph\u1ea9m c\u00f3 \u1ea3nh th\u1eadt trong m\u1ee5c n\u00e0y."
                : "No products with real images are available in this section yet."}
            </p>
          )}
          <div className="products">
            {displayedFittingProducts.map((product) => (
              <article className="product" key={`fit-${product.id}`}>
                <div
                  className="pimg"
                  style={{ backgroundImage: `url('${product.imageUrl}')` }}
                />
                <div className="pbody">
                  <p className="ptitle">{product.name}</p>
                  <p className="pmeta">{product.meta}</p>
                  <div className="pactions">
                    <button
                      className="pbtn primary"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.rent")}
                    </button>
                    <button
                      className="pbtn"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.buy")}
                    </button>
                    <button
                      className="pbtn"
                      type="button"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {t(lang, "btn.detail")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog">
        <div className="container">
          <div className="row-head">
            <h2>{t(lang, "blog.title")}</h2>
            <Link to="/blog">
              {lang === "vi" ? "Xem tất cả bài viết" : "View all posts"}
            </Link>
          </div>
          <p className="section-sub">{t(lang, "blog.sub")}</p>

          {blogsLoading && (
            <p className="rent-status">
              {lang === "vi" ? "Đang tải bài viết..." : "Loading blog posts..."}
            </p>
          )}
          {blogsError && <p className="rent-status warning">{blogsError}</p>}

          <div className="grid-3-cards">
            {displayedBlogs.map((post) => (
              <div className="info-card" key={post.id}>
                {post.thumbnail ? (
                  <img
                    className="blog-thumb"
                    src={post.thumbnail}
                    alt={post.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="blog-thumb blog-thumb-placeholder">
                    {lang === "vi" ? "Chưa có ảnh" : "No image"}
                  </div>
                )}
                <h3>{post.title}</h3>
                <p className="footer-text">{post.excerpt}</p>
                <Link className="blog-card-link" to={`/blog/${post.id}`}>
                  Đọc thêm
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="container">
          <h2 className="section-title">{t(lang, "contact.title")}</h2>
          <p className="section-sub">{t(lang, "contact.sub")}</p>
          <div className="contact-grid">
            <div className="contact-card">
              <span className="contact-label">Hotline</span>
              <strong>{CONTACT_INFO.phoneDisplay}</strong>
              <span>
                Gọi trực tiếp để được tư vấn nhanh về thuê, mua và đặt lịch.
              </span>
              <a className="contact-btn primary" href={CONTACT_INFO.phoneHref}>
                Gọi ngay
              </a>
            </div>
            <div className="contact-card">
              <span className="contact-label">Địa chỉ</span>
              <strong>{CONTACT_INFO.addressDisplay}</strong>
              <span>Mở bản đồ để đến cửa hàng tại trung tâm thể thao.</span>
              <a
                className="contact-btn"
                href={CONTACT_INFO.mapHref}
                target="_blank"
                rel="noreferrer"
              >
                Xem đường đi
              </a>
            </div>
            <div className="contact-card">
              <span className="contact-label">Instagram & Zalo</span>
              <strong>{CONTACT_INFO.instagramLabel}</strong>
              <span>
                Xem mẫu mới và nhắn tin tư vấn trực tiếp qua Instagram hoặc
                Zalo.
              </span>
              <div className="contact-card-actions">
                <a
                  className="contact-btn"
                  href={CONTACT_INFO.instagramHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
                <a
                  className="contact-btn primary"
                  href={CONTACT_INFO.zaloHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Nhắn Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <p className="footer-title">{t(lang, "brand.name")}</p>
              <p className="footer-text">{t(lang, "footer.about")}</p>
            </div>

            <div>
              <p className="footer-title">{t(lang, "footer.col1")}</p>
              <div className="f-links">
                <a href="#rent">{t(lang, "nav.rent")}</a>
                <Link
                  to="/buy"
                  onClick={() => {
                    setActiveSection("buy");
                  }}
                >
                  {t(lang, "nav.buy")}
                </Link>
              </div>
            </div>

            <div>
              <p className="footer-title">{t(lang, "footer.col2")}</p>
              <div className="f-links">
                <a href="#policy">{t(lang, "policy.c1.t")}</a>
                <a href="#policy">{t(lang, "policy.c3.t")}</a>
                <a href="#policy">{t(lang, "policy.c4.t")}</a>
                <a href="#policy">{t(lang, "policy.c5.t")}</a>
              </div>
            </div>

            <div>
              <p className="footer-title">{t(lang, "footer.col3")}</p>
              <p className="footer-text">
                <span>{CONTACT_INFO.addressDisplay}</span>
                <br />
                <span>{t(lang, "footer.phone")}</span>{" "}
                {CONTACT_INFO.phoneDisplay}
                <br />
                Zalo / Instagram: {CONTACT_INFO.instagramLabel}
              </p>
            </div>
          </div>

          <div className="copy" id="cart">
            © {year} {t(lang, "brand.name")}. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

// Comprehensive mock database of blog posts for FitFlow
const MOCK_BLOGS = [
  {
    id: "1",
    title: "10 Essential Gym Outfits for Maximum Performance and Comfort",
    slug: "10-essential-gym-outfits-maximum-performance",
    summary: "Discover how the right workout apparel can boost your training efficiency, prevent injuries, and keep you motivated throughout your fitness journey.",
    content: `
      <h2>The Science of Activewear: Why What You Wear Matters</h2>
      <p>When it comes to working out, many people focus solely on their routine, nutrition, and recovery. While these are undoubtedly the pillars of physical progress, the apparel you choose plays a significant role in your performance, safety, and mental state during exercise. Modern athletic wear is no longer just about aesthetics; it is a blend of textile technology, ergonomics, and sports science.</p>
      
      <h3>1. Moisture-Wicking Fabrics: The Ultimate Game Changer</h3>
      <p>Sweating is the body's natural cooling mechanism. However, when sweat gets trapped in traditional fabrics like cotton, it becomes heavy, cold, and causes friction against the skin. This can lead to chafing, skin irritations, and a rapid drop in body temperature post-workout. High-performance polyester-spandex blends are designed to pull moisture away from the skin, moving it to the outer surface of the fabric where it evaporates quickly. This keeps you dry, cool, and comfortable during intense training sessions.</p>
      
      <h3>2. Compression Gear: Support and Recovery</h3>
      <p>Compression wear has gained immense popularity among powerlifters, runners, and high-intensity interval training (HIIT) enthusiasts. By applying graduated pressure to specific muscle groups, compression garments improve blood circulation, deliver more oxygen to the muscles, and reduce muscle oscillation during high-impact movements. This leads to reduced fatigue during the workout and faster recovery times afterward.</p>
      
      <h3>3. Footwear: The Foundation of Every Movement</h3>
      <p>You wouldn't run a marathon in hiking boots, nor should you do heavy squats in running shoes with soft, air-cushioned soles. Squats, deadlifts, and overhead presses require a stable, flat foundation to maximize power transfer and keep your ankles aligned. Running, on the other hand, requires cushioning to absorb the shock of impact. Choosing the correct footwear for your specific training style is crucial for preventing acute injuries and chronic wear-and-tear on your joints.</p>
      
      <h3>4. Versatility and Layering</h3>
      <p>A good gym wardrobe should adapt to different environments. Layering is key for warming up and cooling down. Starting your session with a lightweight hoodie or long-sleeve zip-up helps raise your core temperature gradually, preparing your muscles and joints for heavy loads. As you warm up, transitioning to a breathable tee or tank ensures you don't overheat.</p>
    `,
    category: "Fashion",
    tags: ["Gym Gear", "Activewear", "Performance"],
    author: {
      name: "Alex Johnson",
      role: "Fitness Stylist & Trainer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
    },
    publishedAt: "2026-07-10",
    readTime: "5 mins",
    likes: 124,
    commentsCount: 18,
    featured: true,
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "2",
    title: "How to Build a Sustainable Workout Wardrobe on a Budget",
    slug: "sustainable-workout-wardrobe-on-budget",
    summary: "High-quality gym wear doesn't have to cost a fortune. Learn tips on capsule fitness wardrobes, fabric durability, and how renting changes the game.",
    content: `
      <h2>Smart Fitness Fashion: Buying Less, Choosing Better</h2>
      <p>In an era of fast fashion, fitness apparel has become highly disposable. However, cheap workout clothes often lose their shape, elasticity, and color after just a few washes. Building a sustainable, long-lasting workout wardrobe requires a shift in mindset: focusing on quality over quantity, understanding material compositions, and adopting alternative consumption models like rental services.</p>
      
      <h3>1. The Capsule Gym Wardrobe Concept</h3>
      <p>A capsule wardrobe consists of a few high-quality, versatile pieces that can be easily mixed and matched. For a functional fitness capsule, you only need:
        <ul>
          <li>3 high-performance tops (neutral colors)</li>
          <li>2 pairs of premium shorts or leggings</li>
          <li>1 high-quality sports bra (for women) or compression base-layer</li>
          <li>1 lightweight zip-up jacket or hoodie</li>
          <li>1 pair of premium athletic shoes suitable for your primary activity</li>
        </ul>
        By investing in premium materials, you ensure these items survive hundreds of washes without degrading in performance.
      </p>
      
      <h3>2. Decoding Fabric Labels</h3>
      <p>Look for recycled polyester, nylon, and organic cotton. Lycra and elastane are essential for stretch retention. Avoid 100% cotton garments for high-intensity training, as they absorb moisture and lose shape rapidly.</p>
      
      <h3>3. The Rise of Athletic Wear Rentals</h3>
      <p>Why buy expensive performance wear that you might only wear a few times for specific events, outdoor hikes, or photo shoots? Rental platforms like FitFlow allow you to access premium, high-end fitness brands at a fraction of the cost, reducing textile waste and keeping your gym looks fresh and sustainable.</p>
    `,
    category: "Sustainability",
    tags: ["Eco-friendly", "Budgeting", "Capsule Wardrobe"],
    author: {
      name: "Emma Watson",
      role: "Eco-Fashion Advocate",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
    },
    publishedAt: "2026-07-08",
    readTime: "4 mins",
    likes: 85,
    commentsCount: 9,
    featured: false,
    thumbnail: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "3",
    title: "Understanding Compression Wear: Hype or True Performance Booster?",
    slug: "understanding-compression-wear-hype-or-reality",
    summary: "An in-depth, scientifically backed analysis of how compression tights, socks, and shirts affect athletic performance, safety, and recovery.",
    content: `
      <h2>The Physics of Compression: How It Works</h2>
      <p>Go to any local gym or running trail, and you will see athletes wrapped in tight, elastic garments. But is compression wear really the performance booster manufacturers claim, or is it just a slick marketing gimmick? In this article, we dive deep into the physiological mechanisms and scientific studies surrounding compression activewear.</p>
      
      <h3>1. Blood Circulation and Oxygenation</h3>
      <p>Compression garments apply external pressure to the limbs. This pressure mimics the contraction of muscles, assisting the veins in returning deoxygenated blood back to the heart. Improved venous return enhances cardiac output, meaning your muscles receive fresh, oxygen-rich blood more efficiently during prolonged workouts. This is especially beneficial for endurance athletes like runners and cyclists.</p>
      
      <h3>2. Reduction of Muscle Oscillation</h3>
      <p>When your foot hits the ground during a run, or when you land from a box jump, a shockwave travels through your muscle fibers. This is known as muscle oscillation. These micro-vibrations contribute significantly to muscle fatigue and damage. Compression gear wraps tightly around the muscles, keeping them stable and minimizing oscillation, which reduces post-exercise muscle soreness (DOMS).</p>
      
      <h3>3. Proprioception: Body Awareness</h3>
      <p>Proprioception is the body's ability to perceive its position and movement in space. The physical sensation of tight garments stimulating the skin's sensory receptors improves proprioceptive feedback. This enhanced awareness can lead to better form, coordination, and alignment during complex movements like squats or athletic agility drills.</p>
    `,
    category: "Science",
    tags: ["Compression", "Performance", "Science"],
    author: {
      name: "Dr. Marcus Vance",
      role: "Sports Medicine Specialist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
    },
    publishedAt: "2026-07-05",
    readTime: "7 mins",
    likes: 210,
    commentsCount: 34,
    featured: false,
    thumbnail: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800"
  }
];

const CATEGORIES = ["All", "Fashion", "Sustainability", "Science", "Materials", "Safety"];

export const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState(null);
  const navigate = useNavigate();

  const featuredPost = useMemo(() => {
    return MOCK_BLOGS.find(blog => blog.featured) || MOCK_BLOGS[0];
  }, []);

  const filteredBlogs = useMemo(() => {
    return MOCK_BLOGS.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            blog.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
      const matchesTag = !selectedTag || blog.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchTerm, selectedCategory, selectedTag]);

  const allTags = useMemo(() => {
    const tagsSet = new Set();
    MOCK_BLOGS.forEach(blog => blog.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet);
  }, []);

  return (
    <div className="blog-page-container">
      <Header />
      
      <main className="blog-main-content">
        {/* Hero Section */}
        <section className="blog-hero">
          <div className="hero-text">
            <span className="hero-badge">FITFLOW EDITORIAL</span>
            <h1>The Pulse of Performance</h1>
            <p>Expert insights, gear guides, scientific analyses, and trend updates from the intersection of athletic performance and sustainable style.</p>
          </div>
          <div className="search-bar-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search articles, trends, activewear guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {/* Featured Post */}
        {!searchTerm && selectedCategory === "All" && !selectedTag && featuredPost && (
          <section className="featured-section">
            <div className="featured-card">
              <div className="featured-image">
                <img src={featuredPost.thumbnail} alt={featuredPost.title} />
              </div>
              <div className="featured-info">
                <div className="featured-meta">
                  <span className="category-tag">{featuredPost.category}</span>
                  <span className="dot">•</span>
                  <span className="read-time"><Clock size={14} /> {featuredPost.readTime}</span>
                </div>
                <h2><Link to={`/blog/${featuredPost.id}`}>{featuredPost.title}</Link></h2>
                <p className="featured-summary">{featuredPost.summary}</p>
                <div className="author-row">
                  <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="author-avatar" />
                  <div>
                    <span className="author-name">{featuredPost.author.name}</span>
                    <span className="author-role">{featuredPost.author.role}</span>
                  </div>
                </div>
                <div className="featured-actions">
                  <Link to={`/blog/${featuredPost.id}`} className="read-more-btn">
                    Read Full Article <ArrowRight size={16} />
                  </Link>
                  <div className="meta-stats">
                    <span><Heart size={16} /> {featuredPost.likes}</span>
                    <span><MessageSquare size={16} /> {featuredPost.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filters and Main Grid */}
        <div className="blog-content-layout">
          {/* Sidebar */}
          <aside className="blog-sidebar">
            <div className="sidebar-widget">
              <h3>Categories</h3>
              <ul className="category-list">
                {CATEGORIES.map(category => (
                  <li key={category}>
                    <button
                      className={selectedCategory === category ? "active" : ""}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedTag(null);
                      }}
                    >
                      {category}
                      <ChevronRight size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-widget">
              <h3>Trending Tags</h3>
              <div className="tags-cloud">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-btn ${selectedTag === tag ? "active" : ""}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    <Tag size={12} /> {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Articles Grid */}
          <section className="articles-grid-wrapper">
            <div className="grid-header">
              <h2>{selectedCategory} Articles {selectedTag && `tagged "${selectedTag}"`}</h2>
              <span className="results-count">{filteredBlogs.length} articles found</span>
            </div>

            {filteredBlogs.length > 0 ? (
              <div className="articles-grid">
                {filteredBlogs.map(blog => (
                  <article key={blog.id} className="blog-grid-card">
                    <div className="card-image">
                      <img src={blog.thumbnail} alt={blog.title} />
                      <span className="card-category">{blog.category}</span>
                    </div>
                    <div className="card-body">
                      <div className="card-meta">
                        <span><Calendar size={12} /> {new Date(blog.publishedAt).toLocaleDateString()}</span>
                        <span><Clock size={12} /> {blog.readTime}</span>
                      </div>
                      <h3><Link to={`/blog/${blog.id}`}>{blog.title}</Link></h3>
                      <p>{blog.summary}</p>
                      
                      <div className="card-footer">
                        <div className="author-mini">
                          <img src={blog.author.avatar} alt={blog.author.name} />
                          <span>By {blog.author.name.split(" ")[0]}</span>
                        </div>
                        <Link to={`/blog/${blog.id}`} className="card-link">
                          Read <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <BookOpen size={48} />
                <h3>No Articles Found</h3>
                <p>We couldn't find any articles matching your search criteria. Try modifying your filters or search keywords.</p>
                <button onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedTag(null);
                }} className="reset-btn">Reset All Filters</button>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="blog-footer">
        <p>&copy; 2026 FitFlow Editorial. Supporting sustainable fitness lifestyles.</p>
      </footer>
    </div>
  );
};

export const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, author: "Sarah Miller", text: "Excellent article! The segment about foot wear and heel elevations during squating completely makes sense. Highly recommend.", time: "1 day ago" },
    { id: 2, author: "Kevin Durant", text: "Is there any specific recommendation for compression gear manufacturers that use eco-friendly materials?", time: "18 hours ago" }
  ]);
  const [newComment, setNewComment] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const foundBlog = MOCK_BLOGS.find(b => b.id === id) || MOCK_BLOGS[0];
    setBlog(foundBlog);
    setLikes(foundBlog ? foundBlog.likes : 0);
  }, [id]);

  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments(prev => [
      ...prev,
      {
        id: Date.now(),
        author: "You (Active User)",
        text: newComment,
        time: "Just now"
      }
    ]);
    setNewComment("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!blog) {
    return (
      <div className="blog-loading">
        <p>Loading article...</p>
      </div>
    );
  }

  const relatedBlogs = MOCK_BLOGS.filter(b => b.id !== blog.id).slice(0, 2);

  return (
    <div className="blog-detail-container">
      <Header />
      
      <main className="blog-detail-main">
        {/* Back Link */}
        <div className="back-nav">
          <Link to="/blog" className="back-link">
            <ArrowLeft size={16} /> Back to Editorial
          </Link>
        </div>

        {/* Article Header */}
        <header className="article-header">
          <div className="article-meta-tags">
            <span className="category-label">{blog.category}</span>
            {blog.tags.map(tag => (
              <span key={tag} className="tag-label"><Tag size={10} /> {tag}</span>
            ))}
          </div>
          <h1>{blog.title}</h1>
          <p className="article-summary">{blog.summary}</p>

          <div className="article-author-card">
            <div className="author-details-wrapper">
              <img src={blog.author.avatar} alt={blog.author.name} />
              <div>
                <span className="author-name">{blog.author.name}</span>
                <span className="author-meta-text">{blog.author.role}</span>
              </div>
            </div>
            <div className="article-info-stats">
              <span><Calendar size={14} /> {new Date(blog.publishedAt).toLocaleDateString()}</span>
              <span className="divider">|</span>
              <span><Clock size={14} /> {blog.readTime} read</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="article-banner">
          <img src={blog.thumbnail} alt={blog.title} />
        </div>

        {/* Content & Action Bar Layout */}
        <div className="article-body-layout">
          {/* Side Share Bar */}
          <aside className="article-side-actions">
            <button className={`like-btn ${hasLiked ? "liked" : ""}`} onClick={handleLike}>
              <Heart size={20} fill={hasLiked ? "var(--color-accent, #ff4d4d)" : "none"} />
              <span>{likes}</span>
            </button>
            <button className="comment-scroll-btn" onClick={() => document.getElementById("comments").scrollIntoView({ behavior: "smooth" })}>
              <MessageSquare size={20} />
              <span>{comments.length}</span>
            </button>
            <div className="side-divider"></div>
            <button onClick={handleCopyLink} title="Copy Link">
              {copiedLink ? <CheckCircle size={20} className="copy-success" /> : <Link2 size={20} />}
            </button>
            <button title="Share on Facebook"><Facebook size={20} /></button>
            <button title="Share on Twitter"><Twitter size={20} /></button>
          </aside>

          {/* Main Body */}
          <article className="article-rich-text">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </article>
        </div>

        {/* Comments Section */}
        <section id="comments" className="comments-section">
          <h2>Discussion ({comments.length})</h2>
          
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              placeholder="Join the discussion... Share your thoughts or ask a question."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              required
            ></textarea>
            <div className="form-actions">
              <button type="submit" className="post-comment-btn">
                Post Comment <Send size={14} />
              </button>
            </div>
          </form>

          <div className="comments-list">
            {comments.map(c => (
              <div key={c.id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">{c.author}</span>
                  <span className="comment-time">{c.time}</span>
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Articles */}
        <section className="related-articles-section">
          <h2>Recommended Readings</h2>
          <div className="related-grid">
            {relatedBlogs.map(rb => (
              <div key={rb.id} className="related-card">
                <img src={rb.thumbnail} alt={rb.title} />
                <div className="related-body">
                  <span>{rb.category}</span>
                  <h3><Link to={`/blog/${rb.id}`}>{rb.title}</Link></h3>
                  <Link to={`/blog/${rb.id}`} className="read-link">Read Post &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Homepage;
