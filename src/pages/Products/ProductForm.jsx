import React, { useEffect, useCallback, useState } from "react";
import Modal from "../../components/Modal.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getCategoriesByCollection } from "../../api/categories";
import { getSubCategoriesByCategoryId } from "../../api/subcategories.js";

const COLLECTION_OPTIONS = [
  { value: "SAREE", label: "Saree" },
  { value: "JEWEL", label: "Jewellery" },
];

const STATUS_OPTIONS = ["active", "inactive"];

const emptyForm = {
  name: "",
  desc: "",
  status: "active",
  price: "",
  discount: "",
  offerPrice: "",
  collection: "SAREE",
  categoryId: "",
  subcategoryId: "",
  loom: false,
  isFeatured: false,
  isNewArrival: false,
  imageFile: null,
  image_url: "",
};

const emptyVariant = {
  sku: "",
  color: "",
  fabric: "",
  price: "",
  discount: "",
  offerPrice: "",
  quantity: "",
  work: "",
  blouseLength: "",
  occasion: "",
  metal: "",
  purity: "",
  stone: "",
  weight: "",
  size: "",
  imageFile: null,
  image_url: "", // for edit mode display
};

export default function ProductForm({
  product,
  categories: categoriesProp,
  onClose,
  onSaved,
}) {
  const toast = useToast();
  // ✅ Default to empty array if subcategories is undefined/null
  const { subcategories = [], addProduct, editProduct } = useData();
  const isEdit = !!product;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [expandedVariant, setExpandedVariant] = useState(0);
  const [collectionCategories, setCollectionCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);

  // Fetch categories whenever collection changes — same as AddInventory.
  const fetchCategoriesForCollection = useCallback(async (col) => {
    if (!col) return;
    setCategoriesLoading(true);
    try {
      const data = await getCategoriesByCollection(col);
      // ✅ Ensure data is always an array
      setCollectionCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to fetch categories for collection:", err);
      setCollectionCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch categories whenever Category changes — same as AddInventory.
  const fetchCategoriesForCategoryId = useCallback(async (id) => {
    if (!id) return;
    setSubCategoriesLoading(true);
    try {
      const data = await getSubCategoriesByCategoryId(id);
      setSubCategories(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to fetch subcategories for category:", err);
      setSubCategories([]);
    } finally {
      setSubCategoriesLoading(false);
    }
  }, []);

  // Initial load / edit-mode hydration
  useEffect(() => {
    if (isEdit && product) {
      const existingCollection = product.collection || "SAREE";
      setForm({
        name: product.name || "",
        desc: product.desc || product.description || "",
        status: product.status || "active",
        price: product.price || "",
        discount: product.discount ?? "",
        offerPrice: product.offerPrice ?? "",
        collection: existingCollection,
        categoryId: product.categoryId ?? "",
        subcategoryId: product.subcategoryId ?? "",
        loom: Boolean(product.loom),
        isFeatured: Boolean(product.isFeatured),
        isNewArrival: Boolean(product.isNewArrival),
        imageFile: null,
        image_url: product.image_url || "",
      });
      fetchCategoriesForCollection(existingCollection);

      if (product.categoryId) {
        fetchCategoriesForCategoryId(product.categoryId);
      }

      if (product.attributes && product.attributes.length > 0) {
        setVariants(
          product.attributes.map((attr) => ({
            sku: attr.sku || "",
            color: attr.color || "",
            fabric: attr.fabric || "",
            price: attr.price || "",
            discount: attr.discount ?? "",
            offerPrice: attr.offerPrice ?? "",
            quantity: attr.quantity ?? "",
            work: attr.work || "",
            blouseLength: attr.blouseLength || "",
            occasion: attr.occasion || "",
            metal: attr.metal || "",
            purity: attr.purity || "",
            stone: attr.stone || "",
            weight: attr.weight || "",
            size: attr.size || "",
            imageFile: null,
            image_url: attr.image_url || "",
          })),
        );
      }
    } else {
      fetchCategoriesForCollection("SAREE");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, product]);

  const calculateDiscount = (price, offerPrice) => {
    const p = parseFloat(price);
    const op = parseFloat(offerPrice);

    if (isNaN(p) || isNaN(op) || p <= 0 || op >= p) {
      return 0;
    }

    return Number((((p - op) / p) * 100).toFixed(2));
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "checkbox" ? checked : type === "file" ? files[0] : value,
        ...(name === "categoryId" ? { subcategoryId: "" } : {}),
        ...(name === "collection" ? { categoryId: "", subcategoryId: "" } : {}),
      };

      // Auto calculate discount
      if (name === "price" || name === "offerPrice") {
        updated.discount = calculateDiscount(
          name === "price" ? value : updated.price,
          name === "offerPrice" ? value : updated.offerPrice,
        );
      }

      return updated;
    });

    if (name === "collection" && value) {
      fetchCategoriesForCollection(value);
      setSubCategories([]);
    }

    if (name === "categoryId" && value) {
      fetchCategoriesForCategoryId(value);
    }
  };

  const handleVariantChange = (index, fieldName, value) => {
    setVariants((prev) => {
      const next = [...prev];

      next[index] = {
        ...next[index],
        [fieldName]: value,
      };

      if (fieldName === "price" || fieldName === "offerPrice") {
        next[index].discount = calculateDiscount(
          fieldName === "price" ? value : next[index].price,
          fieldName === "offerPrice" ? value : next[index].offerPrice,
        );
      }

      return next;
    });
  };

  const handleVariantImageChange = (index, file) => {
    const next = [...variants];
    next[index] = { ...next[index], imageFile: file };
    setVariants(next);
  };

  const removeVariantImage = (index) => {
    const next = [...variants];
    next[index] = { ...next[index], imageFile: null };
    setVariants(next);
  };

  const addVariant = () => {
    setVariants([...variants, { ...emptyVariant }]);
    setExpandedVariant(variants.length);
  };

  const removeVariant = (index) => {
    if (variants.length <= 1) {
      toast.error("You must have at least 1 variant!");
      return;
    }
    const next = variants.filter((_, i) => i !== index);
    setVariants(next);
    if (expandedVariant >= next.length) {
      setExpandedVariant(next.length - 1);
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Product name is required");
    // if (!form.price) return setError('Price is required');
    // if (!form.offerPrice) return setError('Offer Price is required');
    if (!form.categoryId) return setError("Category is required");
    const hasInvalidPrice = variants.some(
      (v) => !v.price || Number(v.price) <= 0,
    );

    if (hasInvalidPrice) {
      return setError("Price is required for every variant");
    }

    const hasInvalidOfferPrice = variants.some(
      (v) => !v.offerPrice || Number(v.offerPrice) <= 0,
    );

    if (hasInvalidOfferPrice) {
      return setError("Offer Price is required for every variant");
    }
    if (variants.length === 0)
      return setError("At least one variant is required");

    const hasValidVariants = variants.every(
      (v) => v.sku?.trim() || v.color?.trim(),
    );
    if (!hasValidVariants)
      return setError("Each variant must have at least SKU or Color");

    if (!isEdit) {
      const hasAtLeastOneImage = variants.some((v) => v.imageFile);
      if (!hasAtLeastOneImage)
        return setError("At least one variant must have an image uploaded");
    } else {
      const hasImageCoverage = variants.every(
        (v) => v.imageFile || v.image_url,
      );
      if (!hasImageCoverage)
        return setError(
          "Each variant must have an image (existing or newly uploaded)",
        );
    }

    setSaving(true);
    try {
      const collection = form.collection || "SAREE";

      if (isEdit) {
        const hasNewImages =
          variants.some((v) => v.imageFile) || form.imageFile;

        if (hasNewImages) {
          const formData = new FormData();
          formData.append("name", form.name);
          formData.append("desc", form.desc);
          formData.append("status", form.status);
          formData.append("price", form.price);
          formData.append("discount", form.discount || 0);
          formData.append("offerPrice", form.offerPrice || "");
          formData.append("categoryId", form.categoryId || "");
          formData.append("subcategoryId", form.subcategoryId || "");
          formData.append("collection", collection);
          formData.append("loom", form.loom);
          formData.append("isFeatured", form.isFeatured);
          formData.append("isNewArrival", form.isNewArrival);
          if (form.imageFile) formData.append("mainImage", form.imageFile);

          formData.append(
            "variants",
            JSON.stringify(
              variants.map((v) => ({
                sku: v.sku || null,
                color: v.color || null,
                fabric: v.fabric || null,
                price: v.price || 0,
                offerPrice: v.offerPrice || null,
                discount: v.discount || null,
                quantity: v.quantity || null,
                work: v.work || null,
                blouseLength: v.blouseLength || null,
                occasion: v.occasion || null,
                metal: v.metal || null,
                purity: v.purity || null,
                stone: v.stone || null,
                weight: v.weight || null,
                size: v.size || null,
                image_url: v.image_url || null,
                hasNewImage: Boolean(v.imageFile),
              })),
            ),
          );

          variants.forEach((v) => {
            if (v.imageFile) formData.append("variantImages", v.imageFile);
          });

          await editProduct(product.id, formData);
        } else {
          const payload = {
            name: form.name,
            desc: form.desc,
            status: form.status,
            price: form.price,
            discount: form.discount || 0,
            offerPrice: form.offerPrice || null,
            categoryId: form.categoryId || null,
            subcategoryId: form.subcategoryId || null,
            collection,
            loom: form.loom,
            isFeatured: form.isFeatured,
            isNewArrival: form.isNewArrival,
            variants: variants.map((v) => ({
              sku: v.sku || null,
              color: v.color || null,
              fabric: v.fabric || null,
              price: v.price || 0,
              offerPrice: v.offerPrice || null,
              discount: v.discount || null,
              quantity: v.quantity || null,
              work: v.work || null,
              blouseLength: v.blouseLength || null,
              occasion: v.occasion || null,
              metal: v.metal || null,
              purity: v.purity || null,
              stone: v.stone || null,
              weight: v.weight || null,
              size: v.size || null,
              image_url: v.image_url || null,
            })),
          };

          await editProduct(product.id, payload);
        }
        toast.success("Product updated");
      } else {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("desc", form.desc);
        formData.append("status", form.status);
        formData.append("price", form.price);
        formData.append("discount", form.discount || 0);
        formData.append("offerPrice", form.offerPrice || "");
        formData.append("categoryId", form.categoryId);
        formData.append("subcategoryId", form.subcategoryId || "");
        formData.append("collection", collection);
        formData.append("loom", form.loom);
        formData.append("isFeatured", form.isFeatured);
        formData.append("isNewArrival", form.isNewArrival);
        if (form.imageFile) formData.append("mainImage", form.imageFile);

        formData.append(
          "variants",
          JSON.stringify(
            variants.map((v) => ({
              sku: v.sku || null,
              color: v.color || null,
              fabric: v.fabric || null,
              price: v.price || 0,
              offerPrice: v.offerPrice || null,
              discount: v.discount || null,
              work: v.work || null,
              blouseLength: v.blouseLength || null,
              occasion: v.occasion || null,
              metal: v.metal || null,
              purity: v.purity || null,
              stone: v.stone || null,
              weight: v.weight || null,
              size: v.size || null,
              quantity: v.quantity || null,
              hasImage: Boolean(v.imageFile),
            })),
          ),
        );

        variants.forEach((variant) => {
          if (variant.imageFile)
            formData.append("variantImages", variant.imageFile);
        });

        await addProduct(formData);
        toast.success("Product created");
      }

      onSaved();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't save this product. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit product" : "Add product"}
      onClose={onClose}
      width="760px"
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}

        <div className="field-row">
          <div className="field">
            <label>
              Status <span className="hint">*</span>
            </label>
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>
              Collection <span className="hint">*</span>
            </label>
            <select
              name="collection"
              value={form.collection}
              onChange={handleChange}
            >
              {COLLECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>
              Category <span className="hint">*</span>
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading
                  ? "Loading…"
                  : collectionCategories.length === 0
                    ? `No categories for ${form.collection}`
                    : "Select category"}
              </option>
              {collectionCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.category}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>
              Sub-Category <span className="hint">*</span>
            </label>
            <select
              name="subcategoryId"
              value={form.subcategoryId}
              onChange={handleChange}
              disabled={!form.categoryId}
            >
              <option value="">
                {!form.categoryId
                  ? "Select a category first"
                  : "Select subcategory"}
              </option>
              {/* ✅ Safe mapping - filteredSubcategories is always an array */}
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>
            Product name <span className="hint">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Kanjivaram Silk Saree — Emerald"
          />
        </div>

        <div className="field">
          <label>
            Description <span className="hint">*</span>
          </label>
          <textarea
            name="desc"
            value={form.desc}
            onChange={handleChange}
            placeholder="Weave, occasion, care notes…"
          />
        </div>

        <div className="field-row-3">
          <div className="field">
            <label>Price (₹) </label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Offer price (₹)</label>
            <input
              name="offerPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.offerPrice}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>Discount (%)</label>
            <input
              name="discount"
              type="number"
              min="0"
              step="0.01"
              value={form.discount}
              onChange={handleChange}
              readOnly
            />
          </div>
        </div>

        <div className="field-row">
          <div className="checkbox-row">
            <input
              id="loom"
              type="checkbox"
              name="loom"
              checked={form.loom}
              onChange={handleChange}
            />
            <label htmlFor="loom" style={{ marginBottom: 0 }}>
              Loom-produced item
            </label>
          </div>
          <div className="checkbox-row">
            <input
              id="isFeatured"
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            <label htmlFor="isFeatured" style={{ marginBottom: 0 }}>
              Featured
            </label>
          </div>
          <div className="checkbox-row">
            <input
              id="isNewArrival"
              type="checkbox"
              name="isNewArrival"
              checked={form.isNewArrival}
              onChange={handleChange}
            />
            <label htmlFor="isNewArrival" style={{ marginBottom: 0 }}>
              New arrival
            </label>
          </div>
        </div>

        <div className="field">
          <label>Main image (Optional)</label>
          {isEdit && form.image_url && !form.imageFile && (
            <img
              src={form.image_url}
              alt="Current"
              style={{ maxWidth: 120, borderRadius: 8, marginBottom: 8 }}
            />
          )}
          {form.imageFile && (
            <img
              src={URL.createObjectURL(form.imageFile)}
              alt="Preview"
              style={{ maxWidth: 120, borderRadius: 8, marginBottom: 8 }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, imageFile: e.target.files[0] }))
            }
          />
        </div>

        <div className="field">
          <div
            className="field-row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <label style={{ marginBottom: 0 }}>
              Color variants & SKUs ({variants.length})
            </label>
            <button
              type="button"
              className="btn btn-outline"
              onClick={addVariant}
            >
              + Add variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div
              key={index}
              className="variant-item"
              style={{
                border: "1px solid var(--border, #e5e5e5)",
                borderRadius: 8,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  setExpandedVariant(expandedVariant === index ? -1 : index)
                }
              >
                <span>
                  Variant {index + 1}
                  {variant.color && ` • ${variant.color}`}
                  {variant.sku && ` • SKU: ${variant.sku}`}
                </span>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVariant(index);
                  }}
                >
                  Remove
                </button>
              </div>

              {expandedVariant === index && (
                <div style={{ padding: "0 12px 12px" }}>
                  <div className="field-row">
                    <div className="field">
                      <label>
                        SKU <span className="hint">*</span>
                      </label>
                      <input
                        value={variant.sku}
                        onChange={(e) =>
                          handleVariantChange(index, "sku", e.target.value)
                        }
                        placeholder="e.g. SKU-001-RED"
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>
                        Price <span className="hint">*</span>
                      </label>
                      <input
                        value={variant.price}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) =>
                          handleVariantChange(index, "price", e.target.value)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="field">
                      <label>
                        Offer price <span className="hint">*</span>
                      </label>
                      <input
                        value={variant.offerPrice}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "offerPrice",
                            e.target.value,
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>
                        Discount <span className="hint">*</span>
                      </label>
                      <input
                        value={variant.discount}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) =>
                          handleVariantChange(index, "discount", e.target.value)
                        }
                        placeholder="0.00 %"
                        readOnly
                      />
                    </div>
                    <div className="field">
                      <label>
                        Quantity <span className="hint">*</span>
                      </label>
                      <input
                        value={variant.quantity}
                        type="number"
                        min="0"
                        step="1"
                        onChange={(e) =>
                          handleVariantChange(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label>Size</label>
                      <input
                        value={variant.size}
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                        placeholder="e.g. M, L, One Size"
                      />
                    </div>
                    <div className="field">
                      <label>Occasion</label>
                      <input
                        value={variant.occasion}
                        onChange={(e) =>
                          handleVariantChange(index, "occasion", e.target.value)
                        }
                        placeholder="e.g. Wedding"
                      />
                    </div>
                  </div>

                  {form.collection === "SAREE" && (
                    <>
                      <div className="field-row">
                        <div className="field">
                          <label>Fabric</label>
                          <input
                            value={variant.fabric}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "fabric",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Pure Silk"
                          />
                        </div>
                        <div className="field">
                          <label>Work / weave</label>
                          <input
                            value={variant.work}
                            onChange={(e) =>
                              handleVariantChange(index, "work", e.target.value)
                            }
                            placeholder="e.g. Zari"
                          />
                        </div>
                      </div>

                      <div className="field-row">
                        <div className="field">
                          <label>Blouse length</label>
                          <input
                            value={variant.blouseLength}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "blouseLength",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. 30cm"
                          />
                        </div>
                        <div className="field">
                          <label>Weight</label>
                          <input
                            value={variant.weight}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "weight",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. 500g"
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label>Color</label>
                        <input
                          value={variant.color}
                          onChange={(e) =>
                            handleVariantChange(index, "color", e.target.value)
                          }
                          placeholder="e.g. Midnight Red"
                        />
                      </div>
                    </>
                  )}

                  {form.collection === "JEWEL" && (
                    <>
                      <div className="field-row">
                        <div className="field">
                          <label>Purity</label>
                          <input
                            value={variant.purity}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "purity",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. 22K"
                          />
                        </div>
                        <div className="field">
                          <label>Weight</label>
                          <input
                            value={variant.weight}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "weight",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. 500g"
                          />
                        </div>
                      </div>

                      <div className="field-row">
                        <div className="field">
                          <label>Metal</label>
                          <input
                            value={variant.metal}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "metal",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Gold"
                          />
                        </div>
                        <div className="field">
                          <label>Stone / gemstone</label>
                          <input
                            value={variant.stone}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "stone",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Diamond"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="field">
                    <label>
                      Variant image <span className="hint">*</span>
                    </label>
                    {isEdit && variant.image_url && !variant.imageFile && (
                      <img
                        src={variant.image_url}
                        alt="Current"
                        style={{
                          maxWidth: 100,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      />
                    )}
                    {variant.imageFile && (
                      <>
                        <img
                          src={URL.createObjectURL(variant.imageFile)}
                          alt="Preview"
                          style={{
                            maxWidth: 100,
                            borderRadius: 8,
                            marginBottom: 8,
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => removeVariantImage(index)}
                        >
                          Undo
                        </button>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleVariantImageChange(index, e.target.files[0])
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
