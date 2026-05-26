"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiRequest, getAuthToken } from "@/lib/api";

const initialListing = {
  title: "",
  description: "",
  purpose: "rent",
  propertyType: "apartment",
  price: "",
  city: "",
  locality: "",
  address: "",
  bedrooms: "1",
  bathrooms: "1",
  areaSqFt: "",
  amenities: "",
};

async function optimizeGalleryImage(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 1024 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function uploadGalleryImage(file, signedUpload) {
  const preparedFile = await optimizeGalleryImage(file);
  const body = new FormData();
  body.append("file", preparedFile);
  body.append("api_key", signedUpload.apiKey);
  body.append("timestamp", String(signedUpload.timestamp));
  body.append("folder", signedUpload.folder);
  body.append("signature", signedUpload.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signedUpload.cloudName)}/image/upload`,
    { method: "POST", body }
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error?.message || "Unable to upload property photographs.");
  }
  return { url: result.secure_url, publicId: result.public_id };
}

export default function ListPropertyPage() {
  return (
    <Suspense fallback={<main className="interior-shell"><div className="empty-state">Preparing your listing...</div></main>}>
      <ListPropertyContent />
    </Suspense>
  );
}

function ListPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listing, setListing] = useState(() => ({
    ...initialListing,
    purpose: searchParams.get("purpose") === "sale" ? "sale" : "rent",
    propertyType: ["house", "plot"].includes(searchParams.get("propertyType"))
      ? searchParams.get("propertyType")
      : initialListing.propertyType,
  }));
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState("");
  const [access, setAccess] = useState("checking");
  const isPlot = listing.propertyType === "plot";
  const isRental = listing.purpose === "rent";

  useEffect(() => {
    let active = true;
    getAuthToken().then(async (token) => {
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const status = await apiRequest("/subscriptions/service-access");
        if (active) setAccess(status.unlocked ? "ready" : "locked");
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
          setAccess("locked");
        }
      }
    });
    return () => {
      active = false;
    };
  }, [router]);

  const update = (event) => {
    setListing({ ...listing, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!(await getAuthToken())) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    setError("");
    setSubmissionProgress(images.length ? `Preparing ${images.length} photographs...` : "Creating your listing...");

    try {
      let uploadedImages = [];
      if (images.length) {
        const signedUpload = await apiRequest("/properties/upload-signature", { method: "POST" });
        let completed = 0;
        uploadedImages = await Promise.all(images.map(async (image) => {
          const uploaded = await uploadGalleryImage(image, signedUpload);
          completed += 1;
          setSubmissionProgress(`Uploaded ${completed} of ${images.length} photographs...`);
          return uploaded;
        }));
        setSubmissionProgress("Saving your listing...");
      }
      await apiRequest("/properties", {
        method: "POST",
        body: JSON.stringify({ ...listing, uploadedImages }),
      });
      router.push("/dashboard?created=true");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
      setSubmissionProgress("");
    }
  };

  if (access === "checking") {
    return <main className="interior-shell"><div className="empty-state">Confirming your service access...</div></main>;
  }

  if (access === "locked") {
    return (
      <main className="interior-shell">
        <div className="locked-studio">
          <p className="eyebrow">Service access required</p>
          <h1>Unlock listing services for Rs. 251/- once.</h1>
          <p>Pay once on the home page to use all buying, renting, selling and plot services.</p>
          <Link className="primary-button link-button" href="/#services">Unlock services</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="interior-shell listing-studio">
      <div className="studio-heading">
        <p className="eyebrow">{isPlot ? "Land desk" : "Residence studio"}</p>
        <h1>
          {isPlot
            ? "Present your plot to visionary buyers."
            : isRental
              ? "Open your home to exceptional tenants."
              : "Introduce your residence beautifully."}
        </h1>
        <p>Curated details and gallery imagery help our team position your property for review.</p>
      </div>
      <form className={`listing-form dimensional-form ${isPlot ? "plot-form" : "house-form"}`} onSubmit={submit}>
        <div className="form-spotlight">
          <span>{isPlot ? "Plot Sale" : isRental ? "House Rental" : "House Sale"}</span>
          <strong>THEDealMaker submission</strong>
        </div>
        <div className="form-grid">
          <label className="field wide">
            <span>{isPlot ? "Plot headline" : "Residence title"}</span>
            <input name="title" required value={listing.title} onChange={update} placeholder={isPlot ? "Premium corner plot near expressway" : "Sunlit family home near Metro"} />
          </label>
          <label className="field compact-field">
            <span>For</span>
            <select name="purpose" value={listing.purpose} onChange={update}>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
            </select>
          </label>
          <label className="field compact-field">
            <span>Property type</span>
            <select name="propertyType" value={listing.propertyType} onChange={update}>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>
          <label className="field">
            <span>{isRental ? "Monthly rent (INR)" : "Expected price (INR)"}</span>
            <input name="price" type="number" min="0" required value={listing.price} onChange={update} />
          </label>
          <label className="field">
            <span>City</span>
            <input name="city" required value={listing.city} onChange={update} placeholder="Mumbai" />
          </label>
          <label className="field">
            <span>Locality</span>
            <input name="locality" required value={listing.locality} onChange={update} placeholder="Andheri West" />
          </label>
          <label className="field wide">
            <span>{isPlot ? "Plot location / landmark" : "Full address"}</span>
            <input name="address" value={listing.address} onChange={update} placeholder={isPlot ? "Road frontage, nearby landmark" : "Building and landmark"} />
          </label>
          {!isPlot && (
            <>
              <label className="field">
                <span>Bedrooms</span>
                <input name="bedrooms" type="number" min="0" value={listing.bedrooms} onChange={update} />
              </label>
              <label className="field">
                <span>Bathrooms</span>
                <input name="bathrooms" type="number" min="0" value={listing.bathrooms} onChange={update} />
              </label>
            </>
          )}
          <label className="field">
            <span>{isPlot ? "Plot area (sq.ft.)" : "Built-up area (sq.ft.)"}</span>
            <input name="areaSqFt" type="number" min="0" value={listing.areaSqFt} onChange={update} />
          </label>
          <label className="field wide">
            <span>{isPlot ? "Highlights" : "Amenities"}</span>
            <input name="amenities" value={listing.amenities} onChange={update} placeholder={isPlot ? "Corner plot, gated project, highway access" : "Parking, Gym, Security"} />
          </label>
          <label className="field wide">
            <span>{isPlot ? "Land overview" : "Property story"}</span>
            <textarea name="description" required rows="5" value={listing.description} onChange={update} placeholder={isPlot ? "Mention zoning, connectivity, boundaries and development potential." : "Describe the home, nearby places, finishes, and availability."} />
          </label>
          <label className="field wide upload-field">
            <span>{isPlot ? "Site photographs (up to 10)" : "Gallery photographs (up to 10)"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const selected = Array.from(event.target.files || []);
                if (selected.length > 10) {
                  setError("Select up to 10 gallery photographs.");
                  setImages(selected.slice(0, 10));
                  return;
                }
                setError("");
                setImages(selected);
              }}
            />
            <small>
              {images.length
                ? `${images.length} image${images.length === 1 ? "" : "s"} selected for your gallery.`
                : "Add clear photos to build your property gallery."}
            </small>
          </label>
        </div>
        {submitting && (
          <p className="submission-progress">
            {submissionProgress}
          </p>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <Link className="quiet-button link-button" href="/dashboard">Cancel</Link>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? (images.length ? "Uploading photos..." : "Submitting...") : "Submit listing"}
          </button>
        </div>
      </form>
    </main>
  );
}
