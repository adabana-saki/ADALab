'use client';

export function ScanLines() {
  return (
    <>
      {/* CRT Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-10" />

      {/* Animated scan line */}
      <div className="fixed inset-0 pointer-events-none z-50 scan-line" />
    </>
  );
}
