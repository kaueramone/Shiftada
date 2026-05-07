"use client"

import { useState } from "react"

interface StarRatingInputProps {
  name: string
  defaultValue?: number
}

export default function StarRatingInput({ name, defaultValue = 0 }: StarRatingInputProps) {
  const [selected, setSelected] = useState(defaultValue)
  const [hovered, setHovered] = useState(0)

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || selected)
          return (
            <button
              key={star}
              type="button"
              onClick={() => setSelected(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl leading-none transition-transform active:scale-90"
              aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
            >
              {filled ? (
                <span style={{ color: "#f59e0b" }}>★</span>
              ) : (
                <span className="text-gray-300">★</span>
              )}
            </button>
          )
        })}
      </div>
      {selected > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          {selected === 1 && "Muito ruim"}
          {selected === 2 && "Ruim"}
          {selected === 3 && "Regular"}
          {selected === 4 && "Bom"}
          {selected === 5 && "Excelente!"}
        </p>
      )}
    </div>
  )
}
