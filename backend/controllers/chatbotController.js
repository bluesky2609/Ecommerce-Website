const Groq = require('groq-sdk');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Initialize Groq AI (free tier, very fast - Llama-3.3-70b)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store policies and FAQ information
const STORE_POLICIES = `
## Chính sách cửa hàng HODY:

### Vận chuyển:
- Miễn phí vận chuyển cho đơn hàng từ 299.000đ
- Đơn hàng dưới 299.000đ: phí ship 30.000đ
- Thời gian giao hàng: 2-5 ngày (nội thành), 3-7 ngày (ngoại thành)
- Hỗ trợ giao hàng toàn quốc

### Đổi trả:
- Đổi trả miễn phí trong 7 ngày kể từ ngày nhận hàng
- Sản phẩm phải còn nguyên tag, chưa qua sử dụng hoặc giặt
- Không áp dụng đổi trả với sản phẩm giảm giá trên 50%
- Hoàn tiền trong 3-5 ngày làm việc qua hình thức thanh toán ban đầu

### Bảng size tham khảo:
- Size S: 40-55kg, cao 155-165cm
- Size M: 55-65kg, cao 160-170cm
- Size L: 65-75kg, cao 165-175cm
- Size XL: 75-85kg, cao 170-180cm
- Size XXL: 85-95kg, cao 175-185cm
- Lưu ý: Bảng size chỉ mang tính tham khảo, có thể chênh lệch tùy dáng người

### Thanh toán:
- Thanh toán khi nhận hàng (COD)
- Thanh toán qua PayOS (QR code)
`;

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn mua sắm của cửa hàng thời trang HODY. Hãy trả lời thân thiện, nhiệt tình và chuyên nghiệp bằng tiếng Việt.

Quy tắc:
1. Luôn trả lời bằng tiếng Việt
2. Khi người dùng hỏi về sản phẩm, hãy tham khảo danh sách sản phẩm được cung cấp trong context
3. Khi gợi ý sản phẩm, hãy đề cập tên, giá và đặc điểm nổi bật
4. Giá tiền hiển thị theo format: xxx.xxxđ
5. Khi tư vấn size, tham khảo bảng size trong chính sách
6. Trả lời ngắn gọn, dễ hiểu, không quá 200 từ
7. Nếu không tìm thấy sản phẩm phù hợp, gợi ý người dùng thử tìm kiếm khác hoặc liên hệ hotline
8. Khi có sản phẩm phù hợp, hãy trả lời kèm thông tin sản phẩm rõ ràng
9. KHÔNG bịa ra sản phẩm không có trong dữ liệu
10. Sử dụng emoji phù hợp để tạo cảm giác thân thiện

${STORE_POLICIES}`;

/**
 * Extract search intent from user message
 */
function extractSearchParams(message) {
  const lowerMsg = message.toLowerCase();
  const params = {};

  // Extract price range
  const priceMatch = lowerMsg.match(/(?:dưới|duoi|under|<)\s*(\d+)/);
  if (priceMatch) {
    params.maxPrice = parseInt(priceMatch[1]) * (lowerMsg.includes('k') || parseInt(priceMatch[1]) < 1000 ? 1000 : 1);
  }
  const priceAboveMatch = lowerMsg.match(/(?:trên|tren|trở lên|tro len|above|>)\s*(\d+)/);
  if (priceAboveMatch) {
    params.minPrice = parseInt(priceAboveMatch[1]) * (lowerMsg.includes('k') || parseInt(priceAboveMatch[1]) < 1000 ? 1000 : 1);
  }

  // Extract size
  const sizeMatch = lowerMsg.match(/size\s*(xs|s|m|l|xl|xxl|2xl|3xl)/i);
  if (sizeMatch) {
    params.size = sizeMatch[1].toUpperCase();
  }

  // Check for special categories
  if (lowerMsg.includes('bán chạy') || lowerMsg.includes('best seller') || lowerMsg.includes('bestseller') || lowerMsg.includes('hot')) {
    params.isBestSeller = true;
  }
  if (lowerMsg.includes('mới') || lowerMsg.includes('new') || lowerMsg.includes('hàng mới')) {
    params.isNew = true;
  }
  if (lowerMsg.includes('nổi bật') || lowerMsg.includes('featured') || lowerMsg.includes('đặc biệt')) {
    params.isFeatured = true;
  }

  // Extract search keyword (remove common words)
  const stopWords = [
    'tôi', 'muốn', 'mua', 'tìm', 'có', 'không', 'nào', 'cho', 'với', 'giá',
    'bao', 'nhiêu', 'cái', 'chiếc', 'đôi', 'bộ', 'cửa', 'hàng', 'shop',
    'ơi', 'nhé', 'nha', 'ạ', 'vậy', 'thế', 'gì', 'sao', 'đâu', 'được',
    'size', 'dưới', 'trên', 'bán', 'chạy', 'mới', 'nổi', 'bật', 'hot',
    'xin', 'chào', 'hello', 'hi', 'hey', 'giúp', 'hỏi', 'about', 'kiểu',
    'loại', 'của', 'và', 'hoặc', 'hay', 'thì', 'là', 'rẻ', 'đẹp',
    'best', 'seller', 'featured', 'new', 'bestseller',
  ];
  const words = lowerMsg.split(/\s+/).filter(w => w.length > 1 && !stopWords.includes(w));
  if (words.length > 0) {
    params.searchKeyword = words.join(' ');
  }

  return params;
}

/**
 * Query products from MongoDB based on extracted params
 */
async function queryProducts(params) {
  const filter = { isActive: true };
  const limit = 6;

  if (params.isBestSeller) {
    filter.isBestSeller = true;
  }
  if (params.isNew) {
    filter.isNew = true;
  }
  if (params.isFeatured) {
    filter.isFeatured = true;
  }
  if (params.size) {
    filter.sizes = params.size;
  }
  if (params.minPrice || params.maxPrice) {
    filter.salePrice = {};
    if (params.minPrice) filter.salePrice.$gte = params.minPrice;
    if (params.maxPrice) filter.salePrice.$lte = params.maxPrice;
  }

  // Try text search first
  if (params.searchKeyword) {
    const searchFilter = {
      ...filter,
      $or: [
        { name: { $regex: params.searchKeyword, $options: 'i' } },
        { description: { $regex: params.searchKeyword, $options: 'i' } },
        { tags: { $regex: params.searchKeyword, $options: 'i' } },
      ],
    };

    let products = await Product.find(searchFilter)
      .populate('category', 'name slug')
      .sort({ sold: -1 })
      .limit(limit);

    // If no results with keyword, try each word separately
    if (products.length === 0 && params.searchKeyword.includes(' ')) {
      const words = params.searchKeyword.split(' ');
      for (const word of words) {
        if (word.length < 2) continue;
        const wordFilter = {
          ...filter,
          $or: [
            { name: { $regex: word, $options: 'i' } },
            { description: { $regex: word, $options: 'i' } },
            { tags: { $regex: word, $options: 'i' } },
          ],
        };
        products = await Product.find(wordFilter)
          .populate('category', 'name slug')
          .sort({ sold: -1 })
          .limit(limit);
        if (products.length > 0) break;
      }
    }

    return products;
  }

  // Fallback: query without keyword
  return await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ sold: -1 })
    .limit(limit);
}

/**
 * Format products into context string for GPT
 */
function formatProductsContext(products) {
  if (!products || products.length === 0) {
    return 'Không tìm thấy sản phẩm phù hợp trong cửa hàng.';
  }

  return products
    .map((p, i) => {
      const price = p.salePrice.toLocaleString('vi-VN');
      const originalPrice = p.originalPrice.toLocaleString('vi-VN');
      const discount = p.discount > 0 ? ` (Giảm ${p.discount}%)` : '';
      const colors = p.colors?.map(c => c.name || c).join(', ') || 'N/A';
      const sizes = p.sizes?.join(', ') || 'N/A';
      const category = p.category?.name || 'N/A';

      return `${i + 1}. ${p.name}
   - Giá: ${price}đ${p.discount > 0 ? ` (gốc: ${originalPrice}đ${discount})` : ''}
   - Danh mục: ${category}
   - Màu: ${colors}
   - Size: ${sizes}
   - Đã bán: ${p.sold || 0}
   - Đánh giá: ${p.rating || 0}/5 (${p.reviewCount || 0} đánh giá)
   - Slug: ${p.slug}`;
    })
    .join('\n\n');
}

/**
 * Format products for frontend display
 */
function formatProductsForResponse(products) {
  return products.map(p => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    image: p.images?.[0] || '',
    salePrice: p.salePrice,
    originalPrice: p.originalPrice,
    discount: p.discount,
    rating: p.rating,
    reviewCount: p.reviewCount,
    category: p.category?.name || '',
    categorySlug: p.category?.slug || '',
  }));
}

/**
 * Check if message is about product/shopping (needs DB query)
 */
function isProductQuery(message) {
  const lowerMsg = message.toLowerCase();
  const productKeywords = [
    'sản phẩm', 'mua', 'tìm', 'giá', 'áo', 'quần', 'váy', 'đầm', 'giày', 'dép',
    'túi', 'mũ', 'nón', 'phụ kiện', 'bán chạy', 'bestseller', 'best seller',
    'mới', 'nổi bật', 'featured', 'hot', 'sale', 'giảm giá', 'khuyến mãi',
    'size', 'màu', 'color', 'kích cỡ', 'gợi ý', 'recommend', 'tư vấn',
    'thời trang', 'quần áo', 'đồ', 'outfit', 'bộ sưu tập',
    'rẻ', 'đắt', 'cao cấp', 'premium', 'phổ biến', 'trending',
    'jacket', 'hoodie', 'polo', 'jean', 'short', 'kaki',
    'xu hướng', 'trend', 'đẹp', 'phong cách', 'style',
  ];

  return productKeywords.some(keyword => lowerMsg.includes(keyword));
}

// @route POST /api/chatbot/message
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tin nhắn không được để trống',
      });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'Chatbot chưa được cấu hình API Key. Vui lòng thêm GROQ_API_KEY vào file backend/.env.',
      });
    }

    // Determine if we need to query products
    let productsContext = '';
    let matchedProducts = [];

    if (isProductQuery(message)) {
      const searchParams = extractSearchParams(message);
      const products = await queryProducts(searchParams);
      matchedProducts = products;
      productsContext = `\n\n--- DỮ LIỆU SẢN PHẨM TÌM ĐƯỢC ---\n${formatProductsContext(products)}\n--- HẾT DỮ LIỆU ---`;
    }

    // Build messages array for Groq ChatCompletion
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 10 messages, any role order is fine)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Add current user message (with product context appended if needed)
    const userContent = productsContext ? `${message}${productsContext}` : message;
    messages.push({ role: 'user', content: userContent });

    // Call Groq Chat Completions API (OpenAI-compatible, free tier)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const botReply = completion.choices[0]?.message?.content || 'Xin lỗi, mình không thể trả lời lúc này.';

    res.json({
      success: true,
      data: {
        reply: botReply,
        products: matchedProducts.length > 0 ? formatProductsForResponse(matchedProducts) : [],
      },
    });
  } catch (err) {
    console.error('Chatbot error:', err);

    // Handle Groq-specific errors
    const status = err?.status || err?.response?.status;
    const errMsg = err?.message || '';

    if (status === 401 || errMsg.includes('Invalid API Key') || errMsg.includes('invalid_api_key')) {
      return res.status(500).json({
        success: false,
        message: 'API key Groq không hợp lệ. Vui lòng kiểm tra lại GROQ_API_KEY trong file .env.',
      });
    }

    if (status === 429 || errMsg.includes('rate_limit') || errMsg.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'Chatbot đang bận, vui lòng thử lại sau ít phút.',
      });
    }

    if (status === 503 || errMsg.includes('overloaded') || errMsg.includes('service_unavailable')) {
      return res.status(503).json({
        success: false,
        message: 'Máy chủ AI đang quá tải, vui lòng thử lại sau giây lát.',
      });
    }

    next(err);
  }
};

// @route GET /api/chatbot/suggestions
exports.getSuggestions = async (req, res, next) => {
  try {
    const suggestions = [
      { text: '🔥 Sản phẩm bán chạy', message: 'Cho tôi xem những sản phẩm bán chạy nhất' },
      { text: '🆕 Hàng mới về', message: 'Có sản phẩm mới nào không?' },
      { text: '⭐ Sản phẩm nổi bật', message: 'Gợi ý sản phẩm nổi bật' },
      { text: '📏 Tư vấn size', message: 'Tư vấn size cho tôi' },
      { text: '🚚 Chính sách vận chuyển', message: 'Chính sách vận chuyển như thế nào?' },
      { text: '🔄 Chính sách đổi trả', message: 'Chính sách đổi trả ra sao?' },
    ];

    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
};
