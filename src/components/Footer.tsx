import React from 'react';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  const handleWhatsAppClick = () => {
    const message = "Hola, necesito soporte o tengo consultas sobre el aplicativo GoodPro. ¿Podrían ayudarme?";
    const whatsappUrl = `https://wa.me/51962342328?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
              <p className="text-white font-medium">
                Good Solutions S.A.C. © 2025. Todos los Derechos Reservados.
              </p>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0 text-sm text-gray-300">
                <span>+51 962 342 328</span>
                <span>hola@goodsolutions.pe</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleWhatsAppClick}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;