export class WhatsAppConfig {
  static readonly PHONE_NUMBER = '919876286046';
  static readonly DISPLAY_PHONE = '+91 98762 86046';
}

/**
 * Generate WhatsApp link for general Contact Us inquiries
 */
export function getGeneralWhatsAppUrl(customMessage?: string): string {
  const defaultText =
    customMessage ||
    'Namaste Siya Ram Arts! 🙏\nI would like to inquire about your handcrafted sacred murtis and temple vigrahas.';
  return `https://wa.me/${WhatsAppConfig.PHONE_NUMBER}?text=${encodeURIComponent(defaultText)}`;
}

export interface CustomIdolParams {
  deity?: string;
  size?: string;
  material?: string;
  location?: string;
  notes?: string;
}

/**
 * Generate prebuilt structured WhatsApp link for Custom Idol inquiries
 */
export function getCustomIdolWhatsAppUrl(params: CustomIdolParams): string {
  const text = `Namaste Siya Ram Arts! 🙏

I would like to order / inquire about a Custom Handcrafted Idol:
• Deity / God Form: ${params.deity || 'Custom Swaroop'}
• Height / Size: ${params.size || 'Custom Dimensions'}
• Preferred Material: ${params.material || 'Chemical Resin / Fine Composite'}
• Delivery Location: ${params.location || 'India'}
${params.notes ? `• Specific Details: ${params.notes}\n` : ''}
Please share pricing estimation, crafting timeframe, and Vastu guidance.`;

  return `https://wa.me/${WhatsAppConfig.PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate WhatsApp link for specific product detail inquiry
 */
export function getProductInquiryWhatsAppUrl(
  productName: string,
  sku: string,
  price: number
): string {
  const text = `Namaste Siya Ram Arts! 🙏

I am interested in purchasing this sacred murti:
• Product: ${productName}
• SKU: ${sku}
• Offering Price: ₹${price.toLocaleString('en-IN')}

Please share consecration details, current stock status, and delivery timeline.`;

  return `https://wa.me/${WhatsAppConfig.PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
}
