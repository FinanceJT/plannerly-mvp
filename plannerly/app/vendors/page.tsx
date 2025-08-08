"use client";

import React, { useState } from "react";
import VendorCard from "../components/VendorCard";

// Defines the structure of a vendor record used by the management interface.
interface ManagedVendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  estimatedPrice?: string;
  distance?: string;
  topReviews?: string[];
  explanation?: string;
  isFavorite: boolean;
  isRejected: boolean;
  notes: string;
}

/**
 * A vendor management page that allows users to view all discovered vendors,
 * filter them by name or category, mark favorites/rejected vendors, add notes,
 * and compare selected vendors side by side. Users can also manually add
 * vendors to the list if they have discovered a vendor outside of the search
 * interface. The compare mode simply shows checkboxes next to each vendor
 * and allows toggling selection for comparison.
 */
export default function VendorManagementPage() {
  const [vendors, setVendors] = useState<ManagedVendor[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newVendor, setNewVendor] = useState<Omit<ManagedVendor, "id" | "isFavorite" | "isRejected" | "notes">>({
    name: "",
    category: "",
    rating: 0,
    reviewCount: 0,
    estimatedPrice: "",
    distance: "",
    topReviews: [],
    explanation: ""
  });
  const [newVendorNotes, setNewVendorNotes] = useState<string>("");

  // Filters vendors based on the search term across name and category.
  const filteredVendors = vendors.filter((v) => {
    const term = filter.toLowerCase();
    return (
      v.name.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term)
    );
  });

  // Toggles the favorite status for a vendor.
  function toggleFavorite(id: string) {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, isFavorite: !v.isFavorite } : v
      )
    );
  }

  // Toggles the rejection status for a vendor.
  function toggleReject(id: string) {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, isRejected: !v.isRejected } : v
      )
    );
  }

  // Updates notes for a vendor.
  function updateNotes(id: string, notes: string) {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, notes } : v))
    );
  }

  // Handles selection/deselection in compare mode.
  function handleSelect(id: string) {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  // Adds a new vendor based on the form inputs.
  function addVendor() {
    if (!newVendor.name || !newVendor.category) return;
    const id = Date.now().toString();
    const vendor: ManagedVendor = {
      id,
      name: newVendor.name,
      category: newVendor.category,
      rating: newVendor.rating,
      reviewCount: newVendor.reviewCount,
      estimatedPrice: newVendor.estimatedPrice,
      distance: newVendor.distance,
      topReviews: newVendor.topReviews,
      explanation: newVendor.explanation,
      isFavorite: false,
      isRejected: false,
      notes: newVendorNotes
    };
    setVendors((prev) => [...prev, vendor]);
    // Reset the form fields after adding a vendor.
    setNewVendor({
      name: "",
      category: "",
      rating: 0,
      reviewCount: 0,
      estimatedPrice: "",
      distance: "",
      topReviews: [],
      explanation: ""
    });
    setNewVendorNotes("");
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Vendor Management</h1>
      {/* Search and compare controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <input
          type="text"
          className="border border-gray-300 rounded p-2 flex-grow"
          placeholder="Search vendors by name or category"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setCompareMode((prev) => !prev)}
        >
          {compareMode ? "Exit Compare Mode" : "Compare Vendors"}
        </button>
      </div>
      {/* Vendor list */}
      {filteredVendors.length === 0 ? (
        <p className="text-gray-600">No vendors found. Try adjusting your search or add a vendor below.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map((v) => (
            <div key={v.id} className="border rounded p-4 relative">
              {compareMode && (
                <input
                  type="checkbox"
                  className="absolute top-2 left-2"
                  checked={selected.has(v.id)}
                  onChange={() => handleSelect(v.id)}
                />
              )}
              <VendorCard
                id={v.id}
                name={v.name}
                photoUrl={undefined}
                rating={v.rating}
                reviewCount={v.reviewCount}
                estimatedPrice={v.estimatedPrice}
                distance={v.distance}
                topReviews={v.topReviews}
                explanation={v.explanation ?? v.notes}
                onSelect={() => toggleFavorite(v.id)}
                onReject={() => toggleReject(v.id)}
              />
              {/* Notes section */}
              <div className="mt-2">
                <textarea
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Add notes..."
                  value={v.notes}
                  onChange={(e) => updateNotes(v.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Manual vendor addition form */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Add a Vendor Manually</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded p-2"
            placeholder="Vendor name"
            value={newVendor.name}
            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
          />
          <input
            type="text"
            className="border border-gray-300 rounded p-2"
            placeholder="Category"
            value={newVendor.category}
            onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
          />
          <input
            type="number"
            className="border border-gray-300 rounded p-2"
            placeholder="Rating (0-5)"
            value={newVendor.rating}
            min={0}
            max={5}
            step={0.1}
            onChange={(e) => setNewVendor({ ...newVendor, rating: parseFloat(e.target.value) || 0 })}
          />
          <input
            type="number"
            className="border border-gray-300 rounded p-2"
            placeholder="Review count"
            value={newVendor.reviewCount}
            onChange={(e) => setNewVendor({ ...newVendor, reviewCount: parseInt(e.target.value) || 0 })}
          />
          <input
            type="text"
            className="border border-gray-300 rounded p-2"
            placeholder="Estimated price"
            value={newVendor.estimatedPrice}
            onChange={(e) => setNewVendor({ ...newVendor, estimatedPrice: e.target.value })}
          />
          <input
            type="text"
            className="border border-gray-300 rounded p-2"
            placeholder="Distance"
            value={newVendor.distance}
            onChange={(e) => setNewVendor({ ...newVendor, distance: e.target.value })}
          />
          {/* Note input for manual vendor */}
          <textarea
            className="border border-gray-300 rounded p-2 col-span-full"
            placeholder="Notes about this vendor"
            value={newVendorNotes}
            onChange={(e) => setNewVendorNotes(e.target.value)}
          />
        </div>
        <button
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          onClick={addVendor}
        >
          Add Vendor
        </button>
      </div>
      {/* Compare display (if compare mode and at least two selected vendors) */}
      {compareMode && selected.size >= 2 && (
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Compare Selected Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...selected].map((id) => {
              const v = vendors.find((vendor) => vendor.id === id);
              if (!v) return null;
              return (
                <VendorCard
                  key={v.id}
                  id={v.id}
                  name={v.name}
                  photoUrl={undefined}
                  rating={v.rating}
                  reviewCount={v.reviewCount}
                  estimatedPrice={v.estimatedPrice}
                  distance={v.distance}
                  topReviews={v.topReviews}
                  explanation={v.explanation ?? v.notes}
                  onSelect={() => toggleFavorite(v.id)}
                  onReject={() => toggleReject(v.id)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
