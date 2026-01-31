// Variant Templates สำหรับแต่ละ Category
export interface VariantTemplate {
  categoryName: string;
  attributes: string[];
  options: Record<string, string[]>;
  examples?: string[];
}

export const VARIANT_TEMPLATES: Record<string, VariantTemplate> = {
  clothing: {
    categoryName: "เสื้อผ้า",
    attributes: ["color", "size"],
    options: {
      color: ["ขาว", "ดำ", "แดง", "น้ำเงิน", "เขียว", "เหลือง", "ชมพู", "เทา", "น้ำตาล"],
      size: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
    },
    examples: ["เสื้อยืด สีขาว ไซส์ M", "เสื้อเชิ้ต สีน้ำเงิน ไซส์ L"]
  },
  electronics: {
    categoryName: "อิเล็กทรอนิกส์",
    attributes: ["storage", "color", "ram"],
    options: {
      storage: ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
      color: ["ดำ", "ขาว", "เทา", "ทอง", "เงิน", "น้ำเงิน", "แดง"],
      ram: ["2GB", "4GB", "8GB", "16GB", "32GB", "64GB"]
    },
    examples: ["iPhone 15 Pro 256GB สีดำ", "MacBook Air M2 512GB"]
  },
  shoes: {
    categoryName: "รองเท้า",
    attributes: ["color", "size"],
    options: {
      color: ["ขาว", "ดำ", "แดง", "น้ำเงิน", "เขียว", "เทา"],
      size: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
    },
    examples: ["รองเท้าผ้าใบ สีขาว ไซส์ 42", "รองเท้าหนัง สีดำ ไซส์ 40"]
  },
  accessories: {
    categoryName: "เครื่องประดับ/อุปกรณ์เสริม",
    attributes: ["color", "material"],
    options: {
      color: ["ทอง", "เงิน", "ดำ", "น้ำตาล", "ขาว"],
      material: ["หนังแท้", "หนังเทียม", "ผ้า", "โลหะ", "พลาสติก", "ไม้"]
    },
    examples: ["กระเป๋าหนัง สีน้ำตาล หนังแท้", "สร้อยคอ สีทอง"]
  },
  books: {
    categoryName: "หนังสือ",
    attributes: ["format", "language"],
    options: {
      format: ["ปกอ่อน", "ปกแข็ง", "E-book"],
      language: ["ไทย", "อังกฤษ", "จีน", "ญี่ปุ่น"]
    },
    examples: ["หนังสือ ปกอ่อน ภาษาไทย"]
  }
};

// Attribute labels in Thai
export const ATTRIBUTE_LABELS: Record<string, string> = {
  color: "สี",
  size: "ไซส์",
  storage: "ความจุ",
  ram: "RAM",
  material: "วัสดุ",
  format: "รูปแบบ",
  language: "ภาษา"
};

// Get template by category ID or name
export function getVariantTemplate(categoryId?: number | string): VariantTemplate | null {
  // For now, return a default template
  // You can extend this to map category IDs to templates
  return null;
}

// Get suggested attributes based on product name
export function suggestVariantAttributes(productName: string): string[] {
  const lowerName = productName.toLowerCase();

  if (lowerName.includes("เสื้อ") || lowerName.includes("กางเกง") || lowerName.includes("shirt")) {
    return VARIANT_TEMPLATES.clothing.attributes;
  }

  if (lowerName.includes("iphone") || lowerName.includes("phone") || lowerName.includes("laptop") ||
      lowerName.includes("โทรศัพท์") || lowerName.includes("คอมพิวเตอร์")) {
    return VARIANT_TEMPLATES.electronics.attributes;
  }

  if (lowerName.includes("รองเท้า") || lowerName.includes("shoes")) {
    return VARIANT_TEMPLATES.shoes.attributes;
  }

  if (lowerName.includes("กระเป๋า") || lowerName.includes("สร้อย") || lowerName.includes("bag")) {
    return VARIANT_TEMPLATES.accessories.attributes;
  }

  // Default: color and size
  return ["color", "size"];
}

// Get options for an attribute
export function getAttributeOptions(attribute: string): string[] {
  // Check all templates for this attribute
  for (const template of Object.values(VARIANT_TEMPLATES)) {
    if (template.options[attribute]) {
      return template.options[attribute];
    }
  }
  return [];
}
