
import { useEffect } from 'react';

const HeadMeta = () => {
  useEffect(() => {
    // Set document title and meta tags
    document.title = 'CRM Pro - Sistema de Gestão Empresarial';
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'CRM moderno com chat integrado, VoIP, gestão financeira e controle de estoque');
    }
    
    // Set meta author
    const metaAuthor = document.querySelector('meta[name="author"]');
    if (metaAuthor) {
      metaAuthor.setAttribute('content', 'CRM Pro');
    }
  }, []);

  return null; // This component doesn't render anything visible
};

export default HeadMeta;
