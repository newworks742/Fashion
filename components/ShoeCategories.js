'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShoeCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/men/${params.producturl}');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.subcategories?.slice(0, 3) || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (categoryName) => {
    router.push(`/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  if (loading) return <div className="py-12"></div>;
  if (categories.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">WHEN THE GREATS DROP THEIR GUARD</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category, idx) => (
          <div 
            key={category.id || idx} 
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => handleClick(category.name || category.subcategory_name)}
          >
            <div className="aspect-[3/2] bg-gradient-to-br from-blue-100 to-green-100 relative">
              {category.image_url && (
                <img 
                  src={category.image_url} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-black text-xl font-bold bg-white px-3 py-1 inline-block">
                  {category.name || category.subcategory_name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}