import React, { useState } from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {

    const { currency, router, addToCart } = useAppContext()
    const [selectedVariant, setSelectedVariant] = useState(0)

    const handleBuyNow = (e) => {
        e.stopPropagation();
        if (product.stock > 0) {
            addToCart(product._id);
            router.push('/cart');
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (product.stock > 0) {
            addToCart(product._id);
        }
    };

    const isOutOfStock = product.stock <= 0;

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className={`flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                <Image
                    src={product.images?.[selectedVariant] || product.images?.[0] || assets.upload_area}
                    alt={product.name}
                    className={`group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full ${isOutOfStock ? 'grayscale' : ''}`}
                    width={800}
                    height={800}
                />
                
                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                        Out of Stock
                    </div>
                )}
                
                {/* Stock Status Badge */}
                {!isOutOfStock && product.stock <= 5 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                        Only {product.stock} left
                    </div>
                )}
                
                <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <Image
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
                
                {/* Variant Selection Panel */}
                {product.variants && product.variants.length > 0 && !isOutOfStock && (
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                            {product.variants.map((variant, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedVariant(index);
                                    }}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                                        selectedVariant === index 
                                            ? 'border-gray-800 scale-110' 
                                            : 'border-gray-300 hover:border-gray-500'
                                    }`}
                                    style={{
                                        backgroundColor: variant.color || variant.value,
                                        backgroundImage: variant.color ? 'none' : `url(${product.images?.[index] || assets.upload_area})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                    title={variant.name || variant.value}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-base font-medium">{currency}{product.offerPrice || product.price}</p>
                <button 
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`max-sm:hidden px-4 py-1.5 text-xs rounded-full transition ${
                        isOutOfStock 
                            ? 'text-gray-400 border border-gray-300 cursor-not-allowed bg-gray-100' 
                            : 'text-gray-500 border border-gray-500/20 hover:bg-slate-50'
                    }`}
                >
                    {isOutOfStock ? 'Out of Stock' : 'Buy now'}
                </button>
            </div>
        </div>
    )
}

export default ProductCard