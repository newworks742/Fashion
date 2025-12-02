// ==================== GenderCategories.jsx ====================
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GenderCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (categoryName) => {
    router.push(`/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  if (loading) return <div className="py-12"></div>;
  if (categories.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-6">
        {categories.slice(0, 2).map((category, idx) => (
          <div 
            key={category.id || idx} 
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => handleClick(category.name || category.category_name)}
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-pink-100 relative">
              {category.image_url && (
                <img 
                  src={category.image_url} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white text-2xl font-bold bg-black px-4 py-2 inline-block">
                  {category.name || category.category_name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}