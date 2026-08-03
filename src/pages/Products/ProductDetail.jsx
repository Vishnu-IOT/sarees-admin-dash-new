import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../../components/Topbar.jsx';
import Badge from '../../components/Badge.jsx';
import { Loader } from '../../components/Loader.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import ProductForm from './ProductForm.jsx';
import { formatCurrency, formatDate } from '../../utils/format';
import {
    IconChevronLeft,
    IconEdit,
    IconTrash,
    IconHeart,
    IconShare2,
    IconCheck,
} from '../../components/icons.jsx';
import { getProductById } from '../../api/products.js';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { products, looms, removeProduct, editProduct, fetchProducts } = useData();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAttributeIndex, setSelectedAttributeIndex] = useState(0);
    const [showEditForm, setShowEditForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadProduct() {
            setLoading(true);
            const res = await getProductById(id);
            setProduct(res.data);
            setLoading(false);
        }
        loadProduct();
    }, [id]);

    const isLoomProduct = looms?.some((l) => String(l.id) === String(id));

    // 🎯 Get attribute-specific attributes based on collection
    const getAttributeFields = (collection) => {
        const collectionLower = collection?.toLowerCase() || '';

        // 💎 Jewelry attributes
        if (collectionLower.includes('jewel') || collectionLower.includes('earring') || collectionLower.includes('necklace')) {
            return ['metal', 'purity', 'stone', 'weight', 'occasion', 'size'];
        }

        // 👗 Saree attributes
        if (collectionLower.includes('saree')) {
            return ['color', 'fabric', 'work', 'blouseLength', 'weight', 'occasion', 'size'];
        }

        // 👔 Shirt/General attributes
        return ['color', 'fabric', 'size', 'weight'];
    };

    const handleEdit = () => {
        setShowEditForm(true);
    };

    const handleEditSave = async () => {
        setShowEditForm(false);
        await fetchProducts(1, 10, 'ALL');
        toast.success('Product updated');
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await removeProduct(id);
            toast.success('Product deleted');
            navigate('/products');
        } catch (err) {
            toast.error(err.message || 'Failed to delete product');
        } finally {
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    if (loading) {
        return (
            <>
                <Topbar eyebrow="Catalogue" title="Product" />
                <div className="page">
                    <Loader />
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Topbar eyebrow="Catalogue" title="Product" />
                <div className="page">
                    <button className="back-link" onClick={() => navigate('/products')}>
                        <IconChevronLeft /> Back to products
                    </button>
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: 16 }}>Product not found</p>
                    </div>
                </div>
            </>
        );
    }

    // 🎯 Selected attribute (variant)
    const selectedAttribute = product.attributes[selectedAttributeIndex];
    const primaryImage = selectedAttribute?.image_url || product.image_url;

    // 💰 Get price from attribute or fallback to product price
    const displayPrice = selectedAttribute?.price || product.price;
    const displayOfferPrice = selectedAttribute?.offerPrice || product.offerPrice;
    const displayDiscount = selectedAttribute?.discount || product.discount;
    const displayQuantity = selectedAttribute?.quantity ?? 0;

    // 🏷️ Get attributes to display based on collection
    const attributeFields = getAttributeFields(product.collection);

    return (
        <>
            <Topbar eyebrow="Catalogue" title={product.name || 'Product'} />
            <div className="page">
                <button className="back-link" onClick={() => navigate('/products')}>
                    <IconChevronLeft /> Back to products
                </button>

                <div className="product-detail-container">
                    {/* Image Gallery */}
                    <div className="product-detail-gallery">
                        <div className="product-detail-main-image">
                            {primaryImage ? (
                                <img src={primaryImage} alt={product.name} />
                            ) : (
                                <div className="product-detail-no-image">No image</div>
                            )}
                            {isLoomProduct && (
                                <div className="product-detail-loom-badge">
                                    <span>Direct-from-Loom</span>
                                </div>
                            )}
                        </div>

                        {/* Attribute Variants as Thumbnails */}
                        {product.attributes.length > 1 && (
                            <div className="product-detail-thumbnails">
                                {product.attributes.map((attr, idx) => (
                                    <button
                                        key={idx}
                                        className={`product-detail-thumbnail ${selectedAttributeIndex === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedAttributeIndex(idx)}
                                        title={`${attr.color || attr.metal || 'Variant'} ${idx + 1}`}
                                    >
                                        {attr.image_url ? (
                                            <img src={attr.image_url} alt={`Variant ${idx + 1}`} />
                                        ) : (
                                            <div className="product-detail-no-thumbnail">V{idx + 1}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-detail-info">
                        <div className="product-detail-header">
                            <div>
                                <h1 className="product-detail-title">{product.name}</h1>
                                <p className="product-detail-sku">SKU: {selectedAttribute?.sku || product.id}</p>
                            </div>
                            <div className="product-detail-actions">
                                <button className="icon-btn" title="Add to favorites" aria-label="Favorite">
                                    <IconHeart />
                                </button>
                                <button className="icon-btn" title="Share" aria-label="Share">
                                    <IconShare2 />
                                </button>
                                <button className="icon-btn" onClick={handleEdit} title="Edit" aria-label="Edit">
                                    <IconEdit />
                                </button>
                                <button className="icon-btn danger" onClick={() => setConfirmDelete(true)} title="Delete" aria-label="Delete">
                                    <IconTrash />
                                </button>
                            </div>
                        </div>

                        {/* Price Section - From Attribute */}
                        <div className="product-detail-pricing">
                            <div className="product-detail-price-group">
                                <span className="product-detail-label">Price</span>
                                <div className="product-detail-price">
                                    {displayOfferPrice ? (
                                        <>
                                            <span className="product-detail-sale-price">{formatCurrency(displayOfferPrice)}</span>
                                            <span className="product-detail-original-price">{formatCurrency(displayPrice)}</span>
                                        </>
                                    ) : (
                                        <span className="product-detail-sale-price">{formatCurrency(displayPrice)}</span>
                                    )}
                                </div>
                            </div>

                            {displayOfferPrice && (
                                <div className="product-detail-discount-badge">
                                    {Math.round(((displayPrice - displayOfferPrice) / displayPrice) * 100)}% OFF
                                </div>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="product-detail-stock">
                            <span className="product-detail-label">Stock Status</span>
                            <div className="product-detail-stock-display">
                                {displayQuantity > 0 ? (
                                    <>
                                        <div className="product-detail-stock-badge in-stock">
                                            <IconCheck />
                                            In Stock
                                        </div>
                                        <span className="product-detail-stock-count">{displayQuantity} available</span>
                                    </>
                                ) : (
                                    <div className="product-detail-stock-badge out-of-stock">Out of Stock</div>
                                )}
                            </div>
                        </div>

                        {/* Variant Selection */}
                        {product.attributes.length > 1 && (
                            <div className="product-detail-variants-section">
                                <h3 className="product-detail-section-title">Available Variants</h3>
                                <div className="product-detail-variants-list">
                                    {product.attributes.map((attr, idx) => (
                                        <button
                                            key={idx}
                                            className={`product-detail-variant-item ${selectedAttributeIndex === idx ? 'active' : ''}`}
                                            onClick={() => setSelectedAttributeIndex(idx)}
                                        >
                                            <div className="variant-preview">
                                                {attr.image_url && (
                                                    <img src={attr.image_url} alt={`Variant ${idx + 1}`} />
                                                )}
                                            </div>
                                            <div className="variant-details">
                                                <div className="variant-name">
                                                    {attr.color && <span className="variant-color">{attr.color}</span>}
                                                    {attr.metal && <span className="variant-metal">{attr.metal}</span>}
                                                </div>
                                                {attr.size && <div className="variant-size">Size: {attr.size}</div>}
                                                <div className="variant-price">
                                                    {formatCurrency(attr.offerPrice || attr.price)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attribute Details Grid - Collection Specific */}
                        {selectedAttribute && (
                            <div className="product-detail-attribute-section">
                                <h3 className="product-detail-section-title">Variant Details</h3>
                                <div className="product-detail-details-grid">
                                    {attributeFields.map((field) => {
                                        const value = selectedAttribute[field];
                                        if (!value) return null;

                                        return (
                                            <div className="product-detail-detail-item" key={field}>
                                                <span className="product-detail-label">
                                                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                                                </span>
                                                <span className="product-detail-value">{value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Static Details Grid */}
                        <div className="product-detail-details-grid">
                            <div className="product-detail-detail-item">
                                <span className="product-detail-label">Status</span>
                                <Badge value={product.status || 'active'} />
                            </div>
                            <div className="product-detail-detail-item">
                                <span className="product-detail-label">Collection</span>
                                <span className="product-detail-value">{product.collection || 'All Products'}</span>
                            </div>
                            <div className="product-detail-detail-item">
                                <span className="product-detail-label">Category</span>
                                <span className="product-detail-value">{product.category.name || '—'}</span>
                            </div>
                            <div className="product-detail-detail-item">
                                <span className="product-detail-label">Subcategory</span>
                                <span className="product-detail-value">{product.subcategory.name || '—'}</span>
                            </div>
                        </div>

                        {/* Description */}
                        {product.desc && (
                            <div className="product-detail-description-section">
                                <h3 className="product-detail-section-title">Description</h3>
                                <p className="product-detail-description">{product.desc}</p>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="product-detail-metadata">
                            <div className="product-detail-metadata-item">
                                <span className="product-detail-metadata-label">Created</span>
                                <span className="product-detail-metadata-value">{formatDate(product.createdAt)}</span>
                            </div>
                            <div className="product-detail-metadata-item">
                                <span className="product-detail-metadata-label">Last Updated</span>
                                <span className="product-detail-metadata-value">{formatDate(product.updatedAt)}</span>
                            </div>
                            {product.isNewArrival && (
                                <div className="product-detail-metadata-item">
                                    <span className="product-detail-metadata-label">Status</span>
                                    <span className="product-detail-metadata-badge">New Arrival</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form Modal */}
            {showEditForm && (
                <ProductForm
                    product={product}
                    onSaved={handleEditSave}
                    onClose={() => setShowEditForm(false)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {confirmDelete && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog-content">
                        <h3>Delete Product</h3>
                        <p>Are you sure you want to delete "{product.name}"? This action cannot be undone.</p>
                        <div className="confirm-dialog-actions">
                            <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}