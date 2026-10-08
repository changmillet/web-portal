"use client";
/* oxlint-disable next/no-img-element -- Preserve supplied brand bytes and aspect ratio; failure retains this site's text identity. */
import { useState } from "react";

/** @import import { AtlasLogo } from "@/sites/atlas/logo"; */
export function AtlasLogo({
  lightLogo = "/brand/atlas/logo.png",
  darkLogo = "/brand/atlas/logo.png",
  width = 257,
  height = 87,
  label = "Atlas",
}: {
  lightLogo?: string;
  darkLogo?: string;
  width?: number;
  height?: number;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="atlas-logo">
      <span className="sr-only">{label}</span>
      {failed ? (
        <span className="atlas-logo-fallback" aria-hidden="true">
          {label}
        </span>
      ) : (
        <>
          <img
            className="atlas-logo-light"
            src={lightLogo}
            width={width}
            height={height}
            alt=""
            onError={() => setFailed(true)}
          />
          <img
            className="atlas-logo-dark"
            src={darkLogo}
            width={width}
            height={height}
            alt=""
            onError={() => setFailed(true)}
          />
        </>
      )}
    </span>
  );
}
