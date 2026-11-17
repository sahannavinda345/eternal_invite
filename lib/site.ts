/** Business details shown on the public site. Change these to your own. */
export const SITE = {
  name: "Eternal Chapter",
  // WhatsApp number for enquiries, international format without + or spaces (e.g. 94771234567)
  whatsapp: "94759592158",
  whatsappMessage: "Hi Eternal Chapter, I'd like a digital wedding invitation.",
};

export function whatsappLink(text = SITE.whatsappMessage) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
