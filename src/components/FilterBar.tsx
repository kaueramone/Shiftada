"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
]

interface FilterBarProps {
  initialState?: string
  initialCity?: string
}

export default function FilterBar({ initialState = "", initialCity = "" }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [state, setState] = useState(initialState)
  const [city, setCity] = useState(initialCity)

  const hasFilters = !!(searchParams.get("state") || searchParams.get("city"))

  function apply(newState: string, newCity: string) {
    const params = new URLSearchParams()
    if (newState) params.set("state", newState)
    if (newCity.trim()) params.set("city", newCity.trim())
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/")
    })
  }

  function handleStateChange(val: string) {
    setState(val)
    apply(val, city)
  }

  function handleCityKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      apply(state, city)
    }
  }

  function clear() {
    setState("")
    setCity("")
    startTransition(() => {
      router.push("/")
    })
  }

  const selectClass =
    "flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A4491] appearance-none"
  const inputClass =
    "flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A4491] min-w-0"

  return (
    <div className="mb-4">
      <div className="flex gap-2 items-center">
        {/* Estado dropdown */}
        <div className="relative" style={{ minWidth: 90 }}>
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className={selectClass}
            style={{ paddingRight: "2rem" }}
          >
            <option value="">Estado</option>
            {UF_LIST.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
        </div>

        {/* Cidade input */}
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleCityKeyDown}
          placeholder="Cidade..."
          className={inputClass}
        />

        {/* Buscar button */}
        <button
          onClick={() => apply(state, city)}
          className="text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors active:opacity-80 whitespace-nowrap"
          style={{ backgroundColor: "#2A4491" }}
        >
          Buscar
        </button>
      </div>

      {/* Limpar filtros */}
      {hasFilters && (
        <button
          onClick={clear}
          className="mt-2 text-xs text-[#2A4491] font-medium flex items-center gap-1"
        >
          <span>✕</span> Limpar filtros
        </button>
      )}
    </div>
  )
}
