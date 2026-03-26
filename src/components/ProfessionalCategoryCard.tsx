import { useState, useEffect } from 'react';
import { getCategoryImage } from '../services/professionals';

interface ProfessionalCategoryCardProps {
  category: {
    id: string;
    name: string;
    emoji: string;
  };
  onClick: () => void;
}

export function ProfessionalCategoryCard({
  category,
  onClick,
}: ProfessionalCategoryCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Try to load category image
    getCategoryImage(category.id).then((url) => {
      if (url) setImageUrl(url);
    });
  }, [category.id]);

  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-md overflow-hidden hover:border-[#CDFF00] transition-colors group"
    >
      {/* Image Section */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{category.emoji}</span>
          </div>
        )}
      </div>

      {/* Category Name */}
      <div className="p-3">
        <p className="text-sm font-semibold text-black text-center">
          {category.name}
        </p>
      </div>
    </button>
  );
}
